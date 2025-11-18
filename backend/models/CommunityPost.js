const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true,
        maxlength: 2000
    },
    type: {
        type: String,
        enum: ['article', 'event', 'discussion', 'announcement', 'tip', 'success_story'],
        required: true
    },
    category: {
        type: String,
        enum: ['conservation', 'pollution', 'seafood', 'climate', 'education', 'community', 'research'],
        required: true
    },
    images: [{
        type: String
    }],
    videos: [{
        type: String
    }],
    tags: [String],
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        date: {
            type: Date,
            default: Date.now
        },
        likes: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            date: {
                type: Date,
                default: Date.now
            }
        }]
    }],
    shares: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    },
    eventDetails: {
        startDate: Date,
        endDate: Date,
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        },
        address: String,
        maxParticipants: Number,
        currentParticipants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        requirements: [String],
        contactInfo: String
    },
    moderation: {
        isApproved: {
            type: Boolean,
            default: true
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvedDate: Date,
        reportedBy: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            reason: String,
            date: {
                type: Date,
                default: Date.now
            }
        }]
    }
}, {
    timestamps: true
});

// Create indexes for better performance
communityPostSchema.index({ author: 1 });
communityPostSchema.index({ type: 1 });
communityPostSchema.index({ category: 1 });
communityPostSchema.index({ createdAt: -1 });
communityPostSchema.index({ tags: 1 });
communityPostSchema.index({ 'eventDetails.startDate': 1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);