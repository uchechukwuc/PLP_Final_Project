const mongoose = require('mongoose');

const impactCalculationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    calculationDate: {
        type: Date,
        default: Date.now
    },
    habits: {
        plasticBottlesPerWeek: {
            type: Number,
            default: 0,
            min: 0
        },
        plasticBagsPerWeek: {
            type: Number,
            default: 0,
            min: 0
        },
        strawsPerWeek: {
            type: Number,
            default: 0,
            min: 0
        },
        coffeeCupsPerWeek: {
            type: Number,
            default: 0,
            min: 0
        },
        seafoodMealsPerWeek: {
            type: Number,
            default: 0,
            min: 0
        },
        carTripsPerWeek: {
            type: Number,
            default: 0,
            min: 0
        },
        publicTransportPerWeek: {
            type: Number,
            default: 0,
            min: 0
        },
        recyclingFrequency: {
            type: String,
            enum: ['never', 'rarely', 'sometimes', 'often', 'always'],
            default: 'sometimes'
        },
        compostingFrequency: {
            type: String,
            enum: ['never', 'rarely', 'sometimes', 'often', 'always'],
            default: 'never'
        },
        beachCleanupsPerYear: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    scores: {
        overallImpact: {
            type: Number,
            required: true
        },
        plasticFootprint: {
            type: Number,
            required: true
        },
        seafoodImpact: {
            type: Number,
            required: true
        },
        carbonFootprint: {
            type: Number,
            required: true
        },
        conservationEffort: {
            type: Number,
            required: true
        }
    },
    recommendations: [{
        category: String,
        title: String,
        description: String,
        impact: String,
        difficulty: {
            type: String,
            enum: ['easy', 'moderate', 'challenging']
        },
        potentialReduction: Number
    }],
    weeklyGoals: [{
        habit: String,
        current: Number,
        target: Number,
        unit: String
    }],
    monthlyProgress: [{
        month: String,
        year: Number,
        overallImpact: Number,
        plasticFootprint: Number,
        seafoodImpact: Number
    }],
    achievements: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Badge'
    }]
}, {
    timestamps: true
});

// Create indexes for better performance
impactCalculationSchema.index({ user: 1 });
impactCalculationSchema.index({ calculationDate: -1 });
impactCalculationSchema.index({ 'scores.overallImpact': 1 });

module.exports = mongoose.model('ImpactCalculation', impactCalculationSchema);