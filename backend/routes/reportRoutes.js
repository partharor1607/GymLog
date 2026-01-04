import express from 'express';
import Workout from '../models/Workout.js';

const router = express.Router();

// @route   GET /api/reports/workouts
// @desc    Get workout completion report
// @access  Private
router.get('/workouts', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'Start date and end date are required (format: YYYY-MM-DD)' 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    const workouts = await Workout.find({
      scheduledDate: {
        $gte: start,
        $lte: end,
      },
    });

    const totalWorkouts = workouts.length;
    const completedWorkouts = workouts.filter(w => w.isCompleted).length;
    const pendingWorkouts = totalWorkouts - completedWorkouts;
    const completionPercentage = totalWorkouts > 0 
      ? ((completedWorkouts / totalWorkouts) * 100).toFixed(2) 
      : 0;

    // Group by date
    const workoutsByDate = workouts.reduce((acc, workout) => {
      const dateKey = workout.scheduledDate.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          total: 0,
          completed: 0,
          pending: 0,
        };
      }
      acc[dateKey].total++;
      if (workout.isCompleted) {
        acc[dateKey].completed++;
      } else {
        acc[dateKey].pending++;
      }
      return acc;
    }, {});

    res.json({
      period: {
        startDate,
        endDate,
      },
      summary: {
        totalWorkouts,
        completedWorkouts,
        pendingWorkouts,
        completionPercentage: parseFloat(completionPercentage),
      },
      workoutsByDate: Object.values(workoutsByDate).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      ),
      workouts: workouts.map(w => ({
        _id: w._id,
        name: w.name,
        scheduledDate: w.scheduledDate,
        isCompleted: w.isCompleted,
        completedAt: w.completedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

