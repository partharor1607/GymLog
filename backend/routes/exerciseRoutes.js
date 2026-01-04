import express from 'express';
import Exercise from '../models/Exercise.js';

const router = express.Router();

// @route   GET /api/exercises
// @desc    Get all exercises (predefined + user's custom)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const exercises = await Exercise.find({ isCustom: false }).sort({ name: 1 });

    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/exercises
// @desc    Create a custom exercise
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { name, description, muscleGroup } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Exercise name is required' });
    }

    const exercise = await Exercise.create({
      name,
      description,
      muscleGroup: muscleGroup || 'Other',
      isCustom: true,
    });

    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/exercises/:id
// @desc    Update a custom exercise
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Only allow updating custom exercises
    if (!exercise.isCustom) {
      return res.status(403).json({ message: 'Cannot update predefined exercises' });
    }

    const { name, description, muscleGroup } = req.body;

    if (name) exercise.name = name;
    if (description !== undefined) exercise.description = description;
    if (muscleGroup) exercise.muscleGroup = muscleGroup;

    const updatedExercise = await exercise.save();
    res.json(updatedExercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/exercises/:id
// @desc    Delete a custom exercise
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Only allow deleting custom exercises
    if (!exercise.isCustom) {
      return res.status(403).json({ message: 'Cannot delete predefined exercises' });
    }

    await exercise.deleteOne();
    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

