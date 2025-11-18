/*
 * MongoDB Local Playground - CleanGuard Ocean Sustainability Tracker
 * Database: cleanguard (Local MongoDB)
 * Connection: mongodb://127.0.0.1:27017/cleanguard
 *
 * This playground is configured for local MongoDB development.
 * Run this in MongoDB Compass or mongosh for local development.
 */

// Connect to local MongoDB
use('cleanguard');

// ==========================================
// QUICK START - BASIC OPERATIONS
// ==========================================

print("=== CleanGuard MongoDB Local Playground ===");
print("Database: cleanguard");
print("Connection: mongodb://127.0.0.1:27017/cleanguard");
print("");

// 1. Check database stats
print("=== Database Statistics ===");
db.stats();
print("");

// 2. List all collections
print("=== Available Collections ===");
db.getCollectionNames().forEach(function(collection) {
    print("- " + collection);
});
print("");

// ==========================================
// USER MANAGEMENT - BASIC OPERATIONS
// ==========================================

print("=== User Management Operations ===");

// Create sample users
db.users.insertMany([
  {
    username: "ocean_guardian",
    email: "guardian@oceans.org",
    password: "$2a$10$encryptedpasswordhash",
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
  },
  {
    username: "marine_researcher",
    email: "researcher@marine.org",
    password: "$2a$10$encryptedpasswordhash2",
    firstName: "Marine",
    lastName: "Researcher",
    bluePoints: 320,
    level: "Sea Champion",
    profilePicture: "https://picsum.photos/seed/researcher/100/100.jpg",
    badges: ["Expert Analyst", "Data Contributor", "Top Reporter"],
    stats: {
      reportsSubmitted: 15,
      cleanupsJoined: 8,
      plasticReduced: 75,
      seafoodChoicesImproved: 20,
      communityPosts: 35,
      currentStreak: 12,
      bestImpactScore: 95,
      latestImpactScore: 92
    },
    joinedDate: new Date("2023-08-20"),
    lastActive: new Date(),
    preferences: {
      notifications: true,
      emailUpdates: false,
      publicProfile: true
    }
  }
]);

print("✓ Sample users created");

// Find users
print("=== Current Users ===");
db.users.find({}, {
  username: 1,
  firstName: 1,
  lastName: 1,
  bluePoints: 1,
  level: 1,
  _id: 0
}).forEach(function(user) {
    print(user.username + " - " + user.level + " (" + user.bluePoints + " pts)");
});
print("");

// ==========================================
// POLLUTION REPORTS - BASIC OPERATIONS
// ==========================================

print("=== Pollution Reports Operations ===");

