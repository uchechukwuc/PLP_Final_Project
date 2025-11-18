const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    bluePoints: {
        type: Number,
        default: 0
    },
    level: {
        type: String,
        enum: ['Ocean Warrior', 'Marine Guardian', 'Sea Champion', 'Ocean Protector', 'CleanGuard Hero'],
        default: 'Ocean Warrior'
    },
    badges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
    }],
    joinedDate: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0] // [longitude, latitude]
        }
    },
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        publicProfile: {
            type: Boolean,
            default: true
        },
        locationSharing: {
            type: Boolean,
            default: false
        }
    },
    stats: {
        reportsSubmitted: {
            type: Number,
            default: 0
        },
        cleanupsJoined: {
            type: Number,
            default: 0
        },
        plasticReduced: {
            type: Number,
            default: 0
        },
        seafoodChoicesImproved: {
            type: Number,
            default: 0
        }
    }
});

// Create indexes for better performance
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);