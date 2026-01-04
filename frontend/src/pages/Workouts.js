import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import API_BASE_URL from '../config/api';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchWorkouts();
  }, [filter]);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await axios.get(`${API_BASE_URL}/api/workouts`, { params });
      setWorkouts(response.data);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workoutId) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/workouts/${workoutId}`);
        fetchWorkouts();
      } catch (error) {
        console.error('Error deleting workout:', error);
        alert('Failed to delete workout');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading workouts...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>My Workouts</h1>
        <Link to="/workouts/new" className="btn btn-primary">
          + New Workout
        </Link>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('all')}
          style={{ marginRight: '10px' }}
        >
          All
        </button>
        <button
          className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('pending')}
          style={{ marginRight: '10px' }}
        >
          Pending
        </button>
        <button
          className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {workouts.length === 0 ? (
        <div className="card">
          <p>No workouts found. Create your first workout!</p>
        </div>
      ) : (
        <div className="workout-grid">
          {workouts.map((workout) => (
            <div
              key={workout._id}
              className={`workout-card ${workout.isCompleted ? 'completed' : 'pending'}`}
            >
              {/* Workout Name - Prominent at the top */}
              <div style={{ 
                marginBottom: '15px',
                paddingBottom: '15px',
                borderBottom: '2px solid #4a4a4a'
              }}>
                <h2 style={{ 
                  fontSize: '28px', 
                  fontWeight: '900',
                  color: '#ffffff',
                  margin: '0 0 8px 0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  lineHeight: '1.2'
                }}>
                  {workout.name}
                </h2>
                <span className={`status-badge ${workout.isCompleted ? 'completed' : 'pending'}`}>
                  {workout.isCompleted ? '✅ Completed' : '⏳ Pending'}
                </span>
              </div>

              {/* Date and Time */}
              <div className="workout-card-date" style={{ marginBottom: '15px' }}>
                📅 {format(new Date(workout.scheduledDate), 'MMM dd, yyyy')}
                {workout.scheduledTime && ` at ${workout.scheduledTime}`}
              </div>

              {/* Exercises List - Show actual exercise names */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  💪 Exercises ({workout.exercises.length}):
                </div>
                {workout.exercises && workout.exercises.length > 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    {workout.exercises.map((exerciseItem, idx) => {
                      const exercise = exerciseItem.exercise;
                      const exerciseName = exercise?.name || 'Unknown Exercise';
                      const muscleGroup = exercise?.muscleGroup;
                      return (
                        <div 
                          key={idx}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '6px',
                            border: '1px solid #4a4a4a',
                            fontSize: '13px',
                            color: '#cccccc',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span style={{ fontWeight: '600', color: '#ffffff' }}>
                            {exerciseName}
                            {muscleGroup && (
                              <span style={{ 
                                marginLeft: '8px', 
                                fontSize: '11px', 
                                color: '#aaaaaa',
                                fontWeight: 'normal'
                              }}>
                                ({muscleGroup})
                              </span>
                            )}
                          </span>
                          {exerciseItem.caloriesBurned > 0 && (
                            <span style={{ 
                              fontSize: '11px', 
                              color: '#00ff88',
                              fontWeight: '600'
                            }}>
                              🔥 {exerciseItem.caloriesBurned} kcal
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ 
                    color: '#aaaaaa', 
                    fontSize: '13px',
                    fontStyle: 'italic'
                  }}>
                    No exercises added yet
                  </div>
                )}
              </div>

              {/* Total Calories */}
              {workout.totalCaloriesBurned > 0 && (
                <div style={{ 
                  marginBottom: '15px',
                  padding: '10px',
                  backgroundColor: '#1a1a1a',
                  borderRadius: '6px',
                  border: '2px solid #00ff88',
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '700',
                    color: '#00ff88'
                  }}>
                    🔥 Total: {workout.totalCaloriesBurned} kcal
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="workout-card-actions">
                <Link
                  to={`/workouts/${workout._id}`}
                  className="btn btn-primary"
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  View
                </Link>
                <Link
                  to={`/workouts/${workout._id}/edit`}
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  Edit
                </Link>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(workout._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workouts;

