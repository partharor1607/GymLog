import mongoose from 'mongoose';

const workoutExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  sets: {
    type: Number,
    default: 0,
  },
  reps: {
    type: Number,
    default: 0,
  },
  weight: {
    type: Number,
    default: 0,
  },
  duration: {
    type: Number, // in minutes
    default: 0,
  },
  distance: {
    type: Number, // in km
    default: 0,
  },
  caloriesBurned: {
    type: Number,
    default: 0, // Calculated based on exercise type, duration, reps, etc.
  },
  completed: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    trim: true,
  },
});

const workoutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workout name is required'],
      trim: true,
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
    },
    scheduledTime: {
      type: String, // Format: "HH:MM"
      default: null,
    },
    exercises: [workoutExerciseSchema],
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    overallNotes: {
      type: String,
      trim: true,
    },
    totalCaloriesBurned: {
      type: Number,
      default: 0, // Sum of all exercise calories
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
workoutSchema.index({ scheduledDate: -1 });
workoutSchema.index({ isCompleted: 1 });

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout;

