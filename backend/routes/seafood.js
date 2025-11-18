const express = require('express');
const axios = require('axios');

const router = express.Router();

// Sample seafood data with sustainability ratings (fallback when APIs fail)
const SAMPLE_SEAFOOD = [
  {
    _id: '1',
    commonName: 'Atlantic Salmon',
    scientificName: 'Salmo salar',
    category: 'fish',
    sustainabilityRating: 'good_alternative',
    rating: 4.2,
    populationStatus: 'improving',
    habitatImpact: 'moderate',
    bycatch: 'low',
    management: 'good',
    fishingMethod: ['farmed', 'line'],
    nutritionalInfo: {
      calories: 206,
      protein: 22,
      omega3: 2260,
      mercury: 'low'
    },
    alternatives: [
      { name: 'Pacific Sardines', reason: 'Better sustainability rating' }
    ],
    cookingTips: ['Grill', 'Bake', 'Smoke'],
    tags: ['marine', 'omega-3', 'protein']
  },
  {
    _id: '2',
    commonName: 'Albacore Tuna',
    scientificName: 'Thunnus alalunga',
    category: 'fish',
    sustainabilityRating: 'good_alternative',
    rating: 3.8,
    populationStatus: 'stable',
    habitatImpact: 'moderate',
    bycatch: 'moderate',
    management: 'good',
    fishingMethod: ['pole', 'troll'],
    nutritionalInfo: {
      calories: 144,
      protein: 25,
      omega3: 1500,
      mercury: 'moderate'
    },
    alternatives: [
      { name: 'Skipjack Tuna', reason: 'Lower mercury levels' }
    ],
    cookingTips: ['Grill', 'Canned', 'Seared'],
    tags: ['marine', 'protein', 'canned']
  },
  {
    _id: '3',
    commonName: 'Bluefin Tuna',
    scientificName: 'Thunnus thynnus',
    category: 'fish',
    sustainabilityRating: 'avoid',
    rating: 1.5,
    populationStatus: 'critical',
    habitatImpact: 'high',
    bycatch: 'high',
    management: 'poor',
    fishingMethod: ['longline'],
    nutritionalInfo: {
      calories: 144,
      protein: 25,
      omega3: 2000,
      mercury: 'high'
    },
    alternatives: [
      { name: 'Albacore Tuna', reason: 'More sustainable option' },
      { name: 'Pacific Sardines', reason: 'Excellent alternative' }
    ],
    cookingTips: ['Sashimi', 'Grill'],
    tags: ['marine', 'high-mercury', 'endangered']
  },
  {
    _id: '4',
    commonName: 'Pacific Cod',
    scientificName: 'Gadus macrocephalus',
    category: 'fish',
    sustainabilityRating: 'best_choice',
    rating: 4.8,
    populationStatus: 'healthy',
    habitatImpact: 'low',
    bycatch: 'low',
    management: 'excellent',
    fishingMethod: ['longline', 'pot'],
    nutritionalInfo: {
      calories: 82,
      protein: 18,
      omega3: 200,
      mercury: 'low'
    },
    alternatives: [],
    cookingTips: ['Bake', 'Fry', 'Fish tacos'],
    tags: ['marine', 'lean', 'versatile']
  },
  {
    _id: '5',
    commonName: 'Shrimp',
    scientificName: 'Pandalus borealis',
    category: 'crustacean',
    sustainabilityRating: 'avoid',
    rating: 2.1,
    populationStatus: 'overfished',
    habitatImpact: 'high',
    bycatch: 'very_high',
    management: 'poor',
    fishingMethod: ['trawl'],
    nutritionalInfo: {
      calories: 99,
      protein: 24,
      omega3: 300,
      mercury: 'low'
    },
    alternatives: [
      { name: 'Spot Prawns', reason: 'Better managed fisheries' },
      { name: 'Pacific Sardines', reason: 'Sustainable alternative' }
    ],
    cookingTips: ['Grill', 'Stir-fry', 'Cocktail'],
    tags: ['marine', 'shellfish', 'trawled']
  },
  {
    _id: '6',
    commonName: 'Pacific Sardines',
    scientificName: 'Sardinops sagax',
    category: 'fish',
    sustainabilityRating: 'best_choice',
    rating: 5.0,
    populationStatus: 'abundant',
    habitatImpact: 'low',
    bycatch: 'very_low',
    management: 'excellent',
    fishingMethod: ['purse_seine'],
    nutritionalInfo: {
      calories: 208,
      protein: 24,
      omega3: 2200,
      mercury: 'low'
    },
    alternatives: [],
    cookingTips: ['Grill', 'Canned', 'Bake'],
    tags: ['marine', 'omega-3', 'affordable', 'canned']
  },
  {
    _id: '7',
    commonName: 'Rainbow Trout',
    scientificName: 'Oncorhynchus mykiss',
    category: 'fish',
    sustainabilityRating: 'good_alternative',
    rating: 4.0,
    populationStatus: 'farmed',
    habitatImpact: 'moderate',
    bycatch: 'none',
    management: 'good',
    fishingMethod: ['farmed'],
    nutritionalInfo: {
      calories: 141,
      protein: 20,
      omega3: 1000,
      mercury: 'low'
    },
    alternatives: [],
    cookingTips: ['Grill', 'Bake', 'Pan-fry'],
    tags: ['freshwater', 'farmed', 'omega-3']
  },
  {
    _id: '8',
    commonName: 'Mussels',
    scientificName: 'Mytilus edulis',
    category: 'mollusk',
    sustainabilityRating: 'best_choice',
    rating: 4.9,
    populationStatus: 'sustainable',
    habitatImpact: 'low',
    bycatch: 'none',
    management: 'excellent',
    fishingMethod: ['farmed', 'diving'],
    nutritionalInfo: {
      calories: 86,
      protein: 12,
      omega3: 790,
      mercury: 'low'
    },
    alternatives: [],
    cookingTips: ['Steam', 'Soup', 'Grill'],
    tags: ['marine', 'bivalve', 'filter-feeder', 'affordable']
  }
];

