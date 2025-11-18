const express = require('express');
const ImpactCalculation = require('../models/ImpactCalculation');
const User = require('../models/users');
const auth = require('../middleware/auth');

const router = express.Router();

// Calculate user's ocean impact
router.post('/calculate', auth, async (req, res) => {
    try {
        const { habits } = req.body;

        // Validate habits data
        const requiredFields = [
            'plasticBottlesPerWeek',
            'plasticBagsPerWeek', 
            'strawsPerWeek',
            'coffeeCupsPerWeek',
            'seafoodMealsPerWeek',
            'carTripsPerWeek',
            'publicTransportPerWeek',
            'recyclingFrequency',
            'compostingFrequency',
            'beachCleanupsPerYear'
        ];

        for (const field of requiredFields) {
            if (habits[field] === undefined || habits[field] === null) {
                return res.status(400).json({ message: `Missing required field: ${field}` });
            }
        }

        // Calculate impact scores
        const scores = calculateImpactScores(habits);
        
        // Generate recommendations
        const recommendations = generateRecommendations(habits, scores);
        
        // Create weekly goals
        const weeklyGoals = generateWeeklyGoals(habits, scores);

        // Create new impact calculation
        const impactCalculation = new ImpactCalculation({
            user: req.user._id,
            habits,
            scores,
            recommendations,
            weeklyGoals
        });

        await impactCalculation.save();

        // Update user stats
        await User.findByIdAndUpdate(req.user._id, {
            $set: { lastActive: Date.now }
        });

        // Award points for completing calculation
        if (scores.overallImpact < 50) {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { 'bluePoints': 5 }
            });
        }

        res.status(201).json({
            impact: impactCalculation,
            message: 'Impact calculation completed successfully'
        });
    } catch (error) {
        console.error('Calculate impact error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's impact history
router.get('/history', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const calculations = await ImpactCalculation.find({ user: req.user._id })
            .sort({ calculationDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await ImpactCalculation.countDocuments({ user: req.user._id });

        res.json({
            calculations,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get impact history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's latest impact calculation
router.get('/latest', auth, async (req, res) => {
    try {
        const latestCalculation = await ImpactCalculation.findOne({ user: req.user._id })
            .sort({ calculationDate: -1 });

        if (!latestCalculation) {
            return res.status(404).json({ message: 'No impact calculation found' });
        }

        res.json({ impact: latestCalculation });
    } catch (error) {
        console.error('Get latest impact error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's monthly progress
router.get('/progress', auth, async (req, res) => {
    try {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const calculations = await ImpactCalculation.find({
            user: req.user._id,
            calculationDate: {
                $gte: new Date(currentYear, currentMonth, 1),
                $lt: new Date(currentYear, currentMonth + 1, 1)
            }
        }).sort({ calculationDate: 1 });

        if (calculations.length === 0) {
            return res.json({ progress: null, message: 'No data available for this month' });
        }

        const progress = {
            month: new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' }),
            year: currentYear,
            calculations: calculations.length,
            averageImpact: calculations.reduce((sum, calc) => sum + calc.scores.overallImpact, 0) / calculations.length,
            bestImpact: Math.min(...calculations.map(calc => calc.scores.overallImpact)),
            worstImpact: Math.max(...calculations.map(calc => calc.scores.overallImpact)),
            trend: calculations.length > 1 ? 
                calculations[calculations.length - 1].scores.overallImpact - calculations[0].scores.overallImpact : 0
        };

        res.json({ progress });
    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user goals
router.put('/goals', auth, async (req, res) => {
    try {
        const { weeklyGoals } = req.body;

        const latestCalculation = await ImpactCalculation.findOne({ user: req.user._id })
            .sort({ calculationDate: -1 });

        if (!latestCalculation) {
            return res.status(404).json({ message: 'No impact calculation found' });
        }

        latestCalculation.weeklyGoals = weeklyGoals;
        await latestCalculation.save();

        res.json({ 
            message: 'Goals updated successfully',
            goals: latestCalculation.weeklyGoals 
        });
    } catch (error) {
        console.error('Update goals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get impact comparison with community averages
router.get('/comparison', auth, async (req, res) => {
    try {
        const userLatest = await ImpactCalculation.findOne({ user: req.user._id })
            .sort({ calculationDate: -1 });

        if (!userLatest) {
            return res.status(404).json({ message: 'No impact calculation found' });
        }

        // Get community averages
        const communityStats = await ImpactCalculation.aggregate([
            {
                $group: {
                    _id: null,
                    avgOverallImpact: { $avg: '$scores.overallImpact' },
                    avgPlasticFootprint: { $avg: '$scores.plasticFootprint' },
                    avgSeafoodImpact: { $avg: '$scores.seafoodImpact' },
                    avgCarbonFootprint: { $avg: '$scores.carbonFootprint' },
                    avgConservationEffort: { $avg: '$scores.conservationEffort' }
                }
            }
        ]);

        const communityAvg = communityStats[0] || {
            avgOverallImpact: 50,
            avgPlasticFootprint: 50,
            avgSeafoodImpact: 50,
            avgCarbonFootprint: 50,
            avgConservationEffort: 50
        };

        const comparison = {
            user: {
                overallImpact: userLatest.scores.overallImpact,
                plasticFootprint: userLatest.scores.plasticFootprint,
                seafoodImpact: userLatest.scores.seafoodImpact,
                carbonFootprint: userLatest.scores.carbonFootprint,
                conservationEffort: userLatest.scores.conservationEffort
            },
            community: communityAvg,
            rankings: {
                overallImpact: calculatePercentile(userLatest.scores.overallImpact, 'overallImpact'),
                plasticFootprint: calculatePercentile(userLatest.scores.plasticFootprint, 'plasticFootprint'),
                seafoodImpact: calculatePercentile(userLatest.scores.seafoodImpact, 'seafoodImpact'),
                carbonFootprint: calculatePercentile(userLatest.scores.carbonFootprint, 'carbonFootprint'),
                conservationEffort: calculatePercentile(userLatest.scores.conservationEffort, 'conservationEffort')
            }
        };

        res.json({ comparison });
    } catch (error) {
        console.error('Get comparison error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper function to calculate impact scores
function calculateImpactScores(habits) {
    // Plastic footprint calculation (0-100, lower is better)
    const plasticScore = Math.min(100, 
        (habits.plasticBottlesPerWeek * 8) +
        (habits.plasticBagsPerWeek * 5) +
        (habits.strawsPerWeek * 2) +
        (habits.coffeeCupsPerWeek * 3)
    );

    // Seafood impact calculation (0-100, lower is better)
    const seafoodScore = Math.min(100, habits.seafoodMealsPerWeek * 6);

    // Carbon footprint calculation (0-100, lower is better)
    const carbonScore = Math.min(100, 
        (habits.carTripsPerWeek * 4) - 
        (habits.publicTransportPerWeek * 2)
    );

    // Conservation effort calculation (0-100, higher is better)
    const recyclingScore = getFrequencyScore(habits.recyclingFrequency);
    const compostingScore = getFrequencyScore(habits.compostingFrequency);
    const cleanupScore = Math.min(20, habits.beachCleanupsPerYear * 4);
    const conservationScore = recyclingScore + compostingScore + cleanupScore;

    // Overall impact calculation (weighted average)
    const overallImpact = (
        (plasticScore * 0.3) +
        (seafoodScore * 0.25) +
        (carbonScore * 0.25) +
        (Math.max(0, 100 - conservationScore) * 0.2)
    );

    return {
        overallImpact: Math.round(overallImpact),
        plasticFootprint: Math.round(plasticScore),
        seafoodImpact: Math.round(seafoodScore),
        carbonFootprint: Math.round(carbonScore),
        conservationEffort: Math.round(conservationScore)
    };
}

// Helper function to get frequency score
function getFrequencyScore(frequency) {
    const scores = {
        'never': 0,
        'rarely': 5,
        'sometimes': 15,
        'often': 25,
        'always': 35
    };
    return scores[frequency] || 0;
}

// Helper function to generate recommendations
function generateRecommendations(habits, scores) {
    const recommendations = [];

    if (habits.plasticBottlesPerWeek > 3) {
        recommendations.push({
            category: 'plastic',
            title: 'Reduce Plastic Bottle Usage',
            description: 'Switch to a reusable water bottle to save approximately 156 plastic bottles per year.',
            impact: `Reduce your plastic footprint by ${habits.plasticBottlesPerWeek * 8} points`,
            difficulty: 'easy',
            potentialReduction: habits.plasticBottlesPerWeek * 8
        });
    }

    if (habits.plasticBagsPerWeek > 2) {
        recommendations.push({
            category: 'plastic',
            title: 'Use Reusable Shopping Bags',
            description: 'Bring reusable bags when shopping to eliminate single-use plastic bags.',
            impact: `Reduce your plastic footprint by ${habits.plasticBagsPerWeek * 5} points`,
            difficulty: 'easy',
            potentialReduction: habits.plasticBagsPerWeek * 5
        });
    }

    if (habits.seafoodMealsPerWeek > 4) {
        recommendations.push({
            category: 'seafood',
            title: 'Choose Sustainable Seafood',
            description: 'Look for sustainably sourced seafood and consider meat alternatives.',
            impact: `Reduce your seafood impact by ${habits.seafoodMealsPerWeek * 2} points`,
            difficulty: 'moderate',
            potentialReduction: habits.seafoodMealsPerWeek * 2
        });
    }

    if (habits.recyclingFrequency === 'never' || habits.recyclingFrequency === 'rarely') {
        recommendations.push({
            category: 'conservation',
            title: 'Start Recycling',
            description: 'Set up a recycling system at home and recycle paper, plastic, glass, and metal.',
            impact: 'Increase your conservation effort by 15 points',
            difficulty: 'easy',
            potentialReduction: 15
        });
    }

    if (habits.carTripsPerWeek > 10) {
        recommendations.push({
            category: 'carbon',
            title: 'Reduce Car Usage',
            description: 'Consider carpooling, public transport, or cycling for shorter trips.',
            impact: `Reduce your carbon footprint by ${habits.carTripsPerWeek * 2} points`,
            difficulty: 'moderate',
            potentialReduction: habits.carTripsPerWeek * 2
        });
    }

    return recommendations;
}

// Helper function to generate weekly goals
function generateWeeklyGoals(habits, scores) {
    const goals = [];

    if (habits.plasticBottlesPerWeek > 0) {
        goals.push({
            habit: 'plasticBottlesPerWeek',
            current: habits.plasticBottlesPerWeek,
            target: Math.max(0, habits.plasticBottlesPerWeek - 1),
            unit: 'bottles'
        });
    }

    if (habits.plasticBagsPerWeek > 0) {
        goals.push({
            habit: 'plasticBagsPerWeek',
            current: habits.plasticBagsPerWeek,
            target: Math.max(0, habits.plasticBagsPerWeek - 1),
            unit: 'bags'
        });
    }

    if (habits.recyclingFrequency === 'never') {
        goals.push({
            habit: 'recyclingFrequency',
            current: 'never',
            target: 'sometimes',
            unit: 'frequency'
        });
    }

    return goals;
}

// Helper function to calculate percentile (simplified)
function calculatePercentile(userScore, scoreType) {
    // This is a simplified calculation
    // In a real implementation, you would query all users and calculate actual percentiles
    const avgScore = 50;
    const percentile = Math.round(100 - ((userScore - avgScore) / avgScore) * 50);
    return Math.max(0, Math.min(100, percentile));
}

module.exports = router;