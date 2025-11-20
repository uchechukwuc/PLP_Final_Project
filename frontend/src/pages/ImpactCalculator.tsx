import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import '../components/Layout.css';

const ImpactCalculator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [history, setHistory] = useState([]);
  
  const [habits, setHabits] = useState({
    plasticBottlesPerWeek: 0,
    plasticBagsPerWeek: 0,
    strawsPerWeek: 0,
    coffeeCupsPerWeek: 0,
    seafoodMealsPerWeek: 0,
    carTripsPerWeek: 0,
    publicTransportPerWeek: 0,
    recyclingFrequency: 'sometimes',
    compostingFrequency: 'never',
    beachCleanupsPerYear: 0
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/impact/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.calculations);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleHabitChange = (field: string, value: string | number) => {
    setHabits({
      ...habits,
      [field]: value
    });
  };

  const calculateImpact = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Please login to save your impact calculation');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/impact/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ habits })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.impact);
        setCurrentStep(4);
        fetchHistory();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to calculate impact');
      }
    } catch (error) {
      console.error('Error calculating impact:', error);
      alert('Error calculating impact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return '#27ae60'; // Good
    if (score <= 60) return '#f39c12'; // Moderate
    return '#e74c3c'; // Poor
  };

  const getScoreMessage = (score: number) => {
    if (score <= 30) return 'Excellent! You have a low environmental impact.';
    if (score <= 60) return 'Good! There\'s room for improvement.';
    return 'High impact. Consider making some changes.';
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetCalculator = () => {
    setCurrentStep(1);
    setResults(null);
    setHabits({
      plasticBottlesPerWeek: 0,
      plasticBagsPerWeek: 0,
      strawsPerWeek: 0,
      coffeeCupsPerWeek: 0,
      seafoodMealsPerWeek: 0,
      carTripsPerWeek: 0,
      publicTransportPerWeek: 0,
      recyclingFrequency: 'sometimes',
      compostingFrequency: 'never',
      beachCleanupsPerYear: 0
    });
  };

  return (
    <Layout>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">📊 Personal Impact Calculator</h1>
          <p className="page-subtitle">
            Calculate your environmental footprint and get personalized recommendations
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="card mb-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            {[1, 2, 3, 4].map((step) => (
              <div key={step} style={{ textAlign: 'center', flex: 1 }}>
                <div 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: currentStep >= step ? '#3498db' : '#ecf0f1',
                    color: currentStep >= step ? 'white' : '#7f8c8d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    margin: '0 auto 0.5rem'
                  }}
                >
                  {step}
                </div>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.8rem', 
                  color: currentStep >= step ? '#3498db' : '#7f8c8d',
                  fontWeight: currentStep === step ? 'bold' : 'normal'
                }}>
                  {step === 1 && 'Plastic Use'}
                  {step === 2 && 'Seafood & Transport'}
                  {step === 3 && 'Conservation'}
                  {step === 4 && 'Results'}
                </p>
              </div>
            ))}
          </div>
          
          <div style={{ 
            height: '4px', 
            background: '#ecf0f1', 
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div 
              style={{ 
                width: `${(currentStep / 4) * 100}%`, 
                height: '100%', 
                background: '#3498db',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Step 1: Plastic Use */}
        {currentStep === 1 && (
          <div className="card">
            <h2 className="card-title">Step 1: Plastic Consumption</h2>
            <p className="card-description">
              Tell us about your weekly plastic usage habits
            </p>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">
                  Plastic bottles per week: {habits.plasticBottlesPerWeek}
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={habits.plasticBottlesPerWeek}
                  onChange={(e) => handleHabitChange('plasticBottlesPerWeek', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Plastic bags per week: {habits.plasticBagsPerWeek}
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={habits.plasticBagsPerWeek}
                  onChange={(e) => handleHabitChange('plasticBagsPerWeek', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Plastic straws per week: {habits.strawsPerWeek}
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={habits.strawsPerWeek}
                  onChange={(e) => handleHabitChange('strawsPerWeek', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Disposable coffee cups per week: {habits.coffeeCupsPerWeek}
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={habits.coffeeCupsPerWeek}
                  onChange={(e) => handleHabitChange('coffeeCupsPerWeek', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
              <button className="btn btn-primary" onClick={nextStep}>
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Seafood & Transport */}
        {currentStep === 2 && (
          <div className="card">
            <h2 className="card-title">Step 2: Seafood & Transportation</h2>
            <p className="card-description">
              Tell us about your diet and travel habits
            </p>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">
                  Seafood meals per week: {habits.seafoodMealsPerWeek}
                </label>
                <input
                  type="range"
                  min="0"
                  max="14"
                  value={habits.seafoodMealsPerWeek}
                  onChange={(e) => handleHabitChange('seafoodMealsPerWeek', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Car trips per week: {habits.carTripsPerWeek}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={habits.carTripsPerWeek}
                  onChange={(e) => handleHabitChange('carTripsPerWeek', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Public transport trips per week: {habits.publicTransportPerWeek}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={habits.publicTransportPerWeek}
                  onChange={(e) => handleHabitChange('publicTransportPerWeek', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Beach cleanups per year: {habits.beachCleanupsPerYear}
                </label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={habits.beachCleanupsPerYear}
                  onChange={(e) => handleHabitChange('beachCleanupsPerYear', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={prevStep}>
                ← Previous
              </button>
              <button className="btn btn-primary" onClick={nextStep}>
                Next Step →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Conservation Habits */}
        {currentStep === 3 && (
          <div className="card">
            <h2 className="card-title">Step 3: Conservation Habits</h2>
            <p className="card-description">
              Tell us about your recycling and waste management practices
            </p>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">How often do you recycle?</label>
                <select 
                  className="form-select"
                  value={habits.recyclingFrequency}
                  onChange={(e) => handleHabitChange('recyclingFrequency', e.target.value)}
                >
                  <option value="never">Never</option>
                  <option value="rarely">Rarely</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="often">Often</option>
                  <option value="always">Always</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">How often do you compost?</label>
                <select 
                  className="form-select"
                  value={habits.compostingFrequency}
                  onChange={(e) => handleHabitChange('compostingFrequency', e.target.value)}
                >
                  <option value="never">Never</option>
                  <option value="rarely">Rarely</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="often">Often</option>
                  <option value="always">Always</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button className="btn btn-secondary" onClick={prevStep}>
                ← Previous
              </button>
              <button 
                className="btn btn-success" 
                onClick={calculateImpact}
                disabled={loading}
              >
                {loading ? 'Calculating...' : 'Calculate My Impact 🌊'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {currentStep === 4 && results && (
          <div>
            <div className="card mb-4">
              <h2 className="card-title">Your Ocean Impact Results</h2>
              
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div 
                  style={{ 
                    fontSize: '4rem', 
                    fontWeight: 'bold',
                    color: getScoreColor(results.scores.overallImpact),
                    marginBottom: '1rem'
                  }}
                >
                  {results.scores.overallImpact}
                </div>
                <h3 style={{ 
                  color: getScoreColor(results.scores.overallImpact),
                  marginBottom: '0.5rem'
                }}>
                  Overall Impact Score
                </h3>
                <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
                  {getScoreMessage(results.scores.overallImpact)}
                </p>
              </div>

              <div className="grid grid-2">
                <div className="card" style={{ background: 'rgba(255,255,255,0.8)' }}>
                  <h4>Impact Breakdown</h4>
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                      <span>Plastic Footprint:</span>
                      <span style={{ 
                        color: getScoreColor(results.scores.plasticFootprint),
                        fontWeight: 'bold'
                      }}>
                        {results.scores.plasticFootprint}
                      </span>
                    </p>
                    <p style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                      <span>Seafood Impact:</span>
                      <span style={{ 
                        color: getScoreColor(results.scores.seafoodImpact),
                        fontWeight: 'bold'
                      }}>
                        {results.scores.seafoodImpact}
                      </span>
                    </p>
                    <p style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                      <span>Carbon Footprint:</span>
                      <span style={{ 
                        color: getScoreColor(results.scores.carbonFootprint),
                        fontWeight: 'bold'
                      }}>
                        {results.scores.carbonFootprint}
                      </span>
                    </p>
                    <p style={{ display: 'flex', justifyContent: 'space-between', margin: '0.5rem 0' }}>
                      <span>Conservation Effort:</span>
                      <span style={{ 
                        color: getScoreColor(100 - results.scores.conservationEffort),
                        fontWeight: 'bold'
                      }}>
                        {results.scores.conservationEffort}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="card" style={{ background: 'rgba(255,255,255,0.8)' }}>
                  <h4>Your Habits Summary</h4>
                  <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                    <p>💧 {habits.plasticBottlesPerWeek} plastic bottles/week</p>
                    <p>🛍️ {habits.plasticBagsPerWeek} plastic bags/week</p>
                    <p>🥤 {habits.coffeeCupsPerWeek} coffee cups/week</p>
                    <p>🐟 {habits.seafoodMealsPerWeek} seafood meals/week</p>
                    <p>🚗 {habits.carTripsPerWeek} car trips/week</p>
                    <p>♻️ Recycling: {habits.recyclingFrequency}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {results.recommendations && results.recommendations.length > 0 && (
              <div className="card mb-4">
                <h3 className="card-title">Personalized Recommendations</h3>
                <div className="grid grid-2">
                  {results.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="card" style={{ background: 'rgba(255,255,255,0.8)' }}>
                      <h4 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>{rec.title}</h4>
                      <p style={{ color: '#7f8c8d', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        {rec.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span 
                          style={{ 
                            background: rec.difficulty === 'easy' ? '#27ae60' : 
                                      rec.difficulty === 'moderate' ? '#f39c12' : '#e74c3c',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '10px',
                            fontSize: '0.8rem'
                          }}
                        >
                          {rec.difficulty}
                        </span>
                        <span style={{ color: '#3498db', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {rec.impact}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Goals */}
            {results.weeklyGoals && results.weeklyGoals.length > 0 && (
              <div className="card mb-4">
                <h3 className="card-title">Your Weekly Goals</h3>
                <div className="grid grid-3">
                  {results.weeklyGoals.map((goal: any, index: number) => (
                    <div key={index} className="card" style={{ background: 'rgba(255,255,255,0.8)' }}>
                      <h4 style={{ color: '#3498db', marginBottom: '0.5rem' }}>
                        {goal.habit.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase())}
                      </h4>
                      <p style={{ color: '#7f8c8d', margin: '0.5rem 0' }}>
                        Current: {goal.current} {goal.unit} → Target: {goal.target} {goal.unit}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button className="btn btn-primary" onClick={resetCalculator}>
                🔄 Calculate Again
              </button>
            </div>
          </div>
        )}

        {/* History */}
        {history && history.length > 0 && (
          <div className="card">
            <h3 className="card-title">Previous Calculations</h3>
            <div className="grid grid-4">
              {history.slice(0, 8).map((calc: any, index: number) => (
                <div key={index} className="card" style={{ background: 'rgba(255,255,255,0.8)' }}>
                  <p style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold',
                    color: getScoreColor(calc.scores.overallImpact),
                    textAlign: 'center',
                    margin: '0.5rem 0'
                  }}>
                    {calc.scores.overallImpact}
                  </p>
                  <p style={{ 
                    textAlign: 'center', 
                    color: '#7f8c8d', 
                    fontSize: '0.8rem',
                    margin: '0'
                  }}>
                    {new Date(calc.calculationDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ImpactCalculator;