import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import '../components/Layout.css';

interface LeaderboardUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  bluePoints?: number;
  level?: string;
  rank: number;
  impactScore?: number;
  reportsSubmitted?: number;
  cleanupsJoined?: number;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('points');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedType, currentPage]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/gamification/leaderboard?type=${selectedType}&page=${currentPage}&limit=20`);
      const data = await response.json();

      if (response.ok) {
        setLeaderboard(data.leaderboard);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getTypeTitle = () => {
    switch (selectedType) {
      case 'points': return 'Blue Points Leaderboard';
      case 'reports': return 'Pollution Reports Leaderboard';
      case 'cleanups': return 'Cleanup Events Leaderboard';
      case 'impact': return 'Environmental Impact Leaderboard';
      default: return 'Leaderboard';
    }
  };

  const getTypeDescription = () => {
    switch (selectedType) {
      case 'points': return 'Top users by Blue Points earned';
      case 'reports': return 'Most active pollution reporters';
      case 'cleanups': return 'Most cleanup event participants';
      case 'impact': return 'Lowest environmental impact scores';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🏆 Leaderboards</h1>
          <p className="page-subtitle">
            See how you rank among fellow ocean conservation champions
          </p>
        </div>

        {/* Category Selector */}
        <div className="card mb-4">
          <h2 className="card-title">Select Category</h2>
          <div className="grid grid-4">
            {[
              { value: 'points', label: 'Blue Points', icon: '🔵' },
              { value: 'reports', label: 'Pollution Reports', icon: '📝' },
              { value: 'cleanups', label: 'Cleanup Events', icon: '🧹' },
              { value: 'impact', label: 'Environmental Impact', icon: '🌱' }
            ].map((category) => (
              <button
                key={category.value}
                className={`btn ${selectedType === category.value ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setSelectedType(category.value);
                  setCurrentPage(1);
                }}
                style={{ height: 'auto', padding: '1rem' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{category.icon}</div>
                <div>{category.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Leaderboard */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 className="card-title">{getTypeTitle()}</h2>
              <p className="card-description">{getTypeDescription()}</p>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-center" style={{ color: '#7f8c8d' }}>
              No data available for this category yet.
            </p>
          ) : (
            <div>
              {leaderboard.map((user, index) => (
                <div
                  key={user._id}
                  className="card"
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem'
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: user.rank <= 3 ? '#f39c12' : '#7f8c8d',
                    minWidth: '60px',
                    textAlign: 'center'
                  }}>
                    {getRankIcon(user.rank)}
                  </div>

                  {/* Profile Picture */}
                  <img
                    src={user.profilePicture || 'https://picsum.photos/seed/avatar/50/50.jpg'}
                    alt={`${user.username}'s avatar`}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      marginRight: '1rem',
                      border: '2px solid #ecf0f1'
                    }}
                  />

                  {/* User Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.25rem 0', color: '#2c3e50' }}>
                      {user.firstName} {user.lastName}
                    </h3>
                    <p style={{ margin: '0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                      @{user.username}
                    </p>
                    {user.level && (
                      <p style={{ margin: '0.25rem 0 0 0', color: '#3498db', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {user.level}
                      </p>
                    )}
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#27ae60' }}>
                      {selectedType === 'points' && `${user.bluePoints || 0} pts`}
                      {selectedType === 'reports' && `${user.reportsSubmitted || 0} reports`}
                      {selectedType === 'cleanups' && `${user.cleanupsJoined || 0} cleanups`}
                      {selectedType === 'impact' && `${user.impactScore?.toFixed(1) || 'N/A'}`}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                      {selectedType === 'impact' ? 'Lower is better' : 'Score'}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        className={`btn ${currentPage === pageNum ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    className="btn btn-secondary"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Achievement Categories */}
        <div className="card mt-4">
          <h3 className="card-title">🏅 Achievement Categories</h3>
          <div className="grid grid-2">
            <div>
              <h4>Blue Points System</h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#7f8c8d' }}>
                <li>Report pollution: +10 points</li>
                <li>Upvote reports: +1 point</li>
                <li>Comment on reports: +2 points</li>
                <li>Complete impact calculation: +5 points</li>
                <li>Resolve pollution reports: +20 points</li>
              </ul>
            </div>

            <div>
              <h4>Level Progression</h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#7f8c8d' }}>
                <li>Ocean Warrior: 0-99 points</li>
                <li>Marine Guardian: 100-249 points</li>
                <li>Sea Champion: 250-499 points</li>
                <li>Ocean Protector: 500-999 points</li>
                <li>CleanGuard Hero: 1000+ points</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;