// @desc    Get all seafood data with filtering and pagination
// @route   GET /api/seafood
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      sustainabilityRating,
      search,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    let seafood = [...SAMPLE_SEAFOOD];

    // Try to fetch from FishBase API first
    try {
      const response = await axios.get('https://fishbase.ropensci.org/sealifebase/species', {
        params: { limit: 50 },
        timeout: 5000
      });

      if (response.data && Array.isArray(response.data)) {
        const fishbaseData = response.data.slice(0, 20).map(item => ({
          _id: item.SpecCode || item.id || Math.random().toString(),
          commonName: item.FBname || item.Species || 'Unknown',
          scientificName: item.ScientificName || `${item.Genus || ''} ${item.Species || ''}`.trim(),
          category: 'fish',
          sustainabilityRating: 'good_alternative',
          rating: 3.5,
          populationStatus: 'unknown',
          habitatImpact: 'unknown',
          bycatch: 'unknown',
          management: 'unknown',
          fishingMethod: ['unknown'],
          nutritionalInfo: {
            calories: 100,
            protein: 20,
            omega3: 500,
            mercury: 'moderate'
          },
          alternatives: [],
          cookingTips: ['Grill', 'Bake'],
          tags: item.Freshwater === 1 ? ['freshwater'] : ['marine']
        }));

        // Merge with sample data
        seafood = [...SAMPLE_SEAFOOD, ...fishbaseData];
      }
    } catch (apiError) {
      console.log('FishBase API unavailable, using sample data');
    }

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      seafood = seafood.filter(item =>
        item.commonName.toLowerCase().includes(searchTerm) ||
        item.scientificName.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply category filter
    if (category) {
      seafood = seafood.filter(item => item.category === category);
    }

    // Apply sustainability rating filter
    if (sustainabilityRating) {
      seafood = seafood.filter(item => item.sustainabilityRating === sustainabilityRating);
    }

    // Sort
    seafood.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'rating':
          aVal = a.rating || 0;
          bVal = b.rating || 0;
          break;
        case 'name':
          aVal = a.commonName.toLowerCase();
          bVal = b.commonName.toLowerCase();
          return sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
        default:
          aVal = a.rating || 0;
          bVal = b.rating || 0;
      }

      if (sortOrder === 'desc') {
        return bVal - aVal;
      }
      return aVal - bVal;
    });

    // Paginate
    const start = (page - 1) * limit;
    const paginatedSeafood = seafood.slice(start, start + limit);

    res.json({
      seafood: paginatedSeafood,
      totalPages: Math.ceil(seafood.length / limit),
      currentPage: parseInt(page),
      total: seafood.length
    });
  } catch (error) {
    console.error('Get seafood error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get seafood by category
// @route   GET /api/seafood/category/:category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    let seafood = SAMPLE_SEAFOOD.filter(item => item.category === category);

    // Try to supplement with FishBase data
    try {
      const response = await axios.get('https://fishbase.ropensci.org/sealifebase/species', {
        params: { limit: 50 },
        timeout: 5000
      });

      if (response.data && Array.isArray(response.data)) {
        const fishbaseData = response.data
          .filter(item => {
            // Map FishBase categories to our categories
            if (category === 'fish') return true; // Most are fish
            if (category === 'crustacean') return item.ScientificName?.toLowerCase().includes('pandalus') || item.Species?.toLowerCase().includes('shrimp');
            if (category === 'mollusk') return item.ScientificName?.toLowerCase().includes('mytilus') || item.Species?.toLowerCase().includes('mussel');
            return false;
          })
          .slice(0, 10)
          .map(item => ({
            _id: item.SpecCode || item.id || Math.random().toString(),
            commonName: item.FBname || item.Species || 'Unknown',
            scientificName: item.ScientificName || `${item.Genus || ''} ${item.Species || ''}`.trim(),
            category: category,
            sustainabilityRating: 'good_alternative',
            rating: 3.5
          }));

        seafood = [...seafood, ...fishbaseData];
      }
    } catch (apiError) {
      console.log('FishBase API unavailable for category filter');
    }

    res.json({ seafood });
  } catch (error) {
    console.error('Get seafood by category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get sustainable seafood recommendations
// @route   GET /api/seafood/recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get best choice and good alternative seafood from sample data
    const recommendations = SAMPLE_SEAFOOD
      .filter(item => item.sustainabilityRating === 'best_choice' || item.sustainabilityRating === 'good_alternative')
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, parseInt(limit));

    // Try to supplement with FishBase data
    try {
      const response = await axios.get('https://fishbase.ropensci.org/sealifebase/species', {
        params: { limit: 20 },
        timeout: 5000
      });

      if (response.data && Array.isArray(response.data)) {
        const fishbaseRecommendations = response.data.slice(0, 5).map(item => ({
          _id: item.SpecCode || item.id || Math.random().toString(),
          commonName: item.FBname || item.Species || 'Unknown',
          scientificName: item.ScientificName || `${item.Genus || ''} ${item.Species || ''}`.trim(),
          category: 'fish',
          sustainabilityRating: 'good_alternative',
          rating: 3.5,
          nutritionalInfo: {
            calories: 100,
            protein: 20,
            omega3: 500,
            mercury: 'moderate'
          }
        }));

        recommendations.push(...fishbaseRecommendations);
      }
    } catch (apiError) {
      console.log('FishBase API unavailable for recommendations');
    }

    res.json({ recommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get seafood to avoid
// @route   GET /api/seafood/avoid
router.get('/avoid', async (req, res) => {
  try {
    // Get seafood rated as "avoid" from sample data
    const avoid = SAMPLE_SEAFOOD.filter(item => item.sustainabilityRating === 'avoid');

    res.json({ avoid });
  } catch (error) {
    console.error('Get avoid list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single seafood by ID
// @route   GET /api/seafood/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First check sample data
    let seafood = SAMPLE_SEAFOOD.find(item => item._id === id);

    if (!seafood) {
      // Try FishBase API
      try {
        const response = await axios.get(`https://fishbase.ropensci.org/sealifebase/species/${id}`, {
          timeout: 5000
        });
        const item = response.data;

        seafood = {
          _id: item.SpecCode || id,
          commonName: item.FBname || item.Species || 'Unknown',
          scientificName: item.ScientificName || `${item.Genus || ''} ${item.Species || ''}`.trim(),
          category: 'fish',
          sustainabilityRating: 'good_alternative',
          rating: 3.5,
          populationStatus: 'unknown',
          habitatImpact: 'unknown',
          bycatch: 'unknown',
          management: 'unknown',
          fishingMethod: ['unknown'],
          nutritionalInfo: {
            calories: 100,
            protein: 20,
            omega3: 500,
            mercury: 'moderate'
          },
          alternatives: [],
          cookingTips: ['Grill', 'Bake'],
          tags: item.Freshwater === 1 ? ['freshwater'] : ['marine']
        };
      } catch (apiError) {
        console.log('FishBase API unavailable for individual seafood');
        return res.status(404).json({ message: 'Seafood not found' });
      }
    }

    res.json({ seafood });
  } catch (error) {
    console.error('Get seafood by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Search seafood
// @route   GET /api/seafood/search/:query
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    const searchTerm = query.toLowerCase();

    let seafood = SAMPLE_SEAFOOD.filter(item =>
      item.commonName.toLowerCase().includes(searchTerm) ||
      item.scientificName.toLowerCase().includes(searchTerm) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    // Try to supplement with FishBase search
    try {
      const response = await axios.get(`https://fishbase.ropensci.org/sealifebase/species/search/${encodeURIComponent(query)}`, {
        timeout: 5000
      });

      if (response.data && Array.isArray(response.data)) {
        const fishbaseData = response.data.slice(0, 5).map(item => ({
          _id: item.SpecCode || item.id || Math.random().toString(),
          commonName: item.FBname || item.Species || 'Unknown',
          scientificName: item.ScientificName || `${item.Genus || ''} ${item.Species || ''}`.trim(),
          category: 'fish',
          sustainabilityRating: 'good_alternative',
          rating: 3.5
        }));

        seafood = [...seafood, ...fishbaseData];
      }
    } catch (apiError) {
      console.log('FishBase search API unavailable');
    }

    // Limit results
    seafood = seafood.slice(0, parseInt(limit));

    res.json({ seafood });
  } catch (error) {
    console.error('Search seafood error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get seafood statistics
// @route   GET /api/seafood/stats
router.get('/stats/overview', async (req, res) => {
  try {
    const total = SAMPLE_SEAFOOD.length;
    const bestChoice = SAMPLE_SEAFOOD.filter(item => item.sustainabilityRating === 'best_choice').length;
    const goodAlternative = SAMPLE_SEAFOOD.filter(item => item.sustainabilityRating === 'good_alternative').length;
    const avoid = SAMPLE_SEAFOOD.filter(item => item.sustainabilityRating === 'avoid').length;

    const categoryBreakdown = {
      fish: SAMPLE_SEAFOOD.filter(item => item.category === 'fish').length,
      crustacean: SAMPLE_SEAFOOD.filter(item => item.category === 'crustacean').length,
      mollusk: SAMPLE_SEAFOOD.filter(item => item.category === 'mollusk').length,
      other: SAMPLE_SEAFOOD.filter(item => item.category === 'other').length
    };

    // Try to supplement with FishBase data
    try {
      const response = await axios.get('https://fishbase.ropensci.org/sealifebase/species', {
        params: { limit: 100 },
        timeout: 5000
      });

      if (response.data && Array.isArray(response.data)) {
        const fishbaseTotal = response.data.length;
        categoryBreakdown.fish += fishbaseTotal; // Assume most are fish
      }
    } catch (apiError) {
      console.log('FishBase API unavailable for stats');
    }

    res.json({
      total: total + (categoryBreakdown.fish - SAMPLE_SEAFOOD.filter(item => item.category === 'fish').length),
      sustainabilityBreakdown: {
        bestChoice,
        goodAlternative,
        avoid
      },
      categoryBreakdown
    });
  } catch (error) {
    console.error('Get seafood stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
