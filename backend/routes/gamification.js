const express = require('express');
const User = require('../models/users');
const Badge = require('../models/Badge');
const ImpactCalculation = require('../models/ImpactCalculation');
const PollutionReport = require('../models/PollutionReport');
const CommunityPost = require('../models/CommunityPost');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's badges and achievements
router.get('/badges', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('badges');

        const allBadges = await Badge.find({ isActive: true });

        const userBadges = user.badges || [];
        const availableBadges = allBadges.filter(badge => 
            !userBadges.some(userBadge => userBadge._id.toString() === badge._id.toString())
        );

        res.json({
            earnedBadges: userBadges,
            availableBadges,
            totalBadges: allBadges.length,
            earnedCount: userBadges.length
        });
    } catch (error) {
        console.error('Get badges error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { type = 'points', limit = 50, page = 1 } = req.query;

        let sortOptions = {};
        let selectFields = 'username firstName lastName profilePicture bluePoints level stats';

        switch (type) {
            case 'points':
                sortOptions = { bluePoints: -1 };
                break;
            case 'reports':
                sortOptions = { 'stats.reportsSubmitted': -1 };
                break;
            case 'cleanups':
                sortOptions = { 'stats.cleanupsJoined': -1 };
                break;
            case 'impact':
                // For impact, we need to get the latest impact calculation for each user
                const impactLeaderboard = await ImpactCalculation.aggregate([
                    {
                        $sort: { calculationDate: -1 }
                    },
                    {
                        $group: {
                            _id: '$user',
                            latestImpact: { $first: '$scores.overallImpact' }
                        }
                    },
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'userInfo'
                        }
                    },
                    {
                        $unwind: '$userInfo'
                    },
                    {
                        $project: {
                            username: '$userInfo.username',
                            firstName: '$userInfo.firstName',
                            lastName: '$userInfo.lastName',
                            profilePicture: '$userInfo.profilePicture',
                            bluePoints: '$userInfo.bluePoints',
                            level: '$userInfo.level',
                            impactScore: '$latestImpact'
                        }
                    },
                    {
                        $sort: { impactScore: 1 } // Lower impact score is better
                    },
                    {
                        $limit: parseInt(limit)
                    }
                ]);

                // Add rankings
                const rankedImpactLeaderboard = impactLeaderboard.map((user, index) => ({
                    ...user,
                    rank: index + 1
                }));

                return res.json({
                    leaderboard: rankedImpactLeaderboard,
                    type: 'impact',
                    currentPage: page,
                    totalPages: 1
                });
            default:
                sortOptions = { bluePoints: -1 };
        }

        const users = await User.find({ preferences: { publicProfile: true } })
            .select(selectFields)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const totalUsers = await User.countDocuments({ preferences: { publicProfile: true } });

        // Add rankings
        const rankedUsers = users.map((user, index) => ({
            ...user.toObject(),
            rank: ((parseInt(page) - 1) * parseInt(limit)) + index + 1
        }));

        res.json({
            leaderboard: rankedUsers,
            type,
            currentPage: page,
            totalPages: Math.ceil(totalUsers / limit)
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's statistics and achievements
router.get('/stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user's impact calculations
        const impactCalculations = await ImpactCalculation.find({ user: user._id })
            .sort({ calculationDate: -1 })
            .limit(10);

        // Get user's pollution reports
        const pollutionReports = await PollutionReport.find({ reporter: user._id })
            .sort({ createdAt: -1 })
            .limit(5);

        // Get user's community posts
        const communityPosts = await CommunityPost.find({ author: user._id })
            .sort({ createdAt: -1 })
            .limit(5);

        // Calculate streak and other stats
        const stats = {
            bluePoints: user.bluePoints,
            level: user.level,
            joinDate: user.joinedDate,
            lastActive: user.lastActive,
            reportsSubmitted: user.stats.reportsSubmitted,
            cleanupsJoined: user.stats.cleanupsJoined,
            plasticReduced: user.stats.plasticReduced,
            seafoodChoicesImproved: user.stats.seafoodChoicesImproved,
            badges: user.badges.length,
            impactCalculations: impactCalculations.length,
            communityPosts: communityPosts.length,
            currentStreak: calculateCurrentStreak(user.lastActive),
            bestImpactScore: impactCalculations.length > 0 ? 
                Math.min(...impactCalculations.map(calc => calc.scores.overallImpact)) : null,
            latestImpactScore: impactCalculations.length > 0 ? 
                impactCalculations[0].scores.overallImpact : null
        };

        res.json({ stats });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Award points to user
router.post('/award-points', auth, async (req, res) => {
    try {
        const { points, reason, badgeId } = req.body;

        if (!points || points <= 0) {
            return res.status(400).json({ message: 'Points must be greater than 0' });
        }

        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Award points
        user.bluePoints += points;
        user.lastActive = Date.now();

        // Check for level up
        const newLevel = calculateLevel(user.bluePoints);
        if (newLevel !== user.level) {
            user.level = newLevel;
        }

        // Award badge if provided
        if (badgeId) {
            const badge = await Badge.findById(badgeId);
            if (badge && !user.badges.includes(badgeId)) {
                user.badges.push(badgeId);
            }
        }

        await user.save();

        res.json({
            pointsAwarded: points,
            newTotal: user.bluePoints,
            newLevel: user.level,
            reason
        });
    } catch (error) {
        console.error('Award points error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Check and award badges based on user activity
router.post('/check-badges', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('badges');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const allBadges = await Badge.find({ isActive: true });
        const newBadges = [];

        for (const badge of allBadges) {
            // Skip if user already has this badge
            if (user.badges.some(userBadge => userBadge._id.toString() === badge._id.toString())) {
                continue;
            }

            // Check if user meets badge requirements
            if (await checkBadgeRequirements(user, badge)) {
                user.badges.push(badge._id);
                newBadges.push(badge);
                
                // Award badge points
                user.bluePoints += badge.points;
            }
        }

        // Check for level up
        const newLevel = calculateLevel(user.bluePoints);
        if (newLevel !== user.level) {
            user.level = newLevel;
        }

        await user.save();

        res.json({
            newBadges,
            newLevel: user.level,
            newTotal: user.bluePoints
        });
    } catch (error) {
        console.error('Check badges error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get available rewards/partnerships
router.get('/rewards', async (req, res) => {
    try {
        // Mock data for rewards and partnerships
        // In a real implementation, this would come from a database
        const rewards = [
            {
                id: 1,
                name: 'Eco Store Discount',
                description: '10% off at partner eco-friendly stores',
                pointsCost: 100,
                partner: 'EcoStore',
                category: 'shopping',
                image: 'https://picsum.photos/seed/eco-store/200/150.jpg'
            },
            {
                id: 2,
                name: 'Beach Cleanup Kit',
                description: 'Free cleanup kit with gloves and bags',
                pointsCost: 200,
                partner: 'OceanConservancy',
                category: 'conservation',
                image: 'https://picsum.photos/seed/cleanup-kit/200/150.jpg'
            },
            {
                id: 3,
                name: 'Sustainable Seafood Guide',
                description: 'Printed guide to sustainable seafood choices',
                pointsCost: 50,
                partner: 'MarineStewardshipCouncil',
                category: 'education',
                image: 'https://picsum.photos/seed/seafood-guide/200/150.jpg'
            },
            {
                id: 4,
                name: 'Reusable Water Bottle',
                description: 'Premium stainless steel water bottle',
                pointsCost: 300,
                partner: 'HydroFlask',
                category: 'products',
                image: 'https://picsum.photos/seed/water-bottle/200/150.jpg'
            }
        ];

        res.json({ rewards });
    } catch (error) {
        console.error('Get rewards error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Redeem a reward
router.post('/redeem-reward', auth, async (req, res) => {
    try {
        const { rewardId } = req.body;

        // Mock reward redemption
        // In a real implementation, this would validate against a rewards database
        const rewardCosts = {
            1: 100,
            2: 200,
            3: 50,
            4: 300
        };

        const cost = rewardCosts[rewardId];
        if (!cost) {
            return res.status(404).json({ message: 'Reward not found' });
        }

        const user = await User.findById(req.user._id);
        
        if (user.bluePoints < cost) {
            return res.status(400).json({ message: 'Insufficient points' });
        }

        user.bluePoints -= cost;
        await user.save();

        res.json({
            message: 'Reward redeemed successfully',
            pointsDeducted: cost,
            newBalance: user.bluePoints
        });
    } catch (error) {
        console.error('Redeem reward error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper function to calculate level based on points
function calculateLevel(points) {
    if (points >= 1000) return 'CleanGuard Hero';
    if (points >= 500) return 'Ocean Protector';
    if (points >= 250) return 'Sea Champion';
    if (points >= 100) return 'Marine Guardian';
    return 'Ocean Warrior';
}

// Helper function to calculate current streak
function calculateCurrentStreak(lastActive) {
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const daysDiff = Math.floor((now - lastActiveDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 1;
    if (daysDiff === 1) return 2;
    return 0; // Streak broken
}

// Helper function to check badge requirements
async function checkBadgeRequirements(user, badge) {
    const { requirements } = badge;
    
    switch (requirements.type) {
        case 'reports_submitted':
            return user.stats.reportsSubmitted >= requirements.value;
        
        case 'blue_points_earned':
            return user.bluePoints >= requirements.value;
        
        case 'cleanups_joined':
            return user.stats.cleanupsJoined >= requirements.value;
        
        case 'impact_improved':
            const latestImpact = await ImpactCalculation.findOne({ user: user._id })
                .sort({ calculationDate: -1 });
            return latestImpact && latestImpact.scores.overallImpact <= requirements.value;
        
        case 'consecutive_days':
            const daysSinceJoin = Math.floor((Date.now() - user.joinedDate) / (1000 * 60 * 60 * 24));
            return daysSinceJoin >= requirements.value;
        
        case 'specific_action':
            // Handle specific action badges
            return false; // Implement as needed
        
        default:
            return false;
    }
}

module.exports = router;