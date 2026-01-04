import express from 'express';
import Exercise from '../models/Exercise.js';

const router = express.Router();

// Calorie calculation helper
const calculateCalories = (exercise, sets, reps, duration, weight, distance) => {
  let calories = 0;

  // Priority 1: Duration-based calculation (for cardio and exercises with duration)
  // This ensures calories increase proportionally with duration
  if (duration > 0) {
    // If exercise has caloriesPerMinute, use it
    if (exercise.caloriesPerMinute > 0) {
      calories = exercise.caloriesPerMinute * duration;
    }
    // Otherwise, use muscle group-based estimation
    else {
      const baseCaloriesPerMin = {
        'Cardio': 10,
        'Full Body': 8,
        'Legs': 7,
        'Back': 6,
        'Chest': 6,
        'Shoulders': 5,
        'Arms': 4,
        'Core': 5,
        'Other': 5,
      };
      calories = (baseCaloriesPerMin[exercise.muscleGroup] || 5) * duration;
      
      // Add bonus for weight if provided (heavier exercises burn more per minute)
      if (weight > 0) {
        calories += (weight / 10) * duration * 0.2;
      }
    }
  }
  // Priority 2: Distance-based (for running/cycling)
  else if (distance > 0) {
    if (exercise.muscleGroup === 'Cardio') {
      // Approximate: 1 km running = ~60 calories, cycling = ~30 calories
      const caloriesPerKm = exercise.name.toLowerCase().includes('run') ? 60 : 30;
      calories = distance * caloriesPerKm;
    }
  }
  // Priority 3: Rep-based (for strength exercises without duration)
  else if (exercise.caloriesPerRep > 0 && sets > 0 && reps > 0) {
    calories = exercise.caloriesPerRep * sets * reps;
    // Add weight factor (heavier = more calories)
    if (weight > 0) {
      calories += (weight / 10) * sets * reps * 0.1;
    }
  }
  // Priority 4: Fallback - estimate based on sets and reps only
  else if (sets > 0 && reps > 0) {
    const baseCaloriesPerSet = {
      'Legs': 15,
      'Back': 12,
      'Chest': 12,
      'Full Body': 20,
      'Shoulders': 10,
      'Arms': 8,
      'Core': 10,
      'Other': 8,
    };
    calories = (baseCaloriesPerSet[exercise.muscleGroup] || 8) * sets;
    if (weight > 0) {
      calories += (weight / 10) * sets * 0.5;
    }
  }

  return Math.round(calories);
};

