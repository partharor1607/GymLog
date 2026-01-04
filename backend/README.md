# Fitness Workout Tracker - Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitness-tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

3. Make sure MongoDB is running on your system.

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Exercises
- `GET /api/exercises` - Get all exercises (predefined + user's custom)
- `POST /api/exercises` - Create a custom exercise (protected)
- `PUT /api/exercises/:id` - Update a custom exercise (protected)
- `DELETE /api/exercises/:id` - Delete a custom exercise (protected)

### Workouts
- `GET /api/workouts` - Get all workouts (protected)
  - Query params: `status` (completed/pending), `startDate`, `endDate`
- `GET /api/workouts/:id` - Get a single workout (protected)
- `POST /api/workouts` - Create a new workout (protected)
- `PUT /api/workouts/:id` - Update a workout (protected)
- `PATCH /api/workouts/:id/exercises/:exerciseId` - Update exercise in workout (protected)
- `DELETE /api/workouts/:id` - Delete a workout (protected)

### Reports
- `GET /api/reports/workouts?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get workout completion report (protected)

