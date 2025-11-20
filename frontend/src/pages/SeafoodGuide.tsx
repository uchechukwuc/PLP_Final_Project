import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import '../components/Layout.css';

const SeafoodGuide: React.FC = () => {
  const [seafood, setSeafood] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchSeafood();
  }, [selectedCategory, selectedRating]);

  const fetchSeafood = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedRating) params.append('sustainabilityRating', selectedRating);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/seafood?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSeafood(Array.isArray(data.seafood) ? data.seafood : []);
    } catch (error) {
      console.error('Error fetching seafood:', error);
      setSeafood([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchSeafood();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/seafood/search/${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSeafood(Array.isArray(data.seafood) ? data.seafood : []);
    } catch (error) {
      console.error('Error searching seafood:', error);
      setSeafood([]);
    } finally {
      setLoading(false);
    }
  };

  const getSustainabilityColor = (rating: string) => {
    switch (rating) {
      case 'best_choice': return '#27ae60';
      case 'good_alternative': return '#f39c12';
      case 'avoid': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getSustainabilityText = (rating: string) => {
    switch (rating) {
      case 'best_choice': return '🟢 Best Choice';
      case 'good_alternative': return '🟡 Good Alternative';
      case 'avoid': return '🔴 Avoid';
      default: return '⚪ Unknown';
    }
  };

  const categories = ['fish', 'shellfish', 'crustacean', 'mollusk', 'other'];
  const ratings = ['best_choice', 'good_alternative', 'avoid', 'unknown'];

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
          <h1 className="page-title">🐟 Sustainable Seafood Guide</h1>
          <p className="page-subtitle">
            Make informed choices about the seafood you consume
          </p>
        </div>

        <div className="card mb-4">
          <h2 className="card-title">Search & Filter</h2>
          
          <div className="grid grid-3 mb-3">
            <div className="form-group">
              <label className="form-label">Search Seafood</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter fish name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn btn-primary" onClick={handleSearch}>
                  Search
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sustainability Rating</label>
              <select 
                className="form-select"
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
              >
                <option value="">All Ratings</option>
                {ratings.map(rating => (
                  <option key={rating} value={rating}>
                    {getSustainabilityText(rating)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedRating('');
                fetchSeafood();
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="card mb-4">
          <h3 className="card-title">Sustainability Legend</h3>
          <div className="grid grid-4">
            {ratings.map(rating => (
              <div key={rating} style={{ textAlign: 'center' }}>
                <div 
                  style={{ 
                    background: getSustainabilityColor(rating), 
                    color: 'white', 
                    padding: '0.5rem', 
                    borderRadius: '5px',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getSustainabilityText(rating)}
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#7f8c8d' }}>
                  {rating === 'best_choice' && 'Excellent choice, well-managed'}
                  {rating === 'good_alternative' && 'Good option, some concerns'}
                  {rating === 'avoid' && 'Overfished or poor management'}
                  {rating === 'unknown' && 'Insufficient data available'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {selectedItem && (
          <div className="card mb-4" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h2 className="card-title">{selectedItem.commonName || 'Unknown'}</h2>
                <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>{selectedItem.scientificName || 'Unknown'}</p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedItem(null)}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-2">
              <div>
                <h4>Sustainability Info</h4>
                <p><strong>Rating:</strong>
                  <span style={{
                    color: getSustainabilityColor(selectedItem.sustainabilityRating || 'unknown'),
                    fontWeight: 'bold',
                    marginLeft: '0.5rem'
                  }}>
                    {getSustainabilityText(selectedItem.sustainabilityRating || 'unknown')}
                  </span>
                </p>
                <p><strong>Population Status:</strong> {selectedItem.populationStatus || 'Unknown'}</p>
                <p><strong>Habitat Impact:</strong> {selectedItem.habitatImpact || 'Unknown'}</p>
                <p><strong>Bycatch:</strong> {selectedItem.bycatch || 'Unknown'}</p>
                <p><strong>Management:</strong> {selectedItem.management || 'Unknown'}</p>
              </div>

              <div>
                <h4>Fishing Methods</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {(selectedItem.fishingMethod || []).map((method: string, index: number) => (
                    <span
                      key={index}
                      style={{
                        background: '#3498db',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '15px',
                        fontSize: '0.8rem'
                      }}
                    >
                      {method.replace('_', ' ')}
                    </span>
                  ))}
                  {(selectedItem.fishingMethod || []).length === 0 && <span style={{ color: '#7f8c8d' }}>No methods listed</span>}
                </div>

                {selectedItem.nutritionalInfo && (
                  <div style={{ marginTop: '1rem' }}>
                    <h4>Nutritional Information</h4>
                    <p><strong>Calories:</strong> {selectedItem.nutritionalInfo.calories || 'N/A'} per 100g</p>
                    <p><strong>Protein:</strong> {selectedItem.nutritionalInfo.protein || 'N/A'}g per 100g</p>
                    <p><strong>Omega-3:</strong> {selectedItem.nutritionalInfo.omega3 || 'N/A'}mg per 100g</p>
                    <p><strong>Mercury:</strong>
                      <span style={{
                        color: (selectedItem.nutritionalInfo.mercury === 'high') ? '#e74c3c' :
                              (selectedItem.nutritionalInfo.mercury === 'medium') ? '#f39c12' : '#27ae60',
                        fontWeight: 'bold',
                        marginLeft: '0.5rem'
                      }}>
                        {selectedItem.nutritionalInfo.mercury || 'Unknown'}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {(selectedItem.alternatives || []).length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4>Sustainable Alternatives</h4>
                <div className="grid grid-3">
                  {(selectedItem.alternatives || []).map((alt: any, index: number) => (
                    <div key={index} className="card" style={{ background: 'rgba(255,255,255,0.8)' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0', color: '#27ae60' }}>{alt.name || 'Alternative'}</h5>
                      <p style={{ margin: '0', fontSize: '0.9rem', color: '#7f8c8d' }}>{alt.reason || 'Reason not specified'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(selectedItem.cookingTips || []).length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4>Cooking Tips</h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {(selectedItem.cookingTips || []).map((tip: string, index: number) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="card">
          <h2 className="card-title">Seafood Database</h2>
          
          {seafood.length === 0 ? (
            <p className="text-center" style={{ color: '#7f8c8d' }}>
              No seafood found matching your criteria.
            </p>
          ) : (
            <div className="grid grid-3">
              {seafood.map((item: any) => (
                <div
                  key={item._id || Math.random()}
                  className="card"
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onClick={() => setSelectedItem(item)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.1rem' }}>
                        {item.commonName || 'Unknown'}
                      </h3>
                      <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        {item.scientificName || 'Unknown'}
                      </p>
                    </div>
                    <span
                      style={{
                        background: getSustainabilityColor(item.sustainabilityRating || 'unknown'),
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '10px',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {(item.sustainabilityRating || 'unknown').replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                      <strong>Category:</strong> {item.category || 'Unknown'}
                    </p>
                    <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                      <strong>Rating:</strong> {(item.rating || 0)}/5 ⭐
                    </p>
                    {item.populationStatus && (
                      <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                        <strong>Population:</strong> {item.populationStatus.replace('_', ' ')}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {(item.tags || []).slice(0, 3).map((tag: string, index: number) => (
                      <span
                        key={index}
                        style={{
                          background: '#ecf0f1',
                          color: '#7f8c8d',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '10px',
                          fontSize: '0.7rem'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SeafoodGuide;