// @route   GET /api/recommendations/exercises
// @desc    Get exercise recommendations based on muscle group
// @access  Private
router.get('/exercises', async (req, res) => {
  try {
    const { muscleGroup, difficulty, excludeIds } = req.query;

    let query = {
      isCustom: false,
    };

    if (muscleGroup && muscleGroup !== 'All') {
      query.muscleGroup = muscleGroup;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (excludeIds) {
      const excludeArray = Array.isArray(excludeIds) ? excludeIds : excludeIds.split(',');
      query._id = { $nin: excludeArray };
    }

    const exercises = await Exercise.find(query)
      .sort({ name: 1 })
      .limit(20);

    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/recommendations/workouts
// @desc    Get workout template recommendations
// @access  Private
router.get('/workouts', async (req, res) => {
  try {
    const { goal, duration, difficulty } = req.query;

    const workoutTemplates = [
      {
        name: 'Full Body Strength',
        description: 'Complete full body workout targeting all major muscle groups',
        difficulty: 'Intermediate',
        estimatedDuration: 60,
        estimatedCalories: 400,
        exercises: [
          { muscleGroup: 'Legs', count: 2, suggestions: ['Squats', 'Lunges'] },
          { muscleGroup: 'Chest', count: 2, suggestions: ['Push-ups', 'Bench Press'] },
          { muscleGroup: 'Back', count: 2, suggestions: ['Pull-ups', 'Deadlifts'] },
          { muscleGroup: 'Shoulders', count: 1, suggestions: ['Shoulder Press'] },
          { muscleGroup: 'Core', count: 1, suggestions: ['Plank'] },
        ],
      },
      {
        name: 'Upper Body Focus',
        description: 'Target chest, back, shoulders, and arms',
        difficulty: 'Intermediate',
        estimatedDuration: 45,
        estimatedCalories: 300,
        exercises: [
          { muscleGroup: 'Chest', count: 3, suggestions: ['Push-ups', 'Bench Press', 'Chest Dips'] },
          { muscleGroup: 'Back', count: 2, suggestions: ['Pull-ups', 'Rows'] },
          { muscleGroup: 'Shoulders', count: 2, suggestions: ['Shoulder Press', 'Lateral Raises'] },
          { muscleGroup: 'Arms', count: 2, suggestions: ['Bicep Curls', 'Tricep Dips'] },
        ],
      },
      {
        name: 'Lower Body Power',
        description: 'Intense leg and glute workout',
        difficulty: 'Advanced',
        estimatedDuration: 50,
        estimatedCalories: 450,
        exercises: [
          { muscleGroup: 'Legs', count: 4, suggestions: ['Squats', 'Deadlifts', 'Lunges', 'Leg Press'] },
          { muscleGroup: 'Core', count: 2, suggestions: ['Plank', 'Mountain Climbers'] },
        ],
      },
      {
        name: 'Cardio Blast',
        description: 'High-intensity cardio workout',
        difficulty: 'Intermediate',
        estimatedDuration: 30,
        estimatedCalories: 350,
        exercises: [
          { muscleGroup: 'Cardio', count: 3, suggestions: ['Running', 'Cycling', 'Burpees'] },
          { muscleGroup: 'Full Body', count: 2, suggestions: ['Jumping Jacks', 'Mountain Climbers'] },
        ],
      },
      {
        name: 'Core Strength',
        description: 'Focus on building a strong core',
        difficulty: 'Beginner',
        estimatedDuration: 25,
        estimatedCalories: 150,
        exercises: [
          { muscleGroup: 'Core', count: 5, suggestions: ['Plank', 'Crunches', 'Leg Raises', 'Russian Twists', 'Mountain Climbers'] },
        ],
      },
      {
        name: 'Quick Morning Routine',
        description: 'Fast-paced full body workout',
        difficulty: 'Beginner',
        estimatedDuration: 20,
        estimatedCalories: 200,
        exercises: [
          { muscleGroup: 'Full Body', count: 3, suggestions: ['Burpees', 'Jumping Jacks', 'Mountain Climbers'] },
          { muscleGroup: 'Core', count: 2, suggestions: ['Plank', 'Crunches'] },
        ],
      },
    ];

    // Filter templates based on query params
    let filteredTemplates = workoutTemplates;

    if (goal) {
      const goalLower = goal.toLowerCase();
      filteredTemplates = filteredTemplates.filter(t => 
        t.name.toLowerCase().includes(goalLower) ||
        t.description.toLowerCase().includes(goalLower)
      );
    }

    if (difficulty) {
      filteredTemplates = filteredTemplates.filter(t => 
        t.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    if (duration) {
      const maxDuration = parseInt(duration);
      filteredTemplates = filteredTemplates.filter(t => t.estimatedDuration <= maxDuration);
    }

    res.json(filteredTemplates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/recommendations/calculate-calories
// @desc    Calculate calories for an exercise
// @access  Private
router.post('/calculate-calories', async (req, res) => {
  try {
    const { exerciseId, sets, reps, duration, weight, distance } = req.body;

    if (!exerciseId) {
      return res.status(400).json({ message: 'Exercise ID is required' });
    }

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    const calories = calculateCalories(
      exercise,
      sets || 0,
      reps || 0,
      duration || 0,
      weight || 0,
      distance || 0
    );

    res.json({ calories, exercise: exercise.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export the calculateCalories function for use in other routes
export { calculateCalories };

export default router;

