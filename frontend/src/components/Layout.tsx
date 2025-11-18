import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  bluePoints: number;
  level: string;
  profilePicture?: string;
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">🌊</div>
            CleanGuard
          </Link>
          
          <ul className="nav-links">
            {!isAuthenticated && (
              <li><Link to="/" className="nav-link">Home</Link></li>
            )}
            <li><Link to="/pollution-tracker" className="nav-link">Pollution Tracker</Link></li>
            <li><Link to="/seafood-guide" className="nav-link">Seafood Guide</Link></li>
            <li><Link to="/impact-calculator" className="nav-link">Impact Calculator</Link></li>
            <li><Link to="/community" className="nav-link">Community</Link></li>
            {isAuthenticated && (
              <li><Link to="/leaderboard" className="nav-link">Leaderboard</Link></li>
            )}
          </ul>
          
          <div className="user-menu">
            {user ? (
              <>
                <div className="blue-points">🔵 {user.bluePoints} pts</div>
                <div className="user-level">{user.level}</div>
                <Link to="/profile">
                  <img
                    src={user.profilePicture || 'https://picsum.photos/seed/avatar/100/100.jpg'}
                    alt="Profile"
                    className="user-avatar"
                  />
                </Link>
                <button
                  className="btn btn-secondary"
                  onClick={handleLogout}
                  style={{ marginLeft: '1rem' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;