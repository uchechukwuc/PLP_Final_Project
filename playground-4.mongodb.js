/*
 * MongoDB Playground - CleanGuard Ocean Sustainability Tracker
 * Database: cleanguard
 * Collection: users, pollution_reports, seafood_data
 *
 * This playground demonstrates various MongoDB operations for the CleanGuard application
 * including user management, pollution reporting, and seafood sustainability data.
 */

// Connect to MongoDB
use('cleanguard');

// ==========================================
// USER MANAGEMENT OPERATIONS
// ==========================================

// 1. Create a new user
db.users.insertOne({
  username: "ocean_guardian",
  email: "guardian@oceans.org",
  password: "$2a$10$encryptedpasswordhash", // bcrypt hash
  firstName: "Ocean",
  lastName: "Guardian",
  bluePoints: 150,
  level: "Marine Guardian",
  profilePicture: "https://picsum.photos/seed/avatar/100/100.jpg",
  badges: ["First Report", "Community Helper"],
  stats: {
    reportsSubmitted: 5,
    cleanupsJoined: 2,
    plasticReduced: 25,
    seafoodChoicesImproved: 8,
    communityPosts: 12,
    currentStreak: 7,
    bestImpactScore: 85,
    latestImpactScore: 78
  },
  joinedDate: new Date("2024-01-15"),
  lastActive: new Date(),
  preferences: {
    notifications: true,
    emailUpdates: true,
    publicProfile: false
  }
});

// 2. Find users by level
db.users.find(
  { level: "Marine Guardian" },
  { username: 1, bluePoints: 1, level: 1 }
);

// 3. Update user blue points
db.users.updateOne(
  { username: "ocean_guardian" },
  {
    $inc: { bluePoints: 10 },
    $set: { lastActive: new Date() }
  }
);

// 4. Get top users by blue points
db.users.find(
  {},
  { username: 1, bluePoints: 1, level: 1, _id: 0 }
).sort({ bluePoints: -1 }).limit(10);

// ==========================================
// POLLUTION REPORTING OPERATIONS
// ==========================================

// 5. Create a pollution report
db.pollution_reports.insertOne({
  type: "plastic_waste",
  severity: "high",
  description: "Large accumulation of plastic bottles and bags on beach",
  location: {
    type: "Point",
    coordinates: [-74.0060, 40.7128] // [longitude, latitude]
  },
  address: "Coney Island Beach, Brooklyn, NY",
  estimatedVolume: "large",
  affectedArea: "500 square meters",
  weatherConditions: "Sunny, light breeze",
  tideConditions: "Low tide",
  tags: ["beach", "plastic", "bottles"],
  status: "pending",
  upvotes: [],
  images: ["/uploads/pollution_001.jpg"],
  reporter: {
    _id: ObjectId("507f1f77bcf86cd799439011"),
    username: "ocean_guardian"
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

// 6. Find reports by location (within 10km radius)
db.pollution_reports.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-74.0060, 40.7128]
      },
      $maxDistance: 10000 // 10km in meters
    }
  }
});

// 7. Update report status
db.pollution_reports.updateOne(
  { _id: ObjectId("507f1f77bcf86cd799439011") },
  {
    $set: {
      status: "verified",
      updatedAt: new Date()
    }
  }
);

// 8. Get pollution statistics
db.pollution_reports.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  }
]);

// 9. Find reports by type and severity
db.pollution_reports.find({
  type: "plastic_waste",
  severity: { $in: ["high", "critical"] }
});

// ==========================================
// SEAFOOD SUSTAINABILITY OPERATIONS
// ==========================================

// 10. Insert seafood sustainability data
db.seafood_data.insertMany([
  {
    commonName: "Pacific Salmon",
    scientificName: "Oncorhynchus spp.",
    category: "fish",
    sustainabilityRating: "best_choice",
    rating: 4.8,
    populationStatus: "healthy",
    habitatImpact: "low",
    bycatch: "low",
    management: "excellent",
    fishingMethod: ["troll", "seine"],
    nutritionalInfo: {
      calories: 206,
      protein: 22,
      omega3: 2260,
      mercury: "low"
    },
    alternatives: ["Pacific Sardines"],
    cookingTips: ["Grill", "Bake", "Smoke"],
    tags: ["marine", "omega-3", "sustainable"]
  },
  {
    commonName: "Bluefin Tuna",
    scientificName: "Thunnus thynnus",
    category: "fish",
    sustainabilityRating: "avoid",
    rating: 1.2,
    populationStatus: "critical",
    habitatImpact: "high",
    bycatch: "high",
    management: "poor",
    fishingMethod: ["longline"],
    nutritionalInfo: {
      calories: 144,
      protein: 25,
      omega3: 2000,
      mercury: "high"
    },
    alternatives: ["Albacore Tuna", "Pacific Sardines"],
    cookingTips: ["Sashimi", "Grill"],
    tags: ["marine", "high-mercury", "endangered"]
  }
]);

