import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WorkoutSuggestions = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    goal: '',
    duration: '',
    difficulty: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, [filters]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.goal) params.goal = filters.goal;
      if (filters.duration) params.duration = filters.duration;
      if (filters.difficulty) params.difficulty = filters.difficulty;

      const response = await axios.get('http://localhost:5001/api/recommendations/workouts', { params });
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    } else {
      // Navigate to workout form with template data
      navigate('/workouts/new', { state: { template } });
    }
  };

  if (loading) {
    return <div className="loading">Loading suggestions...</div>;
  }

  return (
    <div>
      <h3>Workout Suggestions</h3>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <select
          value={filters.difficulty}
          onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          className="form-control"
          style={{ padding: '8px', minWidth: '150px' }}
        >
          <option value="">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        
        <select
          value={filters.duration}
          onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
          className="form-control"
          style={{ padding: '8px', minWidth: '150px' }}
        >
          <option value="">Any Duration</option>
          <option value="20">20 minutes</option>
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">60 minutes</option>
        </select>
      </div>

      <div className="workout-grid">
        {templates.map((template, index) => (
          <div key={index} className="workout-card" style={{ cursor: 'pointer' }} onClick={() => handleSelectTemplate(template)}>
            <h4>{template.name}</h4>
            <p style={{ color: '#6c757d', marginBottom: '15px' }}>{template.description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span className="status-badge" style={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}>
                {template.difficulty}
              </span>
              <span style={{ color: '#6c757d', fontSize: '14px' }}>
                ⏱️ {template.estimatedDuration} min
              </span>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: '#28a745' }}>🔥 {template.estimatedCalories} kcal</strong>
            </div>
            
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              <strong>Exercises:</strong>
              <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                {template.exercises.map((ex, idx) => (
                  <li key={idx}>
                    {ex.muscleGroup}: {ex.count} exercise{ex.count > 1 ? 's' : ''}
                  </li>
                ))}
              </ul>
            </div>
            
            <button className="btn btn-primary" style={{ marginTop: '15px', width: '100%' }}>
              Use This Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutSuggestions;

