import express from 'express';
import Workout from '../models/Workout.js';
import Exercise from '../models/Exercise.js';
import { calculateCalories } from './recommendationsRoutes.js';

const router = express.Router();

// @route   GET /api/workouts
// @desc    Get all workouts for the user, sorted by date
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};

    // Filter by completion status
    if (status === 'completed') {
      query.isCompleted = true;
    } else if (status === 'pending') {
      query.isCompleted = false;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) {
        query.scheduledDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.scheduledDate.$lte = new Date(endDate);
      }
    }

    const workouts = await Workout.find(query)
      .populate('exercises.exercise', 'name description muscleGroup')
      .sort({ scheduledDate: -1, scheduledTime: -1 })
      .exec();

    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/workouts/:id
// @desc    Get a single workout
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('exercises.exercise', 'name description muscleGroup');

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/workouts
// @desc    Create a new workout
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { name, scheduledDate, scheduledTime, exercises, overallNotes } = req.body;

    if (!name || !scheduledDate) {
      return res.status(400).json({ message: 'Name and scheduled date are required' });
    }

    // Calculate calories for each exercise
    let totalCalories = 0;
    const exercisesWithCalories = await Promise.all(
      (exercises || []).map(async (ex) => {
        if (ex.exercise) {
          const exerciseDoc = await Exercise.findById(ex.exercise);
          if (exerciseDoc) {
            const calories = calculateCalories(
              exerciseDoc,
              ex.sets || 0,
              ex.reps || 0,
              ex.duration || 0,
              ex.weight || 0,
              ex.distance || 0
            );
            totalCalories += calories;
            return { ...ex, caloriesBurned: calories };
          }
        }
        return { ...ex, caloriesBurned: 0 };
      })
    );

    const workout = await Workout.create({
      name,
      scheduledDate: new Date(scheduledDate),
      scheduledTime: scheduledTime || null,
      exercises: exercisesWithCalories,
      overallNotes: overallNotes || '',
      totalCaloriesBurned: totalCalories,
    });

    const populatedWorkout = await Workout.findById(workout._id)
      .populate('exercises.exercise', 'name description muscleGroup');

    res.status(201).json(populatedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/workouts/:id
// @desc    Update a workout
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const { name, scheduledDate, scheduledTime, exercises, isCompleted, overallNotes } = req.body;

    if (name) workout.name = name;
    if (scheduledDate) workout.scheduledDate = new Date(scheduledDate);
    if (scheduledTime !== undefined) workout.scheduledTime = scheduledTime;
    if (overallNotes !== undefined) workout.overallNotes = overallNotes;
    
    // Recalculate calories if exercises are updated
    if (exercises) {
      let totalCalories = 0;
      const exercisesWithCalories = await Promise.all(
        exercises.map(async (ex) => {
          if (ex.exercise) {
            const exerciseDoc = await Exercise.findById(ex.exercise);
            if (exerciseDoc) {
              const calories = calculateCalories(
                exerciseDoc,
                ex.sets || 0,
                ex.reps || 0,
                ex.duration || 0,
                ex.weight || 0,
                ex.distance || 0
              );
              totalCalories += calories;
              return { ...ex, caloriesBurned: calories };
            }
          }
          return { ...ex, caloriesBurned: ex.caloriesBurned || 0 };
        })
      );
      workout.exercises = exercisesWithCalories;
      workout.totalCaloriesBurned = totalCalories;
    }
    
    // Handle completion
    if (isCompleted !== undefined) {
      workout.isCompleted = isCompleted;
      if (isCompleted && !workout.completedAt) {
        workout.completedAt = new Date();
      } else if (!isCompleted) {
        workout.completedAt = null;
      }
    }

    const updatedWorkout = await workout.save();
    const populatedWorkout = await Workout.findById(updatedWorkout._id)
      .populate('exercises.exercise', 'name description muscleGroup');

    res.json(populatedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/workouts/:id/exercises/:exerciseId
// @desc    Update a specific exercise in a workout
// @access  Private
router.patch('/:id/exercises/:exerciseId', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const exercise = workout.exercises.id(req.params.exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found in workout' });
    }

    const { sets, reps, weight, duration, distance, completed, notes } = req.body;

    if (sets !== undefined) exercise.sets = sets;
    if (reps !== undefined) exercise.reps = reps;
    if (weight !== undefined) exercise.weight = weight;
    if (duration !== undefined) exercise.duration = duration;
    if (distance !== undefined) exercise.distance = distance;
    if (completed !== undefined) exercise.completed = completed;
    if (notes !== undefined) exercise.notes = notes;

    // Recalculate calories for this exercise
    const exerciseDoc = await Exercise.findById(exercise.exercise);
    if (exerciseDoc) {
      const calories = calculateCalories(
        exerciseDoc,
        exercise.sets || 0,
        exercise.reps || 0,
        exercise.duration || 0,
        exercise.weight || 0,
        exercise.distance || 0
      );
      exercise.caloriesBurned = calories;
      
      // Recalculate total calories
      workout.totalCaloriesBurned = workout.exercises.reduce(
        (sum, ex) => sum + (ex.caloriesBurned || 0),
        0
      );
    }

    await workout.save();
    const populatedWorkout = await Workout.findById(workout._id)
      .populate('exercises.exercise', 'name description muscleGroup');

    res.json(populatedWorkout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/workouts/:id
// @desc    Delete a workout
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    await workout.deleteOne();
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

