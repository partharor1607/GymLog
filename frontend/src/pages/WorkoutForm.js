import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import WorkoutSuggestions from '../components/WorkoutSuggestions';
import { commonWorkoutNames } from '../utils/commonWorkoutNames';
import { getExerciseSuggestions } from '../utils/workoutExerciseSuggestions';

const WorkoutForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    scheduledDate: new Date(),
    scheduledTime: '',
    exercises: [],
    overallNotes: '',
  });
  const [availableExercises, setAvailableExercises] = useState([]);
  const [recommendedExercises, setRecommendedExercises] = useState([]);
  const [suggestedExercises, setSuggestedExercises] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalCalories, setTotalCalories] = useState(0);

  useEffect(() => {
    fetchExercises();
    if (isEdit) {
      fetchWorkout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchExercises = async () => {
    try {
      setLoadingExercises(true);
      const response = await axios.get('http://localhost:5001/api/exercises');
      console.log('Fetched exercises:', response.data?.length || 0);
      if (response.data && response.data.length > 0) {
        setAvailableExercises(response.data);
      } else {
        console.warn('No exercises returned from API');
        setAvailableExercises([]);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
      console.error('Error details:', error.response?.data || error.message);
      setAvailableExercises([]);
    } finally {
      setLoadingExercises(false);
    }
  };

  const fetchWorkout = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/workouts/${id}`);
      const workout = response.data;
      const exercises = workout.exercises.map(ex => ({
        ...ex,
        exercise: typeof ex.exercise === 'object' ? ex.exercise._id : ex.exercise,
      })) || [];
      const total = exercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0);
      setTotalCalories(total);
      setFormData({
        name: workout.name,
        scheduledDate: new Date(workout.scheduledDate),
        scheduledTime: workout.scheduledTime || '',
        exercises,
        overallNotes: workout.overallNotes || '',
      });
    } catch (error) {
      console.error('Error fetching workout:', error);
      setError('Failed to load workout');
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: newValue,
    });
    
    // If workout name changed, get exercise suggestions
    if (e.target.name === 'name' && newValue) {
      const suggestions = getExerciseSuggestions(newValue);
      if (suggestions.length > 0) {
        // Match suggestions with available exercises
        const matchedExercises = availableExercises.filter(ex => 
          suggestions.some(suggestion => 
            ex.name.toLowerCase().includes(suggestion.toLowerCase()) ||
            suggestion.toLowerCase().includes(ex.name.toLowerCase())
          )
        );
        setSuggestedExercises(matchedExercises);
      } else {
        setSuggestedExercises([]);
      }
    }
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      scheduledDate: date,
    });
  };

  const addExercise = (exerciseId = null) => {
    setFormData({
      ...formData,
      exercises: [
        ...formData.exercises,
        {
          exercise: exerciseId || '',
          sets: 0,
          reps: 0,
          weight: 0,
          duration: 0,
          distance: 0,
          completed: false,
          notes: '',
        },
      ],
    });
  };


  const removeExercise = (index) => {
    const newExercises = formData.exercises.filter((_, i) => i !== index);
    const total = newExercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0);
    setTotalCalories(total);
    setFormData({
      ...formData,
      exercises: newExercises,
    });
  };

  const fetchRecommendedExercises = async (muscleGroup) => {
    try {
      const response = await axios.get('http://localhost:5001/api/recommendations/exercises', {
        params: { muscleGroup: muscleGroup || 'All' },
      });
      setRecommendedExercises(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const updateExercise = async (index, field, value) => {
    const updatedExercises = [...formData.exercises];
    
    // Convert value to appropriate type
    let convertedValue = value;
    if (['sets', 'reps', 'duration', 'weight', 'distance'].includes(field)) {
      convertedValue = field === 'duration' || field === 'weight' || field === 'distance' 
        ? parseFloat(value) || 0 
        : parseInt(value) || 0;
    }
    
    updatedExercises[index][field] = convertedValue;
    
    // Calculate calories if exercise details changed and exercise is selected
    if (['sets', 'reps', 'duration', 'weight', 'distance'].includes(field) && updatedExercises[index].exercise) {
      try {
        const exerciseData = {
          exerciseId: updatedExercises[index].exercise,
          sets: parseInt(updatedExercises[index].sets) || 0,
          reps: parseInt(updatedExercises[index].reps) || 0,
          duration: parseFloat(updatedExercises[index].duration) || 0,
          weight: parseFloat(updatedExercises[index].weight) || 0,
          distance: parseFloat(updatedExercises[index].distance) || 0,
        };
        
        // Update the specific field that changed
        if (field === 'sets') exerciseData.sets = convertedValue;
        if (field === 'reps') exerciseData.reps = convertedValue;
        if (field === 'duration') exerciseData.duration = convertedValue;
        if (field === 'weight') exerciseData.weight = convertedValue;
        if (field === 'distance') exerciseData.distance = convertedValue;
        
        const response = await axios.post('http://localhost:5001/api/recommendations/calculate-calories', exerciseData);
        updatedExercises[index].caloriesBurned = response.data.calories || 0;
        
        // Recalculate total calories after getting the response
        const total = updatedExercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0);
        setTotalCalories(total);
      } catch (error) {
        console.error('Error calculating calories:', error);
        // Still update the form even if calorie calculation fails
      }
    }
    
    // Recalculate total calories (fallback if async didn't complete yet)
    const total = updatedExercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0);
    setTotalCalories(total);
    
    setFormData({
      ...formData,
      exercises: updatedExercises,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const workoutData = {
        ...formData,
        scheduledDate: formData.scheduledDate.toISOString(),
        exercises: formData.exercises.map((ex) => {
          // Ensure exercise is just the ID, not the full object
          const exerciseId = typeof ex.exercise === 'object' ? ex.exercise._id : ex.exercise;
          return {
            exercise: exerciseId,
            sets: parseInt(ex.sets) || 0,
            reps: parseInt(ex.reps) || 0,
            weight: parseFloat(ex.weight) || 0,
            duration: parseFloat(ex.duration) || 0,
            distance: parseFloat(ex.distance) || 0,
            completed: ex.completed || false,
            notes: ex.notes || '',
          };
        }),
      };

      if (isEdit) {
        await axios.put(`http://localhost:5001/api/workouts/${id}`, workoutData);
      } else {
        await axios.post('http://localhost:5001/api/workouts', workoutData);
      }

      navigate('/workouts');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>{isEdit ? 'Edit Workout' : 'Create New Workout'}</h1>
        {!isEdit && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowSuggestions(!showSuggestions)}
          >
            {showSuggestions ? 'Hide' : 'Show'} Workout Suggestions
          </button>
        )}
      </div>

      {showSuggestions && !isEdit && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <WorkoutSuggestions
            onSelectTemplate={(template) => {
              // Populate form with template
              setFormData({
                ...formData,
                name: template.name,
                exercises: [],
              });
              setShowSuggestions(false);
              // You can expand this to auto-add exercises from template
            }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div style={{ 
        marginBottom: '25px', 
        padding: '20px', 
        background: '#1a1a1a',
        borderRadius: '12px',
        border: '2px solid #ffffff',
        boxShadow: '0 4px 12px rgba(255, 255, 255, 0.1)'
      }}>
          <strong style={{ fontSize: '16px', color: '#ffffff', display: 'block', marginBottom: '12px', fontWeight: '700' }}>💡 What's the difference?</strong>
          <ul style={{ marginTop: '10px', marginBottom: 0, paddingLeft: '25px', lineHeight: '1.8', color: '#cccccc' }}>
            <li style={{ marginBottom: '8px' }}><strong style={{ color: '#ffffff' }}>Workout:</strong> A complete session with multiple exercises (e.g., "Morning Cardio", "Leg Day")</li>
            <li><strong style={{ color: '#ffffff' }}>Exercise:</strong> Individual movements within a workout (e.g., "Squats", "Push-ups", "Running")</li>
          </ul>
        </div>

        <div className="form-group">
          <label>Workout Name *</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              list="workout-names"
              placeholder="Type or select a workout name"
              required
              style={{ width: '100%' }}
            />
            <datalist id="workout-names">
              {commonWorkoutNames.map((name, index) => (
                <option key={index} value={name} />
              ))}
            </datalist>
            {formData.name && (
              <div style={{ marginTop: '5px', fontSize: '12px', color: '#aaaaaa' }}>
                💡 Tip: Select from suggestions or type your own
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label>Scheduled Date *</label>
          <DatePicker
            selected={formData.scheduledDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            className="form-control"
            style={{ width: '100%', padding: '10px' }}
          />
        </div>

        <div className="form-group">
          <label>Scheduled Time (optional)</label>
          <input
            type="time"
            name="scheduledTime"
            value={formData.scheduledTime}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <label style={{ margin: 0 }}>Exercises</label>
              <div style={{ fontSize: '12px', color: '#aaaaaa', marginTop: '3px' }}>
                Add individual exercises to your workout (e.g., Squats, Push-ups, Running)
              </div>
            </div>
            {totalCalories > 0 && (
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: '#000000',
                padding: '10px 15px',
                backgroundColor: '#00ff88',
                borderRadius: '5px',
                border: '2px solid #00ff88'
              }}>
                🔥 Expected Calories: {totalCalories} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>kcal</span>
                <div style={{ fontSize: '11px', fontWeight: 'normal', marginTop: '3px', opacity: 0.8 }}>
                  (kcal = kilocalories)
                </div>
              </div>
            )}
          </div>


          {formData.exercises.map((exercise, index) => (
            <div key={index} className="exercise-item" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong>Exercise {index + 1}</strong>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {exercise.caloriesBurned > 0 ? (
                    <span style={{ 
                      color: '#000000', 
                      fontWeight: 'bold',
                      fontSize: '14px',
                      padding: '4px 8px',
                      backgroundColor: '#00ff88',
                      borderRadius: '5px',
                      border: '2px solid #00ff88'
                    }}>
                      🔥 {exercise.caloriesBurned} kcal
                    </span>
                  ) : exercise.exercise ? (
                    <span style={{ 
                      color: '#aaaaaa', 
                      fontSize: '12px',
                      fontStyle: 'italic'
                    }}>
                      💡 Add duration/sets/reps to see calories
                    </span>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      removeExercise(index);
                      const total = formData.exercises
                        .filter((_, i) => i !== index)
                        .reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0);
                      setTotalCalories(total);
                    }}
                    style={{ padding: '5px 10px', fontSize: '14px' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Exercise *</label>
                {loadingExercises ? (
                  <div style={{ padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '5px', color: '#ffffff', border: '2px solid #ffffff' }}>
                    ⏳ Loading exercises...
                  </div>
                ) : availableExercises.length === 0 ? (
                  <div style={{ padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '5px', color: '#ffaa00', border: '2px solid #ffaa00' }}>
                    ⚠️ No exercises found. Please seed the database by running: <code>cd backend && npm run seed</code>
                  </div>
                ) : (
                  <>
                    <select
                      value={exercise.exercise || ''}
                      onChange={async (e) => {
                        await updateExercise(index, 'exercise', e.target.value);
                        if (e.target.value) {
                          const selectedEx = availableExercises.find(ex => ex._id === e.target.value);
                          if (selectedEx) {
                            fetchRecommendedExercises(selectedEx.muscleGroup);
                          }
                        }
                      }}
                      required
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        fontSize: '16px',
                        border: '2px solid #ffffff',
                        borderRadius: '5px',
                        backgroundColor: '#2d2d2d',
                        color: '#ffffff',
                        cursor: 'pointer',
                        minHeight: '45px'
                      }}
                    >
                      <option value="">-- Click to select an exercise --</option>
                      {/* Suggested exercises based on workout name - shown first */}
                      {suggestedExercises.length > 0 && formData.name && (
                        <optgroup label={`💡 Suggested for "${formData.name}"`}>
                          {suggestedExercises.map((ex) => (
                            <option key={ex._id} value={ex._id}>
                              {ex.name} {ex.muscleGroup ? `(${ex.muscleGroup})` : ''}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {/* All exercises - always show all */}
                      {suggestedExercises.length > 0 && formData.name && (
                        <optgroup label="─────────────────────">
                          <option disabled>─────────────────────</option>
                        </optgroup>
                      )}
                      <optgroup label={suggestedExercises.length > 0 ? "All Exercises" : "Exercises"}>
                        {availableExercises
                          .filter(ex => !suggestedExercises.some(sug => sug._id === ex._id))
                          .map((ex) => (
                            <option key={ex._id} value={ex._id}>
                              {ex.name} {ex.muscleGroup ? `(${ex.muscleGroup})` : ''}
                            </option>
                          ))}
                      </optgroup>
                    </select>
                    {suggestedExercises.length > 0 && formData.name && (
                      <div style={{ marginTop: '5px', fontSize: '12px', color: '#00ff88', fontWeight: 'bold' }}>
                        💡 {suggestedExercises.length} suggested exercise{suggestedExercises.length > 1 ? 's' : ''} shown at the top!
                      </div>
                    )}
                    {availableExercises.length > 0 && (
                      <div style={{ marginTop: '5px', fontSize: '11px', color: '#aaaaaa' }}>
                        Total: {availableExercises.length} exercise{availableExercises.length !== 1 ? 's' : ''} available
                      </div>
                    )}
                  </>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <div className="form-group">
                  <label>Sets</label>
                  <input
                    type="number"
                    value={exercise.sets}
                    onChange={(e) => updateExercise(index, 'sets', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Reps</label>
                  <input
                    type="number"
                    value={exercise.reps}
                    onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    value={exercise.weight}
                    onChange={(e) => updateExercise(index, 'weight', e.target.value)}
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Duration (min) ⏱️</label>
                  <input
                    type="number"
                    value={exercise.duration}
                    onChange={(e) => updateExercise(index, 'duration', e.target.value)}
                    min="0"
                    step="0.5"
                    placeholder="0"
                  />
                  {exercise.duration > 0 && exercise.caloriesBurned > 0 && (
                    <div style={{ 
                      marginTop: '5px', 
                      fontSize: '11px', 
                      color: '#00ff88',
                      fontWeight: '600'
                    }}>
                      💡 Calories increase with duration: {exercise.caloriesBurned} kcal
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={exercise.notes}
                  onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                  placeholder="How did this exercise feel? Any adjustments needed?"
                />
              </div>
              {recommendedExercises.length > 0 && exercise.exercise && (
                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#1a1a1a', borderRadius: '5px', border: '2px solid #4a4a4a' }}>
                  <strong style={{ fontSize: '12px', color: '#ffffff' }}>💡 Recommendations:</strong>
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    Similar exercises: {recommendedExercises.slice(0, 3).map(ex => ex.name).join(', ')}
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={addExercise}
            style={{ marginBottom: '20px' }}
          >
            + Add Exercise
          </button>
        </div>

        <div className="form-group">
          <label>Overall Notes</label>
          <textarea
            name="overallNotes"
            value={formData.overallNotes}
            onChange={handleChange}
            placeholder="Overall comments about this workout..."
          />
        </div>

        {error && <div className="error">{error}</div>}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Workout' : 'Create Workout'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/workouts')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkoutForm;

