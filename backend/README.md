# GymLog - Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/fitness-tracker
```

3. Seed the database with exercises:
```bash
npm run seed
```

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5001`

## API Endpoints

### Exercises
- `GET /api/exercises` - Get all exercises
- `POST /api/exercises` - Create a custom exercise
- `PUT /api/exercises/:id` - Update an exercise
- `DELETE /api/exercises/:id` - Delete an exercise

### Workouts
- `GET /api/workouts` - Get all workouts
  - Query params: `status` (completed/pending), `startDate`, `endDate`
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
- `GET /api/recommendations/workouts` - Get workout templates

