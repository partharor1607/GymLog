import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from '../models/Exercise.js';

dotenv.config();

const exercises = [
  { name: 'Push-ups', description: 'Classic bodyweight exercise for chest and arms', muscleGroup: 'Chest', caloriesPerRep: 0.5, difficulty: 'Beginner' },
  { name: 'Pull-ups', description: 'Upper body strength exercise', muscleGroup: 'Back', caloriesPerRep: 1, difficulty: 'Intermediate' },
  { name: 'Squats', description: 'Lower body compound exercise', muscleGroup: 'Legs', caloriesPerRep: 0.8, difficulty: 'Beginner' },
  { name: 'Deadlifts', description: 'Full body compound movement', muscleGroup: 'Back', caloriesPerRep: 1.2, difficulty: 'Advanced' },
  { name: 'Bench Press', description: 'Chest and triceps exercise', muscleGroup: 'Chest', caloriesPerRep: 0.7, difficulty: 'Intermediate' },
  { name: 'Shoulder Press', description: 'Overhead pressing movement', muscleGroup: 'Shoulders', caloriesPerRep: 0.6, difficulty: 'Intermediate' },
  { name: 'Bicep Curls', description: 'Arm isolation exercise', muscleGroup: 'Arms', caloriesPerRep: 0.3, difficulty: 'Beginner' },
  { name: 'Tricep Dips', description: 'Tricep and shoulder exercise', muscleGroup: 'Arms', caloriesPerRep: 0.4, difficulty: 'Intermediate' },
  { name: 'Lunges', description: 'Unilateral leg exercise', muscleGroup: 'Legs', caloriesPerRep: 0.6, difficulty: 'Beginner' },
  { name: 'Plank', description: 'Core stability exercise', muscleGroup: 'Core', caloriesPerMinute: 3, difficulty: 'Beginner' },
  { name: 'Running', description: 'Cardiovascular exercise', muscleGroup: 'Cardio', caloriesPerMinute: 10, difficulty: 'Intermediate' },
  { name: 'Cycling', description: 'Low impact cardio exercise', muscleGroup: 'Cardio', caloriesPerMinute: 8, difficulty: 'Beginner' },
  { name: 'Burpees', description: 'Full body conditioning exercise', muscleGroup: 'Full Body', caloriesPerRep: 1.5, difficulty: 'Advanced' },
  { name: 'Mountain Climbers', description: 'Cardio and core exercise', muscleGroup: 'Core', caloriesPerMinute: 12, difficulty: 'Intermediate' },
  { name: 'Jumping Jacks', description: 'Full body warm-up exercise', muscleGroup: 'Cardio', caloriesPerMinute: 8, difficulty: 'Beginner' },
];

const seedExercises = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-tracker');
    console.log('Connected to MongoDB');

    // Clear existing predefined exercises (not custom ones)
    await Exercise.deleteMany({ isCustom: false });
    console.log('Cleared existing predefined exercises');

    // Insert new exercises
    await Exercise.insertMany(exercises);
    console.log(`Successfully seeded ${exercises.length} exercises`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding exercises:', error);
    process.exit(1);
  }
};

seedExercises();

