import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import '../components/Layout.css';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">CleanGuard Ocean Sustainability Tracker</h1>
          <p className="page-subtitle">
            Join our community-driven platform to track, educate, and reward sustainable ocean-friendly behavior. 
            Together, we can protect our marine ecosystems for future generations.
          </p>
        </div>

        <div className="grid grid-3">
          <div className="card">
            <div className="card-title">🗺️ Marine Pollution Tracker</div>
            <div className="card-description">
              Report plastic waste, oil spills, and other pollution in your area. 
              Help us build a live global map of ocean health issues and drive real change.
            </div>
            <div className="mt-3">
              <Link to="/pollution-tracker" className="btn btn-primary">
                Start Reporting
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-title">🐟 Sustainable Seafood Guide</div>
            <div className="card-description">
              Make informed choices about the seafood you consume. 
              Check sustainability ratings and discover eco-friendly alternatives.
            </div>
            <div className="mt-3">
              <Link to="/seafood-guide" className="btn btn-success">
                Explore Seafood
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-title">📊 Personal Impact Calculator</div>
            <div className="card-description">
              Calculate your environmental footprint and get personalized tips 
              to reduce your impact on ocean health.
            </div>
            <div className="mt-3">
              <Link to="/impact-calculator" className="btn btn-warning">
                Calculate Impact
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-2 mt-4">
          <div className="card">
            <div className="card-title">🏆 Gamification & Rewards</div>
            <div className="card-description">
              Earn Blue Points for eco-friendly actions, unlock achievements, 
              and climb the leaderboards. Your contributions matter and get recognized!
            </div>
            <div className="mt-3">
              <Link to="/community" className="btn btn-secondary">
                View Leaderboard
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="card-title">🌍 Community & Education</div>
            <div className="card-description">
              Learn about marine conservation through articles, videos, and infographics. 
              Join cleanup events and connect with like-minded ocean advocates.
            </div>
            <div className="mt-3">
              <Link to="/community" className="btn btn-secondary">
                Join Community
              </Link>
            </div>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-title text-center">🌊 How CleanGuard Makes a Difference</div>
          <div className="grid grid-3 mt-3">
            <div className="text-center">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
              <h3>Data-Driven Action</h3>
              <p className="card-description">
                Real-time pollution tracking helps authorities respond faster to environmental threats.
              </p>
            </div>
            <div className="text-center">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h3>Targeted Education</h3>
              <p className="card-description">
                Personalized impact calculations help individuals understand their specific environmental footprint.
              </p>
            </div>
            <div className="text-center">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤝</div>
              <h3>Community Power</h3>
              <p className="card-description">
                Connect with local advocates and organize collective action for meaningful change.
              </p>
            </div>
          </div>
        </div>

        <div className="card mt-4" style={{ background: 'linear-gradient(135deg, #3498db, #2ecc71)', color: 'white' }}>
          <div className="text-center">
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to Make a Difference?</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
              Every action counts. Join thousands of ocean advocates working towards a cleaner, healthier planet.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-secondary" style={{ background: 'white', color: '#3498db' }}>
                Get Started Now
              </Link>
              <Link to="/pollution-tracker" className="btn btn-primary" style={{ background: 'transparent', border: '2px solid white' }}>
                Report Pollution
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;