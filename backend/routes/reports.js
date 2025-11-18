const express = require('express');
const multer = require('multer');
const path = require('path');
const PollutionReport = require('../models/PollutionReport');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        files: 5, // Max 5 files
        fileSize: 5 * 1024 * 1024 // 5MB per file
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Get all pollution reports
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, type, status, severity } = req.query;
        const filter = {};
        
        if (type) filter.type = type;
        if (status) filter.status = status;
        if (severity) filter.severity = severity;

        const reports = await PollutionReport.find(filter)
            .populate('reporter', 'username firstName lastName profilePicture')
            .populate('verifiedBy', 'username')
            .populate('resolvedBy', 'username')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await PollutionReport.countDocuments(filter);

        res.json({
            reports,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get pollution reports by location (for map)
router.get('/map', async (req, res) => {
    try {
        const { 
            lat, 
            lng, 
            radius = 10, // radius in kilometers
            type,
            status
        } = req.query;

        const filter = { status: { $ne: 'false_positive' } };
        
        if (type) filter.type = type;
        if (status) filter.status = status;

        if (lat && lng) {
            filter.location = {
                $geoWithin: {
                    $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius / 6371]
                }
            };
        }

        const reports = await PollutionReport.find(filter)
            .populate('reporter', 'username')
            .select('type severity location address description createdAt status images')
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({ reports });
    } catch (error) {
        console.error('Get map reports error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new pollution report
router.post('/', auth, upload.array('images', 5), async (req, res) => {
    try {
        const {
            type,
            severity,
            description,
            latitude,
            longitude,
            address,
            estimatedVolume,
            affectedArea,
            weatherConditions,
            tideConditions,
            tags
        } = req.body;

        // Create image URLs
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const report = new PollutionReport({
            reporter: req.user._id,
            type,
            severity,
            description,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            address,
            images,
            estimatedVolume,
            affectedArea,
            weatherConditions,
            tideConditions,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        await report.save();

        // Award points to reporter
        const User = require('../models/users');
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { 
                'stats.reportsSubmitted': 1,
                'bluePoints': 10
            },
            $set: { lastActive: Date.now() }
        });

        const populatedReport = await PollutionReport.findById(report._id)
            .populate('reporter', 'username firstName lastName profilePicture');

        res.status(201).json({ report: populatedReport });
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a single pollution report
router.get('/:id', async (req, res) => {
    try {
        const report = await PollutionReport.findById(req.params.id)
            .populate('reporter', 'username firstName lastName profilePicture')
            .populate('verifiedBy', 'username firstName lastName')
            .populate('resolvedBy', 'username firstName lastName')
            .populate('upvotes.user', 'username')
            .populate('comments.user', 'username firstName lastName profilePicture');

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json({ report });
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upvote a report
router.post('/:id/upvote', auth, async (req, res) => {
    try {
        const report = await PollutionReport.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Check if user already upvoted
        const alreadyUpvoted = report.upvotes.some(
            upvote => upvote.user.toString() === req.user._id.toString()
        );

        if (alreadyUpvoted) {
            // Remove upvote
            report.upvotes = report.upvotes.filter(
                upvote => upvote.user.toString() !== req.user._id.toString()
            );
        } else {
            // Add upvote
            report.upvotes.push({ user: req.user._id });
            
            // Award points for upvoting
            const User = require('../models/users');
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { 'bluePoints': 1 },
                $set: { lastActive: Date.now() }
            });
        }

        await report.save();
        res.json({ upvotes: report.upvotes.length });
    } catch (error) {
        console.error('Upvote error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add comment to a report
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const report = await PollutionReport.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.comments.push({
            user: req.user._id,
            text
        });

        await report.save();

        // Award points for commenting
        const User = require('../models/users');
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { 'bluePoints': 2 },
            $set: { lastActive: Date.now() }
        });

        const populatedReport = await PollutionReport.findById(req.params.id)
            .populate('comments.user', 'username firstName lastName profilePicture');

        res.json({ 
            comment: populatedReport.comments[populatedReport.comments.length - 1]
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update report status (for moderators/admins)
router.put('/:id/status', auth, async (req, res) => {
    try {
        const { status, verificationNotes } = req.body;
        
        if (!['pending', 'verified', 'resolved', 'false_positive'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const report = await PollutionReport.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.status = status;
        
        if (status === 'verified') {
            report.verifiedBy = req.user._id;
            report.verificationDate = Date.now();
        } else if (status === 'resolved') {
            report.resolvedBy = req.user._id;
            report.resolutionDate = Date.now();
            report.resolutionNotes = verificationNotes;
            
            // Award bonus points for resolving
            const User = require('../models/users');
            await User.findByIdAndUpdate(report.reporter, {
                $inc: { 'bluePoints': 20 }
            });
        }

        await report.save();

        res.json({ report });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's reports
router.get('/user/:userId', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const reports = await PollutionReport.find({ reporter: req.params.userId })
            .populate('reporter', 'username firstName lastName profilePicture')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await PollutionReport.countDocuments({ reporter: req.params.userId });

        res.json({
            reports,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get user reports error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;