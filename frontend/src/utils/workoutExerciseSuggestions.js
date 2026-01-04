// Mapping of workout names to suggested exercises
export const workoutExerciseSuggestions = {
  'Morning Cardio': ['Running', 'Cycling', 'Jumping Jacks', 'Burpees', 'Mountain Climbers'],
  'Full Body Strength': ['Squats', 'Push-ups', 'Deadlifts', 'Pull-ups', 'Plank', 'Shoulder Press'],
  'Upper Body Day': ['Push-ups', 'Pull-ups', 'Bench Press', 'Shoulder Press', 'Bicep Curls', 'Tricep Dips'],
  'Lower Body Day': ['Squats', 'Deadlifts', 'Lunges', 'Leg Press', 'Plank'],
  'Chest & Triceps': ['Push-ups', 'Bench Press', 'Chest Dips', 'Tricep Dips', 'Tricep Extensions'],
  'Back & Biceps': ['Pull-ups', 'Deadlifts', 'Rows', 'Bicep Curls', 'Hammer Curls'],
  'Leg Day': ['Squats', 'Deadlifts', 'Lunges', 'Leg Press', 'Leg Curls', 'Calf Raises'],
  'Shoulder & Arms': ['Shoulder Press', 'Lateral Raises', 'Bicep Curls', 'Tricep Dips', 'Front Raises'],
  'Core Focus': ['Plank', 'Crunches', 'Mountain Climbers', 'Leg Raises', 'Russian Twists', 'Bicycle Crunches'],
  'HIIT Workout': ['Burpees', 'Mountain Climbers', 'Jumping Jacks', 'High Knees', 'Squat Jumps'],
  'Yoga Session': ['Plank', 'Downward Dog', 'Warrior Pose', 'Tree Pose'],
  'Running Session': ['Running', 'Warm-up Jog', 'Sprints', 'Cool-down Walk'],
  'Cycling Workout': ['Cycling', 'Warm-up Ride', 'Interval Training'],
  'Swimming': ['Swimming', 'Freestyle', 'Breaststroke', 'Backstroke'],
  'Push Day': ['Push-ups', 'Bench Press', 'Shoulder Press', 'Tricep Dips', 'Chest Flyes'],
  'Pull Day': ['Pull-ups', 'Rows', 'Deadlifts', 'Bicep Curls', 'Lat Pulldowns'],
  'Rest Day': ['Light Walking', 'Stretching', 'Yoga'],
  'Active Recovery': ['Light Walking', 'Cycling', 'Yoga', 'Stretching'],
  'Full Body Circuit': ['Squats', 'Push-ups', 'Burpees', 'Mountain Climbers', 'Plank', 'Jumping Jacks'],
  'Upper Body Push': ['Push-ups', 'Bench Press', 'Shoulder Press', 'Tricep Dips'],
  'Upper Body Pull': ['Pull-ups', 'Rows', 'Bicep Curls', 'Deadlifts'],
  'Legs & Glutes': ['Squats', 'Lunges', 'Deadlifts', 'Hip Thrusts', 'Leg Press'],
  'Cardio Blast': ['Running', 'Burpees', 'Jumping Jacks', 'Mountain Climbers', 'High Knees'],
  'Strength Training': ['Squats', 'Deadlifts', 'Bench Press', 'Shoulder Press', 'Rows'],
  'Endurance Training': ['Running', 'Cycling', 'Swimming', 'Rowing'],
  'Power Training': ['Squat Jumps', 'Box Jumps', 'Deadlifts', 'Clean and Press'],
  'Flexibility & Mobility': ['Stretching', 'Yoga', 'Pilates', 'Dynamic Warm-up'],
  'CrossFit WOD': ['Burpees', 'Squats', 'Pull-ups', 'Deadlifts', 'Box Jumps'],
  'Bodyweight Workout': ['Push-ups', 'Squats', 'Pull-ups', 'Plank', 'Lunges', 'Burpees'],
  'Weight Training': ['Squats', 'Deadlifts', 'Bench Press', 'Shoulder Press', 'Rows', 'Bicep Curls'],
};

// Get suggestions for a workout name
export const getExerciseSuggestions = (workoutName) => {
  if (!workoutName) return [];
  
  // Try exact match first
  if (workoutExerciseSuggestions[workoutName]) {
    return workoutExerciseSuggestions[workoutName];
  }
  
  // Try case-insensitive match
  const workoutKey = Object.keys(workoutExerciseSuggestions).find(
    key => key.toLowerCase() === workoutName.toLowerCase()
  );
  
  if (workoutKey) {
    return workoutExerciseSuggestions[workoutKey];
  }
  
  // Try partial match
  const partialMatch = Object.keys(workoutExerciseSuggestions).find(
    key => workoutName.toLowerCase().includes(key.toLowerCase()) || 
           key.toLowerCase().includes(workoutName.toLowerCase())
  );
  
  if (partialMatch) {
    return workoutExerciseSuggestions[partialMatch];
  }
  
  return [];
};

