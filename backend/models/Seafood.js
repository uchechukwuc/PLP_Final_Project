const mongoose = require('mongoose');

const seafoodSchema = new mongoose.Schema({
    commonName: {
        type: String,
        required: true,
        trim: true
    },
    scientificName: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['fish', 'shellfish', 'crustacean', 'mollusk', 'other'],
        required: true
    },
    sustainabilityRating: {
        type: String,
        enum: ['best_choice', 'good_alternative', 'avoid', 'unknown'],
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    fishingMethod: [{
        type: String,
        enum: ['pole_and_line', 'troll', 'handline', 'trap', 'dive', 'gillnet', 'trawl', 'dredge', 'longline', 'purse_seine', 'unknown']
    }],
    origin: [{
        region: String,
        country: String,
        specificLocation: String
    }],
    season: [{
        season: String,
        months: [String]
    }],
    populationStatus: {
        type: String,
        enum: ['healthy', 'overfished', 'rebuilding', 'unknown']
    },
    habitatImpact: {
        type: String,
        enum: ['low', 'medium', 'high', 'unknown']
    },
    bycatch: {
        type: String,
        enum: ['low', 'medium', 'high', 'unknown']
    },
    management: {
        type: String,
        enum: ['effective', 'moderately_effective', 'ineffective', 'unknown']
    },
    nutritionalInfo: {
        calories: Number,
        protein: Number,
        omega3: Number,
        mercury: {
            type: String,
            enum: ['low', 'medium', 'high']
        }
    },
    alternatives: [{
        name: String,
        reason: String,
        sustainabilityRating: String
    }],
    cookingTips: [String],
    recipes: [{
        name: String,
        ingredients: [String],
        instructions: String,
        sustainability: String
    }],
    certifications: [{
        name: String,
        description: String,
        logo: String
    }],
    threats: [String],
    conservationStatus: {
        type: String,
        enum: ['least_concern', 'near_threatened', 'vulnerable', 'endangered', 'critically_endangered', 'extinct_in_wild', 'extinct', 'data_deficient']
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    sources: [String],
    images: [{
        type: String // URLs to images
    }],
    tags: [String],
    notes: String
}, {
    timestamps: true
});

// Create indexes for better performance
seafoodSchema.index({ commonName: 'text', scientificName: 'text' });
seafoodSchema.index({ sustainabilityRating: 1 });
seafoodSchema.index({ category: 1 });
seafoodSchema.index({ rating: -1 });
seafoodSchema.index({ 'origin.region': 1 });

module.exports = mongoose.model('Seafood', seafoodSchema);