// Create sample pollution reports
db.pollution_reports.insertMany([
  {
    type: "plastic_waste",
    severity: "high",
    description: "Large accumulation of plastic bottles and bags on Coney Island Beach",
    location: {
      type: "Point",
      coordinates: [-73.9928, 40.5755] // [longitude, latitude]
    },
    address: "Coney Island Beach, Brooklyn, NY",
    estimatedVolume: "large",
    affectedArea: "500 square meters",
    weatherConditions: "Sunny, light breeze",
    tideConditions: "Low tide",
    tags: ["beach", "plastic", "bottles"],
    status: "verified",
    upvotes: ["ocean_guardian", "marine_researcher"],
    images: ["/uploads/pollution_001.jpg"],
    reporter: {
      username: "ocean_guardian"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    type: "oil_spill",
    severity: "critical",
    description: "Oil slick observed in Hudson River near Battery Park",
    location: {
      type: "Point",
      coordinates: [-74.0134, 40.7033]
    },
    address: "Hudson River, Battery Park, Manhattan, NY",
    estimatedVolume: "extra_large",
    affectedArea: "2000 square meters",
    weatherConditions: "Overcast, calm winds",
    tideConditions: "Incoming tide",
    tags: ["river", "oil", "emergency"],
    status: "pending",
    upvotes: ["marine_researcher"],
    images: [],
    reporter: {
      username: "marine_researcher"
    },
    createdAt: new Date(Date.now() - 2*60*60*1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 2*60*60*1000)
  }
]);

print("✓ Sample pollution reports created");

// Find recent reports
print("=== Recent Pollution Reports ===");
db.pollution_reports.find({}, {
  type: 1,
  severity: 1,
  address: 1,
  status: 1,
  createdAt: 1,
  _id: 0
}).sort({ createdAt: -1 }).forEach(function(report) {
    print(report.type + " (" + report.severity + ") - " + report.address);
});
print("");

// ==========================================
// SEAFOOD DATA - BASIC OPERATIONS
// ==========================================

print("=== Seafood Data Operations ===");

// Create sample seafood data
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

print("✓ Sample seafood data created");

// Find sustainable seafood
print("=== Best Choice Seafood ===");
db.seafood_data.find(
  { sustainabilityRating: "best_choice" },
  { commonName: 1, rating: 1, category: 1, _id: 0 }
).sort({ rating: -1 }).forEach(function(seafood) {
    print(seafood.commonName + " - Rating: " + seafood.rating + "/5");
});
print("");

// ==========================================
// ANALYTICS - BASIC OPERATIONS
// ==========================================

print("=== Basic Analytics ===");

// User statistics
print("=== User Statistics ===");
var userStats = db.users.aggregate([
  {
    $group: {
      _id: null,
      totalUsers: { $sum: 1 },
      avgBluePoints: { $avg: "$bluePoints" },
      totalBluePoints: { $sum: "$bluePoints" }
    }
  }
]).toArray();

if (userStats.length > 0) {
  var stats = userStats[0];
  print("Total Users: " + stats.totalUsers);
  print("Average Blue Points: " + Math.round(stats.avgBluePoints));
  print("Total Blue Points: " + stats.totalBluePoints);
}
print("");

// Pollution statistics
print("=== Pollution Report Statistics ===");
var pollutionStats = db.pollution_reports.aggregate([
  {
    $group: {
      _id: "$status",
      count: { $sum: 1 }
    }
  }
]).toArray();

pollutionStats.forEach(function(stat) {
  print(stat._id + " reports: " + stat.count);
});
print("");

// ==========================================
// INDEXES - PERFORMANCE OPTIMIZATION
// ==========================================

print("=== Creating Performance Indexes ===");

// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ bluePoints: -1 });
db.users.createIndex({ level: 1 });

print("✓ User indexes created");

// Pollution report indexes
db.pollution_reports.createIndex({ location: "2dsphere" });
db.pollution_reports.createIndex({ status: 1 });
db.pollution_reports.createIndex({ type: 1 });
db.pollution_reports.createIndex({ createdAt: -1 });

print("✓ Pollution report indexes created");

// Seafood data indexes
db.seafood_data.createIndex({ commonName: "text", scientificName: "text" });
db.seafood_data.createIndex({ sustainabilityRating: 1 });
db.seafood_data.createIndex({ category: 1 });
db.seafood_data.createIndex({ rating: -1 });

print("✓ Seafood data indexes created");

// ==========================================
// CLEANUP - UTILITY OPERATIONS
// ==========================================

print("=== Cleanup Operations ===");

// Remove test data (uncomment to use)
// db.users.deleteMany({ email: { $regex: "test@" } });
// db.pollution_reports.deleteMany({ status: "test" });

print("✓ Cleanup operations ready");

// ==========================================
// SUMMARY
// ==========================================

print("");
print("=== Playground Setup Complete ===");
print("✓ Sample data inserted");
print("✓ Indexes created");
print("✓ Analytics ready");
print("");
print("Collections created:");
db.getCollectionNames().forEach(function(collection) {
    var count = db[collection].countDocuments();
    print("- " + collection + ": " + count + " documents");
});
print("");
print("Ready for development and testing!");
print("Use MongoDB Compass to explore the data visually.");