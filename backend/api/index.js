// Vercel serverless function - Express app handler
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import workoutRoutes from '../routes/workoutRoutes.js';
import exerciseRoutes from '../routes/exerciseRoutes.js';
import reportRoutes from '../routes/reportRoutes.js';
import recommendationsRoutes from '../routes/recommendationsRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/recommendations', recommendationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'GymLog API is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'GymLog API',
    endpoints: [
      '/api/health',
      '/api/workouts',
      '/api/exercises',
      '/api/reports',
      '/api/recommendations'
    ]
  });
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness-tracker';

// MongoDB connection (cached for serverless)
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedConnection = connection;
    console.log('Connected to MongoDB');
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    cachedConnection = null;
    throw error;
  }
}

// Connect on first request
connectToDatabase().catch(console.error);

// Export handler for Vercel
export default async (req, res) => {
  // Ensure MongoDB is connected
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
  
  // Handle the request
  return app(req, res);
};
