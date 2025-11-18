const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 200
    },
    icon: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['reporting', 'conservation', 'community', 'impact', 'milestone'],
        required: true
    },
    points: {
        type: Number,
        required: true,
        default: 0
    },
    requirements: {
        type: {
            type: String,
            enum: ['reports_submitted', 'blue_points_earned', 'cleanups_joined', 'impact_improved', 'consecutive_days', 'specific_action']
        },
        value: Number,
        action: String
    },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Badge', badgeSchema);