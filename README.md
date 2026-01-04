# GymLog 💪

A modern, full-stack MERN application for tracking fitness workouts, exercises, and progress. Built with a bold dark theme and intuitive user interface.

## Features

- ✅ Create, read, update, and delete workouts
- ✅ Schedule workouts with specific dates and times
- ✅ Add multiple exercises to each workout
- ✅ Track exercise details (sets, reps, weight, duration, distance)
- ✅ Automatic calorie calculation based on exercise type and duration
- ✅ Mark exercises and workouts as completed
- ✅ Add custom notes to exercises and workouts
- ✅ View workout reports with completion statistics
- ✅ Filter workouts by status (pending/completed)
- ✅ Exercise recommendations based on workout name
- ✅ Workout name suggestions
- ✅ Real-time calorie tracking
- ✅ Beautiful dark theme UI

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- RESTful API

### Frontend
- React
- React Router
- Axios for API calls
- React DatePicker
- date-fns for date manipulation

## Project Structure

```
GymLog/
├── backend/
│   ├── models/          # MongoDB models (Exercise, Workout)
│   ├── routes/          # API routes
│   ├── scripts/         # Database seeding scripts
│   └── server.js        # Express server
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── utils/       # Utility functions
    │   └── App.js       # Main app component
    └── public/          # Static files
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/fitness-tracker
```

4. Seed the database with predefined exercises:
```bash
npm run seed
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Exercises
- `GET /api/exercises` - Get all exercises
- `POST /api/exercises` - Create a custom exercise
- `PUT /api/exercises/:id` - Update a custom exercise
- `DELETE /api/exercises/:id` - Delete a custom exercise

### Workouts
- `GET /api/workouts` - Get all workouts
- `GET /api/workouts/:id` - Get a single workout
- `POST /api/workouts` - Create a new workout
- `PUT /api/workouts/:id` - Update a workout
- `PATCH /api/workouts/:id/exercises/:exerciseId` - Update exercise in workout
- `DELETE /api/workouts/:id` - Delete a workout

### Reports
- `GET /api/reports/workouts?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get workout completion report

### Recommendations
- `GET /api/recommendations/exercises?muscleGroup=...` - Get exercise recommendations
- `POST /api/recommendations/calculate-calories` - Calculate calories for an exercise

## Usage

1. **Dashboard**: View overview of all workouts with statistics
2. **Create Workout**: Add a new workout with exercises
3. **Track Progress**: Mark exercises and workouts as completed
4. **Add Notes**: Record how exercises felt and any adjustments needed
5. **View Reports**: See completion statistics for any date range
6. **Calorie Tracking**: Automatic calculation of calories burned based on exercise details

## Data Model

- **Exercise**: Predefined and custom exercises with muscle groups, calorie data
- **Workout**: Contains multiple exercises, scheduled date/time, completion status, and notes
- **WorkoutExercise**: Embedded document with exercise details (sets, reps, weight, duration, distance, calories) and completion status

## Calorie Calculation

The app automatically calculates calories burned based on:
- Exercise type (Cardio, Strength, etc.)
- Duration (for cardio exercises)
- Sets and reps (for strength exercises)
- Weight used
- Distance (for running/cycling)

## Design

- **Dark Theme**: Bold black, dark grey, and white color scheme
- **Green Accents**: Bright green (#00ff88) for highlights and success states
- **Modern UI**: Clean, minimalist design with smooth animations
- **Responsive**: Works on desktop and mobile devices

## Deployment

### Deploy to Vercel

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**

1. **Backend:**
   - Go to [vercel.com](https://vercel.com)
   - Import repository
   - Set root directory to `backend`
   - Add environment variable: `MONGODB_URI`
   - Deploy

2. **Frontend:**
   - Create new project in Vercel
   - Set root directory to `frontend`
   - Add environment variable: `REACT_APP_API_URL` (your backend URL)
   - Deploy

Your app will be live at: `https://your-project.vercel.app`

## License

ISC

## Author

Built with 💪 for fitness enthusiasts
