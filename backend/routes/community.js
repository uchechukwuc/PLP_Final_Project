const express = require('express');
const CommunityPost = require('../models/CommunityPost');
const User = require('../models/users');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all community posts with filtering and pagination
router.get('/', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            type, 
            category, 
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const filter = { status: 'published' };
        
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (search) {
            filter.$text = { $search: search };
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        sortOptions.isPinned = -1; // Pinned posts always first

        const posts = await CommunityPost.find(filter)
            .populate('author', 'username firstName lastName profilePicture')
            .populate('likes.user', 'username')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await CommunityPost.countDocuments(filter);

        res.json({
            posts,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get community posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a single community post
router.get('/:id', async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id)
            .populate('author', 'username firstName lastName profilePicture')
            .populate('likes.user', 'username')
            .populate('comments.user', 'username firstName lastName profilePicture')
            .populate('comments.likes.user', 'username');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Increment view count
        await CommunityPost.findByIdAndUpdate(req.params.id, {
            $inc: { views: 1 }
        });

        res.json({ post });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new community post
router.post('/', auth, async (req, res) => {
    try {
        const {
            title,
            content,
            type,
            category,
            tags,
            eventDetails
        } = req.body;

        const post = new CommunityPost({
            author: req.user._id,
            title,
            content,
            type,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            eventDetails
        });

        await post.save();

        // Award points for creating content
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { 
                'bluePoints': 5,
                lastActive: Date.now
            }
        });

        const populatedPost = await CommunityPost.findById(post._id)
            .populate('author', 'username firstName lastName profilePicture');

        res.status(201).json({ post: populatedPost });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Like/Unlike a post
router.post('/:id/like', auth, async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const existingLike = post.likes.find(
            like => like.user.toString() === req.user._id.toString()
        );

        if (existingLike) {
            // Remove like
            post.likes = post.likes.filter(
                like => like.user.toString() !== req.user._id.toString()
            );
        } else {
            // Add like
            post.likes.push({ user: req.user._id });

            // Award points for engaging
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { 'bluePoints': 1 }
            });
        }

        await post.save();
        res.json({ likes: post.likes.length });
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add comment to a post
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const post = await CommunityPost.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({
            user: req.user._id,
            text
        });

        await post.save();

        // Award points for commenting
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { 'bluePoints': 2 }
        });

        const populatedPost = await CommunityPost.findById(req.params.id)
            .populate('comments.user', 'username firstName lastName profilePicture');

        const newComment = populatedPost.comments[populatedPost.comments.length - 1];

        res.json({ comment: newComment });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Like/Unlike a comment
router.post('/:postId/comments/:commentId/like', auth, async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(req.params.commentId);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const existingLike = comment.likes.find(
            like => like.user.toString() === req.user._id.toString()
        );

        if (existingLike) {
            // Remove like
            comment.likes = comment.likes.filter(
                like => like.user.toString() !== req.user._id.toString()
            );
        } else {
            // Add like
            comment.likes.push({ user: req.user._id });
        }

        await post.save();
        res.json({ likes: comment.likes.length });
    } catch (error) {
        console.error('Like comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Join/Leave an event
router.post('/:id/join', auth, async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.type !== 'event') {
            return res.status(400).json({ message: 'This post is not an event' });
        }

        const isParticipant = post.eventDetails.currentParticipants.includes(req.user._id);

        if (isParticipant) {
            // Leave event
            post.eventDetails.currentParticipants = post.eventDetails.currentParticipants.filter(
                participant => participant.toString() !== req.user._id.toString()
            );
        } else {
            // Join event
            if (post.eventDetails.maxParticipants && 
                post.eventDetails.currentParticipants.length >= post.eventDetails.maxParticipants) {
                return res.status(400).json({ message: 'Event is full' });
            }
            
            post.eventDetails.currentParticipants.push(req.user._id);

            // Award points for joining event
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { 
                    'bluePoints': 10,
                    'stats.cleanupsJoined': 1
                }
            });
        }

        await post.save();
        res.json({ 
            isParticipating: !isParticipant,
            participantsCount: post.eventDetails.currentParticipants.length 
        });
    } catch (error) {
        console.error('Join event error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's posts
router.get('/user/:userId', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const posts = await CommunityPost.find({ 
            author: req.params.userId,
            status: 'published'
        })
        .populate('author', 'username firstName lastName profilePicture')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await CommunityPost.countDocuments({ 
            author: req.params.userId,
            status: 'published'
        });

        res.json({
            posts,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get events
router.get('/events/list', async (req, res) => {
    try {
        const { page = 1, limit = 10, upcoming = true } = req.query;
        
        const filter = { 
            type: 'event',
            status: 'published'
        };

        if (upcoming === 'true') {
            filter['eventDetails.startDate'] = { $gte: new Date() };
        }

        const events = await CommunityPost.find(filter)
            .populate('author', 'username firstName lastName profilePicture')
            .sort({ 'eventDetails.startDate': 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await CommunityPost.countDocuments(filter);

        res.json({
            events,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Report a post
router.post('/:id/report', auth, async (req, res) => {
    try {
        const { reason } = req.body;
        
        if (!reason) {
            return res.status(400).json({ message: 'Reason is required' });
        }

        const post = await CommunityPost.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const alreadyReported = post.moderation.reportedBy.some(
            report => report.user.toString() === req.user._id.toString()
        );

        if (alreadyReported) {
            return res.status(400).json({ message: 'You have already reported this post' });
        }

        post.moderation.reportedBy.push({
            user: req.user._id,
            reason
        });

        // If post gets 5+ reports, mark for review
        if (post.moderation.reportedBy.length >= 5) {
            post.moderation.isApproved = false;
        }

        await post.save();
        res.json({ message: 'Post reported successfully' });
    } catch (error) {
        console.error('Report post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get community statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const totalPosts = await CommunityPost.countDocuments({ status: 'published' });
        const totalEvents = await CommunityPost.countDocuments({ 
            type: 'event', 
            status: 'published' 
        });
        const upcomingEvents = await CommunityPost.countDocuments({
            type: 'event',
            status: 'published',
            'eventDetails.startDate': { $gte: new Date() }
        });

        const typeStats = await CommunityPost.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        const categoryStats = await CommunityPost.aggregate([
            { $match: { status: 'published' } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            totalPosts,
            totalEvents,
            upcomingEvents,
            typeBreakdown: typeStats,
            categoryBreakdown: categoryStats
        });
    } catch (error) {
        console.error('Get community stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;