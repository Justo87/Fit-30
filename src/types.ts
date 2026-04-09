export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  currentWeight: number;
  height: number;
  weightGoal: number;
  dumbbellWeight: number;
  fitnessLevel: 'principiante' | 'intermedio' | 'avanzado';
  motivation: 'perder_peso' | 'ganar_musculo' | 'salud_general' | 'otro';
  startDate: string;
  planDay: number;
}

export interface WeightLog {
  id?: string;
  date: string;
  weight: number;
}

export interface WorkoutLog {
  id?: string;
  day: number;
  date: string;
  completed: boolean;
  duration: number;
}

export interface Exercise {
  name: string;
  reps: string;
  sets: number;
  videoUrls: string[];
  description: string;
}

export interface DailyWorkout {
  day: number;
  title: string;
  exercises: Exercise[];
}
