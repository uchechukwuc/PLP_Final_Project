https://cleanguard.vercel.app/

# 🌊 CleanGuard - Ocean Sustainability Tracker (Life Under the Water)

A comprehensive full-stack web application designed to monitor and address ocean pollution while promoting sustainable seafood choices. The platform allows users to track pollution levels in various bodies of water, including plastic waste, chemical contaminants, and other harmful substances affecting marine ecosystems. Through a detailed dashboard, users can access real-time data, visualize trends, and gain insights into the health of marine life. The app also guides consumers in making environmentally responsible seafood choices by providing information on sustainable fishing practices and eco-friendly seafood sources.

In addition, the application incorporates gamification features to encourage active participation in environmental conservation. Users can earn points, badges, and rewards for logging observations, reporting pollution incidents, completing sustainability challenges, or contributing to educational campaigns. By combining data monitoring, consumer guidance, and interactive incentives, the app empowers individuals, communities, and organizations to actively protect and preserve marine ecosystems and the life under water." 

## 📋 Table of Contents

- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Frontend Pages](#frontend-pages)
- [Contributing](#contributing)

---

## 🎯 Problem Statement

**Marine ecosystems face critical threats:**
- Overfishing depletes fish populations
- Plastic pollution endangers marine life
- Lack of awareness about sustainable practices
- Individuals don't understand their ocean impact

## 💡 Solution

CleanGuard is a **community-driven platform** that:
- ✅ Tracks marine pollution globally
- ✅ Educates users about sustainable seafood
- ✅ Calculates personal environmental impact
- ✅ Rewards eco-friendly behavior
- ✅ Builds a community of ocean protectors

---

## 🔑 Key Features

### 1. **Marine Pollution Tracker** 🗺️
- Report plastic waste, oil spills, and pollution
- Location tagging with Leaflet Maps
- Photo upload capability
- Live global "Ocean Health Map"
- Severity classification
- Status tracking (Reported → Verified → Resolved)

### 2. **Sustainable Seafood Guide** 🐟
- Searchable database of 500+ seafood species
- Real-time sustainability status
- Integration with FishBase API
- Eco-friendly alternatives suggestions
- Stock status and fishing methods
- Mercury level indicators

### 3. **Personal Impact Calculator** 📊
- Input weekly habits:
  - Plastic bottle usage
  - Seafood consumption
  - Recycling frequency
  - Transportation miles
- Calculate "Ocean Impact Score"
- Personalized reduction tips
- Progress tracking over time

### 4. **Gamification & Rewards** 🏆
- Earn "Blue Points" for actions:
  - Reporting pollution: +10-50 points
  - Verified reports: +25 bonus
  - Pledges: +15 points
  - Beach cleanups: +100 points
- Badge system (Bronze → Gold → Platinum)
- Global and regional leaderboards
- Level progression system
- Partner discounts and rewards

### 5. **Community & Education Hub** 💡
- Conservation articles and guides
- Infographics and videos
- Beach cleanup organizer
- Campaign collaboration
- User forums and discussions
- Success stories

---

## 🛠️ Tech Stack

### **Frontend**
- **React** 18.2 - UI library
- **React Router** 6.20 - Navigation
- **Leaflet** + **React-Leaflet** - Interactive maps
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Icons** - Icon library
- **CSS3** - Styling

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** 4.18 - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

### **APIs**
- **Leaflet API** - Location-based mapping
- **FishBase API** - Seafood database
- **Marine Conservation Society API** - Sustainability data

### **Security & Tools**
- **Helmet** - Security headers
- **Express Rate Limit** - DDoS protection
- **CORS** - Cross-origin requests
- **Morgan** - HTTP logging
- **Nodemon** - Development server

---

## 📁 Project Structure

```
cleanguard-ocean-tracker/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── reportController.js   # Report operations
│   │   ├── seafoodController.js  # Seafood database
│   │   └── userController.js     # User operations
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   ├── errorHandler.js       # Error handling
│   │   └── upload.js             # File upload
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Report.js             # Report schema
│   │   ├── Seafood.js            # Seafood schema
│   │   ├── Badge.js              # Badge schema
│   │   └── Article.js            # Article schema
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   ├── reports.js            # Report routes
│   │   ├── seafood.js            # Seafood routes
│   │   ├── users.js              # User routes
│   │   └── community.js          # Community routes
│   ├── utils/
│   │   ├── apiFeatures.js        # Query helpers
│   │   └── geocoder.js           # Geocoding
│   ├── uploads/                   # Uploaded files
│   └── server.js                  # Entry point
│
├── client/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── PrivateRoute.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── map/
│   │   │   │   ├── PollutionMap.jsx
│   │   │   │   ├── ReportMarker.jsx
│   │   │   │   └── MapFilters.jsx
│   │   │   ├── seafood/
│   │   │   │   ├── SeafoodSearch.jsx
│   │   │   │   ├── SeafoodCard.jsx
│   │   │   │   └── AlternativesModal.jsx
│   │   │   ├── impact/
│   │   │   │   ├── ImpactCalculator.jsx
│   │   │   │   ├── ImpactChart.jsx
│   │   │   │   └── TipsPanel.jsx
│   │   │   ├── gamification/
│   │   │   │   ├── Leaderboard.jsx
│   │   │   │   ├── BadgeDisplay.jsx
│   │   │   │   └── PointsTracker.jsx
│   │   │   └── community/
│   │   │       ├── ArticleList.jsx
│   │   │       ├── CleanupOrganizer.jsx
│   │   │       └── Forum.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ReportPollution.jsx
│   │   │   ├── SeafoodGuide.jsx
│   │   │   ├── ImpactPage.jsx
│   │   │   ├── Community.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── reportService.js
│   │   │   └── seafoodService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   └── components.css
│   │   ├── App.jsx
│   │   └── index.jsx
│   └── package.json
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js v18+ 
- MongoDB v5.0+
- npm or yarn
- Git

### Step 1: Clone Repository
```bash
git clone https://github.com/uchechukwuc/PLP_Final_Project.git

```

### Step 2: Install Dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd Frontend
npm install
cd ..
```

---

## ⚙️ Environment Setup

### Create .env file in root directory:
```bash
cp .env.example .env
```

### Configure environment variables:
```env
NODE_ENV=development
PORT=5001

# MongoDB
MONGODB_URI=your mongodb uri

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d

# API Keys
FISHBASE_API_KEY=your_key_here


# File Upload
MAX_FILE_SIZE=5000000
FILE_UPLOAD_PATH=./uploads

# Frontend
CLIENT_URL=http://localhost:3000
```

---

## 🗄️ Database Setup

### Start MongoDB:
```bash
# MacOS/Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Seed Database (Optional):
```bash
npm run seed
```

This will populate:
- 50+ seafood species
- Sample reports
- Test users
- Badge definitions

---

## ▶️ Running the Application

### Development Mode (Both servers):
```bash
npm run dev
```

This runs:
- Backend: `http://localhost:5001`
- Frontend: `http://localhost:3000`

### Run Separately:

**Backend only:**
```bash
npm run dev
```

**Frontend only:**
```bash
npm run dev
```

### Production Build:
```bash
npm run build
npm start
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5001/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "location": {
    "city": "Miami",
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1...",
    "name": "John Doe",
    "email": "john@example.com",
    "bluePoints": 50,
    "level": 1
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

### Report Endpoints

#### Create Report
```http
POST /api/reports
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "type": "Plastic",
  "title": "Beach Pollution",
  "description": "Large amount of plastic bottles",
  "location": {
    "type": "Point",
    "coordinates": [-80.1918, 25.7617],
    "city": "Miami"
  },
  "severity": "High",
  "photos": [<file>]
}
```

#### Get All Reports
```http
GET /api/reports?page=1&limit=10&type=Plastic&severity=High
```

#### Get Reports Near Location
```http
GET /api/reports/radius/25.7617/-80.1918/10
```
Returns reports within 10km radius

#### Update Report Status
```http
PUT /api/reports/:id/status
Authorization: Bearer <token>

{
  "status": "Verified"
}
```

---

### Seafood Endpoints

#### Search Seafood
```http
GET /api/seafood/search?q=tuna
```

#### Get Seafood Details
```http
GET /api/seafood/:id
```

#### Get Alternatives
```http
GET /api/seafood/:id/alternatives
```

---

### User Endpoints

#### Get Leaderboard
```http
GET /api/users/leaderboard?limit=10
```

#### Update Impact Score
```http
PUT /api/users/impact
Authorization: Bearer <token>

{
  "habits": {
    "plasticBottles": 5,
    "seafoodMeals": 3,
    "recycleFrequency": 7,
    "milesDriven": 100
  }
}
```

#### Award Points
```http
POST /api/users/points
Authorization: Bearer <token>

{
  "points": 10,
  "reason": "Reported pollution"
}
```

---

## 🎨 Frontend Pages

### 1. **Home Page** (`/`)
- Hero section with mission
- Feature highlights
- Call-to-action buttons
- Recent activity feed
- Impact statistics

### 2. **Dashboard** (`/dashboard`)
- User stats overview
- Blue Points display
- Recent reports
- Impact score chart
- Quick actions

### 3. **Report Pollution** (`/report`)
- Interactive map (Leaflet)
- Report form with validation
- Photo upload (drag & drop)
- GPS location picker
- Severity selector

### 4. **Ocean Health Map** (`/map`)
- Global pollution visualization
- Filter by type/severity
- Click markers for details
- Heatmap overlay
- Export data

### 5. **Seafood Guide** (`/seafood`)
- Search bar with autocomplete
- Filter by sustainability
- Detailed seafood cards
- Alternative suggestions
- Nutritional info

### 6. **Impact Calculator** (`/impact`)
- Habit input form
- Real-time score calculation
- Visual charts (Recharts)
- Personalized tips
- Historical tracking

### 7. **Leaderboard** (`/leaderboard`)
- Global rankings
- Regional filters
- User search
- Badge showcase
- Level progression

### 8. **Community** (`/community`)
- Conservation articles
- Video library
- Beach cleanup organizer
- Forum discussions
- Success stories

### 9. **Profile** (`/profile`)
- User information
- Edit profile
- Activity history
- Badges earned
- Settings

---

## 🎮 Gamification System

### Points System
| Action | Points |
|--------|--------|
| Register | +50 |
| Report Pollution | +10 |
| Verified Report | +25 |
| Beach Cleanup | +100 |
| Pledge Action | +15 |
| Share Article | +5 |

### Badges
- **Bronze Protector**: 100 points
- **Silver Guardian**: 500 points
- **Gold Champion**: 1000 points
- **Platinum Hero**: 5000 points
- **Special Badges**: Ocean Warrior, Cleanup Captain, etc.

### Levels
- Level 1-10: Beginner
- Level 11-25: Intermediate
- Level 26-50: Advanced
- Level 51+: Master

---

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ Helmet security headers
- ✅ Input validation
- ✅ XSS protection
- ✅ CORS configuration
- ✅ SQL injection prevention

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

---

## 📦 Deployment

### Backend (Heroku)
```bash
heroku create cleanguard-api
git push heroku main
```

### Frontend (Vercel)
```bash
vercel --prod
```

### Database (MongoDB Atlas)
Update `.env` with Atlas connection string

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file

---

## 👥 Team

- **Project Lead**: Your Name
- **Frontend**: Developer 1
- **Backend**: Developer 2
- **Design**: Designer

---

## 📞 Support

- Email: uchechukwuc@gmail.com
- Website: https://cleanguard.org
- Twitter: @CleanGuardApp

---

## 🙏 Acknowledgments

- FishBase API
-- React Community
- MongoDB Team

---

**Built with ❤️ for SDG 14: Life Below Water 🌊**