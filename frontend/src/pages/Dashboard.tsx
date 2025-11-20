import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../components/Layout.css';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  bluePoints: number;
  level: string;
  profilePicture?: string;
}

interface UserStats {
  bluePoints: number;
  level: string;
  joinDate: string;
  lastActive: string;
  reportsSubmitted: number;
  cleanupsJoined: number;
  plasticReduced: number;
  seafoodChoicesImproved: number;
  badges: number;
  impactCalculations: number;
  communityPosts: number;
  currentStreak: number;
  bestImpactScore: number | null;
  latestImpactScore: number | null;
}

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && token) {
      fetchUserStats();
    }
  }, [user, token]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gamification/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="container">
        <div className="alert alert-error">
          Please log in to view your dashboard.
        </div>
      </div>
    );
  }

  return (
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🌊 Welcome back, {user.firstName}!</h1>
          <p className="page-subtitle">Track your ocean conservation progress and achievements</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-4 mb-4">
          <div className="card text-center">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔵</div>
            <h3 style={{ margin: '0', color: '#2c3e50' }}>{stats.bluePoints}</h3>
            <p className="card-description">Blue Points</p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
            <h3 style={{ margin: '0', color: '#2c3e50' }}>{stats.level}</h3>
            <p className="card-description">Current Level</p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <h3 style={{ margin: '0', color: '#2c3e50' }}>{stats.reportsSubmitted}</h3>
            <p className="card-description">Reports Submitted</p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
            <h3 style={{ margin: '0', color: '#2c3e50' }}>{stats.badges}</h3>
            <p className="card-description">Badges Earned</p>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-2">
          {/* Recent Activity */}
          <div className="card">
            <h2 className="card-title">📈 Your Impact</h2>
            <div className="grid grid-2" style={{ gap: '1rem' }}>
              <div>
                <h4>Latest Impact Score</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>
                  {stats.latestImpactScore !== null ? stats.latestImpactScore : 'Not calculated yet'}
                </p>
                <p className="card-description">Lower is better</p>
              </div>

              <div>
                <h4>Best Impact Score</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db' }}>
                  {stats.bestImpactScore !== null ? stats.bestImpactScore : 'Not calculated yet'}
                </p>
                <p className="card-description">Your personal best</p>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h4>Activity Summary</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cleanups Joined:</span>
                  <span style={{ fontWeight: 'bold' }}>{stats.cleanupsJoined}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Plastic Reduced (kg):</span>
                  <span style={{ fontWeight: 'bold' }}>{stats.plasticReduced}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Seafood Choices Improved:</span>
                  <span style={{ fontWeight: 'bold' }}>{stats.seafoodChoicesImproved}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Community Posts:</span>
                  <span style={{ fontWeight: 'bold' }}>{stats.communityPosts}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="card-title">🚀 Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link to="/pollution-tracker" className="btn btn-primary" style={{ textDecoration: 'none', textAlign: 'center' }}>
                📝 Report Pollution
              </Link>

              <Link to="/impact-calculator" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
                🧮 Calculate Impact
              </Link>

              <Link to="/seafood-guide" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
                🐟 Check Seafood Guide
              </Link>

              <Link to="/community" className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
                💬 Join Community
              </Link>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h4>Current Streak</h4>
              <div style={{ textAlign: 'center', padding: '1rem', background: '#ecf0f1', borderRadius: '8px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0' }}>
                  {stats.currentStreak} day{stats.currentStreak !== 1 ? 's' : ''}
                </p>
                <p className="card-description">Keep it up!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Progress */}
        <div className="card mt-4">
          <h2 className="card-title">🏆 Achievement Progress</h2>
          <div className="grid grid-3">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <h4>Impact Calculator</h4>
              <p className="card-description">
                {stats.impactCalculations > 0 ? 'Completed!' : 'Not started yet'}
              </p>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#ecf0f1',
                borderRadius: '4px',
                marginTop: '0.5rem'
              }}>
                <div style={{
                  width: stats.impactCalculations > 0 ? '100%' : '0%',
                  height: '100%',
                  background: '#27ae60',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
              <h4>Pollution Reports</h4>
              <p className="card-description">
                {stats.reportsSubmitted} report{stats.reportsSubmitted !== 1 ? 's' : ''} submitted
              </p>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#ecf0f1',
                borderRadius: '4px',
                marginTop: '0.5rem'
              }}>
                <div style={{
                  width: Math.min((stats.reportsSubmitted / 5) * 100, 100) + '%',
                  height: '100%',
                  background: '#3498db',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
              <h4>Community Engagement</h4>
              <p className="card-description">
                {stats.communityPosts} post{stats.communityPosts !== 1 ? 's' : ''} created
              </p>
              <div style={{
                width: '100%',
                height: '8px',
                background: '#ecf0f1',
                borderRadius: '4px',
                marginTop: '0.5rem'
              }}>
                <div style={{
                  width: Math.min((stats.communityPosts / 3) * 100, 100) + '%',
                  height: '100%',
                  background: '#e67e22',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;