import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import OceanHealthMap from '../components/OceanHealthMap';
import LocationPicker from '../components/LocationPicker';
import '../components/Layout.css';

const PollutionTracker: React.FC = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'plastic_waste',
    severity: 'medium',
    description: '',
    latitude: '',
    longitude: '',
    address: '',
    estimatedVolume: 'medium',
    affectedArea: '',
    weatherConditions: '',
    tideConditions: '',
    tags: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports`);
      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that location is selected
    if (!formData.latitude || !formData.longitude) {
      alert('Please select a location on the map before submitting the report.');
      return;
    }

    submitReport(formData);
  };

  const submitReport = async (data: typeof formData) => {
    try {
      const token = localStorage.getItem('token');
      const formDataObj = new FormData();

      Object.keys(data).forEach(key => {
        if (data[key as keyof typeof data]) {
          formDataObj.append(key, data[key as keyof typeof data]);
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });

      if (response.ok) {
        alert('Pollution report submitted successfully!');
        setShowForm(false);
        setFormData({
          type: 'plastic_waste',
          severity: 'medium',
          description: '',
          latitude: '',
          longitude: '',
          address: '',
          estimatedVolume: 'medium',
          affectedArea: '',
          weatherConditions: '',
          tideConditions: '',
          tags: ''
        });
        fetchReports();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return '#27ae60';
      case 'resolved': return '#3498db';
      case 'pending': return '#f39c12';
      case 'false_positive': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#e74c3c';
      case 'high': return '#e67e22';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
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
          <h1 className="page-title">🗺️ Marine Pollution Tracker</h1>
          <p className="page-subtitle">
            Report and track pollution incidents to help protect our oceans
          </p>
        </div>

        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '📝 Report Pollution'}
          </button>
        </div>

        {showForm && (
          <div className="card mb-4">
            <h2 className="card-title">Report Pollution Incident</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Pollution Type</label>
                  <select 
                    name="type" 
                    className="form-select"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="plastic_waste">Plastic Waste</option>
                    <option value="oil_spill">Oil Spill</option>
                    <option value="chemical_pollution">Chemical Pollution</option>
                    <option value="fishing_gear">Fishing Gear</option>
                    <option value="general_debris">General Debris</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Severity</label>
                  <select 
                    name="severity" 
                    className="form-select"
                    value={formData.severity}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the pollution incident in detail..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <LocationPicker
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  address={formData.address}
                  onLocationChange={(lat, lng, address) => {
                    setFormData(prev => ({
                      ...prev,
                      latitude: lat,
                      longitude: lng,
                      address: address || prev.address
                    }));
                  }}
                  height="clamp(200px, 30vh, 300px)"
                />
                <small style={{ color: '#7f8c8d', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                  Use GPS to find your location or click on the map to select a specific spot
                </small>
              </div>

              <div className="grid grid-3">
                <div className="form-group">
                  <label className="form-label">Estimated Volume</label>
                  <select 
                    name="estimatedVolume" 
                    className="form-select"
                    value={formData.estimatedVolume}
                    onChange={handleChange}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="extra_large">Extra Large</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Weather Conditions</label>
                  <input
                    type="text"
                    name="weatherConditions"
                    className="form-input"
                    value={formData.weatherConditions}
                    onChange={handleChange}
                    placeholder="e.g., Sunny, Windy"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tide Conditions</label>
                  <input
                    type="text"
                    name="tideConditions"
                    className="form-input"
                    value={formData.tideConditions}
                    onChange={handleChange}
                    placeholder="e.g., High tide, Low tide"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  className="form-input"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g., beach, plastic, ocean"
                />
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-success">
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ocean Health Map */}
        <div className="card">
          <h2 className="card-title">🌍 Ocean Health Map</h2>
          <p className="card-description">
            View pollution reports and ocean health monitoring areas worldwide
          </p>
          <OceanHealthMap center={[20, 0]} zoom={2} showReports={true} />
        </div>

        <div className="card">
          <h2 className="card-title">Recent Pollution Reports</h2>

          {reports.length === 0 ? (
            <p className="text-center" style={{ color: '#7f8c8d' }}>
              No pollution reports yet. Be the first to report an incident!
            </p>
          ) : (
            <div className="grid grid-2">
              {reports.map((report: any) => (
                <div key={report._id} className="card" style={{ background: 'rgba(255,255,255,0.8)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.2rem' }}>
                        {report.type.replace('_', ' ').toUpperCase()}
                      </h3>
                      <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span
                        style={{
                          background: getSeverityColor(report.severity),
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {report.severity.toUpperCase()}
                      </span>
                      <span
                        style={{
                          background: getStatusColor(report.status),
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {report.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p style={{ color: '#2c3e50', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {report.description}
                  </p>

                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ margin: '0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                      📍 {report.address}
                    </p>
                    {report.reporter && (
                      <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                        👤 Reported by {report.reporter.username}
                      </p>
                    )}
                    {report.upvotes && (
                      <p style={{ margin: '0.25rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                        👍 {report.upvotes.length} upvotes
                      </p>
                    )}
                  </div>

                  {report.images && report.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      {report.images.slice(0, 3).map((image: string, index: number) => (
                        <img
                          key={index}
                          src={`${import.meta.env.VITE_API_BASE_URL}${image}`}
                          alt={`Pollution image ${index + 1}`}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '5px',
                            border: '1px solid #ecf0f1'
                          }}
                        />
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                      👍 Upvote
                    </button>
                    <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                      💬 Comment
                    </button>
                    <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
                      📍 View on Map
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

export default PollutionTracker;