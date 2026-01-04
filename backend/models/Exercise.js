import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    muscleGroup: {
      type: String,
      enum: [
        'Chest',
        'Back',
        'Shoulders',
        'Arms',
        'Legs',
        'Core',
        'Cardio',
        'Full Body',
        'Other',
      ],
      default: 'Other',
    },
    caloriesPerMinute: {
      type: Number,
      default: 0, // For cardio/endurance exercises
    },
    caloriesPerRep: {
      type: Number,
      default: 0, // For strength exercises (approximate)
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Exercise = mongoose.model('Exercise', exerciseSchema);

export default Exercise;

