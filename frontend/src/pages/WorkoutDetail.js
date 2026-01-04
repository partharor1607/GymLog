import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  const fetchWorkout = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/workouts/${id}`);
      setWorkout(response.data);
    } catch (error) {
      setError('Failed to load workout');
      console.error('Error fetching workout:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseUpdate = async (exerciseId, updates) => {
    try {
      await axios.patch(
        `http://localhost:5001/api/workouts/${id}/exercises/${exerciseId}`,
        updates
      );
      fetchWorkout();
    } catch (error) {
      console.error('Error updating exercise:', error);
      alert('Failed to update exercise');
    }
  };

  const handleWorkoutComplete = async () => {
    try {
      const newStatus = !workout.isCompleted;
      await axios.put(`http://localhost:5001/api/workouts/${id}`, {
        isCompleted: newStatus,
      });
      await fetchWorkout();
      
      // Show calories message when completing workout
      if (newStatus && workout.totalCaloriesBurned > 0) {
        alert(`🔥 Great job! You've burned approximately ${workout.totalCaloriesBurned} calories in this workout!`);
      }
    } catch (error) {
      console.error('Error updating workout:', error);
      alert('Failed to update workout');
    }
  };

  if (loading) {
    return <div className="loading">Loading workout...</div>;
  }

  if (error || !workout) {
    return (
      <div>
        <div className="error">{error || 'Workout not found'}</div>
        <Link to="/workouts" className="btn btn-primary">
          Back to Workouts
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1>{workout.name}</h1>
          <p style={{ color: '#6c757d', marginTop: '5px' }}>
            📅 {format(new Date(workout.scheduledDate), 'MMMM dd, yyyy')}
            {workout.scheduledTime && ` at ${workout.scheduledTime}`}
          </p>
        </div>
        <div>
          <span className={`status-badge ${workout.isCompleted ? 'completed' : 'pending'}`}>
            {workout.isCompleted ? 'Completed' : 'Pending'}
          </span>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>Exercises</h2>
            {workout.totalCaloriesBurned > 0 && (
              <div style={{ marginTop: '5px', fontSize: '16px', color: '#28a745', fontWeight: 'bold' }}>
                🔥 Total Calories Burned: {workout.totalCaloriesBurned} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>kcal</span>
              </div>
            )}
          </div>
          <button
            className={`btn ${workout.isCompleted ? 'btn-secondary' : 'btn-success'}`}
            onClick={handleWorkoutComplete}
          >
            {workout.isCompleted ? 'Mark as Pending' : 'Mark as Complete'}
          </button>
        </div>

        {workout.exercises.length === 0 ? (
          <p>No exercises in this workout.</p>
        ) : (
          workout.exercises.map((exerciseItem, index) => {
            const exercise = exerciseItem.exercise;
            return (
              <div key={exerciseItem._id} className="exercise-item">
                <div className="exercise-item-header">
                  <h4>
                    {exercise?.name || 'Unknown Exercise'}
                    {exercise?.muscleGroup && (
                      <span style={{ marginLeft: '10px', fontSize: '14px', color: '#6c757d' }}>
                        ({exercise.muscleGroup})
                      </span>
                    )}
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={exerciseItem.completed}
                      onChange={(e) =>
                        handleExerciseUpdate(exerciseItem._id, { completed: e.target.checked })
                      }
                    />
                    <span>Completed</span>
                  </label>
                </div>

                <div className="exercise-item-details">
                  {exerciseItem.sets > 0 && <div>Sets: {exerciseItem.sets}</div>}
                  {exerciseItem.reps > 0 && <div>Reps: {exerciseItem.reps}</div>}
                  {exerciseItem.weight > 0 && <div>Weight: {exerciseItem.weight} kg</div>}
                  {exerciseItem.duration > 0 && <div>Duration: {exerciseItem.duration} min</div>}
                  {exerciseItem.distance > 0 && <div>Distance: {exerciseItem.distance} km</div>}
                  {exerciseItem.caloriesBurned > 0 && (
                    <div style={{ color: '#28a745', fontWeight: 'bold' }}>
                      🔥 Calories: {exerciseItem.caloriesBurned} kcal
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginTop: '15px' }}>
                  <label>Notes</label>
                  <textarea
                    value={exerciseItem.notes || ''}
                    onChange={(e) =>
                      handleExerciseUpdate(exerciseItem._id, { notes: e.target.value })
                    }
                    placeholder="How did this exercise feel? Any adjustments needed?"
                    rows="3"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {workout.overallNotes && (
        <div className="card">
          <h2>Overall Notes</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{workout.overallNotes}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <Link to={`/workouts/${id}/edit`} className="btn btn-primary">
          Edit Workout
        </Link>
        <Link to="/workouts" className="btn btn-secondary">
          Back to Workouts
        </Link>
      </div>
    </div>
  );
};

export default WorkoutDetail;

