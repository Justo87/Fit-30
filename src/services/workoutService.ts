import { db, handleFirestoreError, OperationType } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DailyWorkout, UserProfile } from '@/types';
import { getDailyWorkout as generateWorkout } from './geminiService';
import { CHALLENGES_REPOSITORY } from '@/constants/challenges';

export async function getOrGenerateWorkout(profile: UserProfile): Promise<DailyWorkout> {
  const workoutId = `day_${profile.planDay}`;
  const workoutRef = doc(db, 'users', profile.uid, 'workouts', workoutId);

  // Get the fixed challenge for the day
  const challengeIndex = (profile.planDay - 1) % CHALLENGES_REPOSITORY.length;
  const dailyChallenge = CHALLENGES_REPOSITORY[challengeIndex];

  try {
    // 1. Try to get from cache
    const cacheSnap = await getDoc(workoutRef);
    if (cacheSnap.exists()) {
      const data = cacheSnap.data() as DailyWorkout;
      
      // Always ensure the challenge is the fixed one from repository
      const updatedWorkout = { ...data, dailyChallenge };
      
      // Check if it has the new fields (imageUrls)
      const hasImages = data.exercises.every(ex => !!ex.imageUrl);
      
      if (hasImages) {
        console.log(`Using cached workout for day ${profile.planDay}`);
        return updatedWorkout;
      }
      console.log(`Cached workout for day ${profile.planDay} is stale (missing images), regenerating...`);
    }

    // 2. If not in cache, generate with Gemini
    console.log(`Generating new workout for day ${profile.planDay}`);
    const generatedWorkout = await generateWorkout(profile);
    
    // Inject the fixed challenge
    const newWorkout = { ...generatedWorkout, dailyChallenge };

    // 3. Save to cache
    await setDoc(workoutRef, newWorkout);

    return newWorkout;
  } catch (error) {
    console.error("Error in workout service:", error);
    // Fallback to generation if cache fails
    const fallbackWorkout = await generateWorkout(profile);
    return { ...fallbackWorkout, dailyChallenge };
  }
}
