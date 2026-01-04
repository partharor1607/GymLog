# Quick Start Guide

## Prerequisites
1. **Node.js** installed (v14 or higher)
2. **MongoDB** running locally or MongoDB Atlas connection string

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Setup Environment Variables

Create a `.env` file in the `backend` directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitness-tracker
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=7d
```

## Step 3: (Optional) Seed Exercises

```bash
cd backend
npm run seed
```

## Step 4: Start the Application

### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

### Terminal 2 - Frontend Server
```bash
cd frontend
npm start
```
Frontend will run on: http://localhost:3000

## Troubleshooting

- **MongoDB not running**: Make sure MongoDB is installed and running
  - macOS: `brew services start mongodb-community`
  - Or use MongoDB Atlas and update MONGODB_URI in .env

- **Port already in use**: Change PORT in backend/.env file

- **Dependencies not installing**: Try:
  - `npm cache clean --force`
  - `npm install` again

