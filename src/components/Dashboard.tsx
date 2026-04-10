import React, { useState, useEffect } from 'react';
import { UserProfile, DailyWorkout } from '@/types';
import { getMotivation } from '@/services/geminiService';
import { getOrGenerateWorkout } from '@/services/workoutService';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { EXERCISE_REPOSITORY, FALLBACK_IMAGE } from '@/constants/exercises';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Play, CheckCircle2, Flame, Trophy, Clock, Dumbbell as DumbbellIcon, RotateCcw, Apple, Droplets, Footprints, Activity, Zap, Star, Loader2 } from 'lucide-react';
import PlanProgress from '@/components/PlanProgress';

const ICON_MAP: Record<string, any> = {
  'Apple': Apple,
  'Droplets': Droplets,
  'Footprints': Footprints,
  'Stairs': Activity,
  'Zap': Zap,
  'Trophy': Trophy
};

export default function Dashboard({ profile, onStartWorkout }: { profile: UserProfile, onStartWorkout: () => void }) {
  const [workout, setWorkout] = useState<DailyWorkout | null>(null);
  const [motivation, setMotivation] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isChallengeCompleted, setIsChallengeCompleted] = useState(false);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        // 1. Check if today's workout is already completed
        const logsRef = collection(db, 'users', profile.uid, 'workoutLogs');
        const q = query(logsRef, where('day', '==', profile.planDay));
        const logsSnap = await getDocs(q);
        if (isMounted) setIsCompleted(!logsSnap.empty);

        // 2. Check if today's challenge is completed
        const challengeRef = collection(db, 'users', profile.uid, 'challengeLogs');
        const cq = query(challengeRef, where('day', '==', profile.planDay));
        const challengeSnap = await getDocs(cq);
        if (isMounted) setIsChallengeCompleted(!challengeSnap.empty);

        // 3. Count total stars (completed challenges)
        const allChallengesSnap = await getDocs(challengeRef);
        if (isMounted) setStars(allChallengesSnap.size);

        // 4. Use the new service that caches workouts in Firestore
        const w = await getOrGenerateWorkout(profile);
        if (!isMounted) return;
        setWorkout(w);

        // 3. Cache motivation in localStorage for the day
        const today = new Date().toDateString();
        const cacheKey = `motivation_${profile.uid}_${profile.planDay}_${today}`;
        const cachedMotivation = localStorage.getItem(cacheKey);

        if (cachedMotivation) {
          setMotivation(cachedMotivation);
        } else {
          const m = await getMotivation(profile.name, Math.round(((profile.planDay || 1) / 30) * 100));
          if (isMounted) {
            setMotivation(m);
            localStorage.setItem(cacheKey, m);
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [profile.uid, profile.planDay, profile.dumbbellWeight, profile.fitnessLevel, profile.motivation]);

  const handleToggleChallenge = async () => {
    if (!workout?.dailyChallenge) return;
    const path = `users/${profile.uid}/challengeLogs`;
    try {
      if (isChallengeCompleted) {
        // Unmark (for simplicity we just don't allow it or delete the doc)
        const q = query(collection(db, path), where('day', '==', profile.planDay));
        const snap = await getDocs(q);
        snap.forEach(async (d) => {
          await deleteDoc(doc(db, path, d.id));
        });
        setIsChallengeCompleted(false);
        setStars(prev => prev - 1);
      } else {
        await addDoc(collection(db, path), {
          uid: profile.uid,
          day: profile.planDay,
          date: new Date().toISOString(),
          completed: true,
          title: workout.dailyChallenge.title
        });
        setIsChallengeCompleted(true);
        setStars(prev => prev + 1);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const progress = Math.round(((profile.planDay || 1) / 30) * 100);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-bold tracking-tighter">Hola, {profile.name.split(' ')[0]} 👋</h2>
        </div>
        <div className="min-h-[1.5rem] flex items-center">
          {motivation ? (
            <p className="text-neutral-400 italic text-sm">"{motivation}"</p>
          ) : (
            <Loader2 className="w-4 h-4 animate-spin text-orange-500/50" />
          )}
        </div>
      </section>

      <PlanProgress currentDay={profile.planDay} />

      {workout?.dailyChallenge && (
        <Card className={`border-orange-500/20 overflow-hidden transition-all ${isChallengeCompleted ? 'bg-orange-500/20' : 'bg-orange-500/10'}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-all ${isChallengeCompleted ? 'bg-green-500 shadow-green-500/20' : 'bg-orange-500 shadow-orange-500/20'}`}>
                {isChallengeCompleted ? <CheckCircle2 className="w-6 h-6 text-white" /> : React.createElement(ICON_MAP[workout.dailyChallenge.icon] || Zap, { className: "w-6 h-6 text-white" })}
              </div>
              <div>
                <h4 className="text-orange-500 text-[10px] font-bold uppercase tracking-widest">Reto del Día</h4>
                <h3 className="text-white font-bold">{workout.dailyChallenge.title}</h3>
                <p className="text-neutral-400 text-xs">{workout.dailyChallenge.description}</p>
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={handleToggleChallenge}
              className={`rounded-xl font-bold ${isChallengeCompleted ? 'bg-neutral-800 text-neutral-400' : 'bg-white text-black'}`}
            >
              {isChallengeCompleted ? 'Completado' : 'Hecho'}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest leading-none mb-1">Objetivo</p>
              <p className="text-lg font-bold text-white leading-none">{profile.weightGoal} <span className="text-[10px] font-normal text-neutral-500">kg</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
            <div>
              <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest leading-none mb-1">Estrellas</p>
              <p className="text-lg font-bold text-white leading-none">{stars}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-neutral-900 border-neutral-800 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Dumbbell className="w-24 h-24 rotate-12" />
        </div>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-neutral-400 text-xs uppercase tracking-widest font-mono">Entrenamiento de Hoy</CardTitle>
            <h3 className="text-2xl font-bold text-white">
              {workout?.title || <Loader2 className="w-5 h-5 animate-spin text-orange-500/50" />}
            </h3>
          </div>
          {isCompleted && (
            <div className="bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Completado
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4 text-sm text-neutral-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>30 min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Flame className="w-4 h-4" />
              <span>{workout?.exercises.length || 0} ejercicios</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {workout?.exercises.map((ex, i) => {
              // Better matching: check if the repo key is inside the exercise name or vice versa
              const exerciseNameLower = ex.name.toLowerCase();
              const repoKey = Object.keys(EXERCISE_REPOSITORY).find(key => {
                const keyLower = key.toLowerCase();
                return exerciseNameLower.includes(keyLower) || keyLower.includes(exerciseNameLower);
              });
              
              const repoInfo = repoKey ? EXERCISE_REPOSITORY[repoKey] : null;
              const imageUrl = repoInfo?.imageUrl || ex.imageUrl || FALLBACK_IMAGE;
              
              return (
                <div key={i} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-xl border border-neutral-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-800 shrink-0">
                      <img src={imageUrl} alt={ex.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white leading-tight">{ex.name}</span>
                      <span className="text-[10px] text-neutral-500 uppercase font-bold">{ex.sets} x {ex.reps}</span>
                    </div>
                  </div>
                  <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'text-green-500' : 'text-neutral-700'}`} />
                </div>
              );
            })}
          </div>

          <Button 
            onClick={onStartWorkout}
            className={`w-full py-6 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center justify-center ${
              isCompleted 
                ? 'bg-neutral-800 text-white hover:bg-neutral-700' 
                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
            }`}
          >
            {isCompleted ? (
              <>
                <RotateCcw className="w-5 h-5 mr-2" /> Repetir Entrenamiento
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" /> Empezar Ahora
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Dumbbell(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="m18 22 4-4" />
      <path d="m2 6 4-4" />
      <path d="m3 10 7-7" />
      <path d="m14 21 7-7" />
    </svg>
  )
}