// 11. Find best choice seafood
db.seafood_data.find(
  { sustainabilityRating: "best_choice" },
  { commonName: 1, rating: 1, category: 1 }
).sort({ rating: -1 });

// 12. Search seafood by name
db.seafood_data.find({
  $or: [
    { commonName: { $regex: "salmon", $options: "i" } },
    { scientificName: { $regex: "salmon", $options: "i" } }
  ]
});

// 13. Get seafood by category
db.seafood_data.find(
  { category: "fish" },
  { commonName: 1, sustainabilityRating: 1, rating: 1 }
);

// ==========================================
// ANALYTICS AND AGGREGATIONS
// ==========================================

// 14. User engagement analytics
db.users.aggregate([
  {
    $group: {
      _id: "$level",
      count: { $sum: 1 },
      avgBluePoints: { $avg: "$bluePoints" },
      totalReports: { $sum: "$stats.reportsSubmitted" }
    }
  },
  { $sort: { avgBluePoints: -1 } }
]);

// 15. Pollution trends by month
db.pollution_reports.aggregate([
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" }
      },
      count: { $sum: 1 },
      types: { $addToSet: "$type" }
    }
  },
  { $sort: { "_id.year": -1, "_id.month": -1 } }
]);

// 16. Seafood sustainability breakdown
db.seafood_data.aggregate([
  {
    $group: {
      _id: "$sustainabilityRating",
      count: { $sum: 1 },
      avgRating: { $avg: "$rating" }
    }
  }
]);

// ==========================================
// INDEXES FOR PERFORMANCE
// ==========================================

// 17. Create indexes for better query performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ bluePoints: -1 });
db.users.createIndex({ level: 1 });

db.pollution_reports.createIndex({ location: "2dsphere" });
db.pollution_reports.createIndex({ status: 1 });
db.pollution_reports.createIndex({ type: 1 });
db.pollution_reports.createIndex({ createdAt: -1 });

db.seafood_data.createIndex({ commonName: "text", scientificName: "text" });
db.seafood_data.createIndex({ sustainabilityRating: 1 });
db.seafood_data.createIndex({ category: 1 });
db.seafood_data.createIndex({ rating: -1 });

// ==========================================
// UTILITY OPERATIONS
// ==========================================

// 18. Clean up old data (example: remove test users)
db.users.deleteMany({
  email: { $regex: "test@example.com" }
});

// 19. Backup collection data
db.pollution_reports.find({}).toArray();

// 20. Get database statistics
db.stats();

// ==========================================
// ADVANCED QUERIES
// ==========================================

// 21. Find users with high engagement (multiple criteria)
db.users.find({
  $and: [
    { bluePoints: { $gte: 100 } },
    { "stats.reportsSubmitted": { $gte: 3 } },
    { lastActive: { $gte: new Date(Date.now() - 30*24*60*60*1000) } } // Active in last 30 days
  ]
});

// 22. Complex pollution analysis
db.pollution_reports.aggregate([
  {
    $match: {
      status: "verified",
      createdAt: { $gte: new Date(Date.now() - 365*24*60*60*1000) } // Last year
    }
  },
  {
    $group: {
      _id: "$type",
      count: { $sum: 1 },
      avgSeverity: {
        $avg: {
          $switch: {
            branches: [
              { case: { $eq: ["$severity", "low"] }, then: 1 },
              { case: { $eq: ["$severity", "medium"] }, then: 2 },
              { case: { $eq: ["$severity", "high"] }, then: 3 },
              { case: { $eq: ["$severity", "critical"] }, then: 4 }
            ],
            default: 2
          }
        }
      }
    }
  },
  { $sort: { count: -1 } }
]);

// 23. User leaderboard with ranking
db.users.aggregate([
  {
    $setWindowFields: {
      sortBy: { bluePoints: -1 },
      output: {
        rank: { $rank: {} }
      }
    }
  },
  {
    $project: {
      username: 1,
      bluePoints: 1,
      level: 1,
      rank: 1
    }
  },
  { $limit: 20 }
]);

print("MongoDB Playground operations completed successfully!");
print("Database: cleanguard");
print("Collections: users, pollution_reports, seafood_data");