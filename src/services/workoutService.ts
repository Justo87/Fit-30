import { db, handleFirestoreError, OperationType } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DailyWorkout, UserProfile } from '@/types';
import { getDailyWorkout as generateWorkout } from './geminiService';

export async function getOrGenerateWorkout(profile: UserProfile): Promise<DailyWorkout> {
  const workoutId = `day_${profile.planDay}`;
  const workoutRef = doc(db, 'users', profile.uid, 'workouts', workoutId);

  try {
    // 1. Try to get from cache
    const cacheSnap = await getDoc(workoutRef);
    if (cacheSnap.exists()) {
      console.log(`Using cached workout for day ${profile.planDay}`);
      return cacheSnap.data() as DailyWorkout;
    }

    // 2. If not in cache, generate with Gemini
    console.log(`Generating new workout for day ${profile.planDay}`);
    const newWorkout = await generateWorkout(profile);

    // 3. Save to cache
    await setDoc(workoutRef, newWorkout);

    return newWorkout;
  } catch (error) {
    console.error("Error in workout service:", error);
    // Fallback to generation if cache fails, or re-throw
    return generateWorkout(profile);
  }
}
