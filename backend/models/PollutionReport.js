const mongoose = require('mongoose');

const pollutionReportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['plastic_waste', 'oil_spill', 'chemical_pollution', 'fishing_gear', 'general_debris'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        required: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true // [longitude, latitude]
        }
    },
    address: {
        type: String,
        required: true
    },
    images: [{
        type: String // URLs to uploaded images
    }],
    status: {
        type: String,
        enum: ['pending', 'verified', 'resolved', 'false_positive'],
        default: 'pending'
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verificationDate: Date,
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolutionDate: Date,
    resolutionNotes: String,
    upvotes: [{
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
        }
    }],
    tags: [String],
    estimatedVolume: {
        type: String,
        enum: ['small', 'medium', 'large', 'extra_large']
    },
    affectedArea: {
        type: Number // in square meters
    },
    weatherConditions: String,
    tideConditions: String
}, {
    timestamps: true
});

// Create indexes for better performance
pollutionReportSchema.index({ location: '2dsphere' });
pollutionReportSchema.index({ reporter: 1 });
pollutionReportSchema.index({ status: 1 });
pollutionReportSchema.index({ type: 1 });
pollutionReportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PollutionReport', pollutionReportSchema);