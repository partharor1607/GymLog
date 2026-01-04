import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import API_BASE_URL from '../config/api';

const Dashboard = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    fetchWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleCompleteToggle = async (workoutId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const workout = workouts.find(w => w._id === workoutId);
      await axios.put(`${API_BASE_URL}/api/workouts/${workoutId}`, {
        isCompleted: newStatus,
      });
      await fetchWorkouts();
      
      // Show calories message when completing workout
      if (newStatus && workout && workout.totalCaloriesBurned > 0) {
        alert(`🔥 Great job! You've burned approximately ${workout.totalCaloriesBurned} kcal (kilocalories) in this workout!`);
      }
    } catch (error) {
      console.error('Error updating workout:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading workouts...</div>;
  }

  const pendingCount = workouts.filter(w => !w.isCompleted).length;
  const completedCount = workouts.filter(w => w.isCompleted).length;
  const totalCaloriesBurned = workouts
    .filter(w => w.isCompleted)
    .reduce((sum, w) => sum + (w.totalCaloriesBurned || 0), 0);
  
  // Calculate today's calories
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCalories = workouts
    .filter(w => {
      if (!w.isCompleted) return false;
      const workoutDate = new Date(w.completedAt || w.scheduledDate);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === today.getTime();
    })
    .reduce((sum, w) => sum + (w.totalCaloriesBurned || 0), 0);
  
  // Calculate expected calories from pending workouts today
  const todayPending = workouts.filter(w => {
    if (w.isCompleted) return false;
    const workoutDate = new Date(w.scheduledDate);
    workoutDate.setHours(0, 0, 0, 0);
    return workoutDate.getTime() === today.getTime();
  });
  const expectedCaloriesToday = todayPending.reduce((sum, w) => sum + (w.totalCaloriesBurned || 0), 0);

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        background: '#2d2d2d',
        padding: '20px',
        borderRadius: '16px',
        border: '2px solid #ffffff'
      }}>
        <h1 style={{ 
          fontSize: '42px', 
          fontWeight: '900',
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          margin: 0
        }}>
          Dashboard
        </h1>
        <Link to="/workouts/new" className="btn btn-primary" style={{ fontSize: '16px', padding: '12px 24px' }}>
          ➕ New Workout
        </Link>
      </div>

      <div className="report-summary">
        <div className="report-card">
          <p>Total Workouts</p>
          <h3>{workouts.length}</h3>
        </div>
        <div className="report-card">
          <p>Completed</p>
          <h3>{completedCount}</h3>
        </div>
        <div className="report-card">
          <p>Pending</p>
          <h3>{pendingCount}</h3>
        </div>
        <div className="report-card" style={{ backgroundColor: '#1a1a1a', border: '3px solid #00ff88' }}>
          <p>🔥 Calories Burned Today</p>
          <h3 style={{ color: '#00ff88' }}>{todayCalories} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>kcal</span></h3>
          <p style={{ fontSize: '10px', color: '#aaaaaa', margin: '3px 0 0 0', opacity: 0.8 }}>(kilocalories)</p>
          {expectedCaloriesToday > 0 && (
            <p style={{ fontSize: '12px', color: '#00ff88', margin: '5px 0 0 0', fontWeight: '600' }}>
              Expected: +{expectedCaloriesToday} kcal
            </p>
          )}
        </div>
        <div className="report-card">
          <p>🔥 Total Calories</p>
          <h3>{totalCaloriesBurned} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>kcal</span></h3>
          <p style={{ fontSize: '10px', color: '#aaaaaa', margin: '3px 0 0 0', opacity: 0.8 }}>(kilocalories)</p>
        </div>
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
                  View Details
                </Link>
                <button
                  className={`btn ${workout.isCompleted ? 'btn-secondary' : 'btn-success'}`}
                  onClick={() => handleCompleteToggle(workout._id, workout.isCompleted)}
                >
                  {workout.isCompleted ? 'Mark Pending' : 'Mark Complete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

