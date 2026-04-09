import React, { useState, useEffect } from 'react';
import { UserProfile, DailyWorkout } from '@/types';
import { getMotivation } from '@/services/geminiService';
import { getOrGenerateWorkout } from '@/services/workoutService';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Play, CheckCircle2, Flame, Trophy, Clock, Mic, Dumbbell as DumbbellIcon, RotateCcw } from 'lucide-react';
import VoiceCoach from '@/components/VoiceCoach';

export default function Dashboard({ profile, onStartWorkout }: { profile: UserProfile, onStartWorkout: () => void }) {
  const [workout, setWorkout] = useState<DailyWorkout | null>(null);
  const [motivation, setMotivation] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCoach, setShowCoach] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

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

        // 2. Use the new service that caches workouts in Firestore
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

  const progress = Math.round(((profile.planDay || 1) / 30) * 100);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-bold tracking-tighter">Hola, {profile.name.split(' ')[0]} 👋</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowCoach(!showCoach)}
            className={`rounded-full ${showCoach ? 'text-orange-500 bg-orange-500/10' : 'text-neutral-500'}`}
          >
            <Mic className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-neutral-400 italic text-sm">"{motivation}"</p>
      </section>

      <AnimatePresence>
        {showCoach && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <VoiceCoach />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4 flex flex-col items-center justify-center space-y-3">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-neutral-800"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={226}
                  initial={{ strokeDashoffset: 226 }}
                  animate={{ strokeDashoffset: 226 - (226 * (profile.planDay / 30)) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="text-orange-500"
                />
              </svg>
              <span className="absolute text-2xl font-bold text-white">{profile.planDay}</span>
            </div>
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Días Racha</span>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4 flex flex-col items-center justify-center space-y-3">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-neutral-800"
                />
                <motion.circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={226}
                  initial={{ strokeDashoffset: 226 }}
                  animate={{ strokeDashoffset: 226 - (226 * (progress / 100)) }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="text-yellow-500"
                />
              </svg>
              <span className="absolute text-2xl font-bold text-white">{progress}%</span>
            </div>
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Completado</span>
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
            <h3 className="text-2xl font-bold text-white">{workout?.title || "Cargando..."}</h3>
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
          
          <div className="space-y-2">
            {workout?.exercises.slice(0, 3).map((ex, i) => (
              <div key={i} className="flex items-center space-x-2 text-sm text-neutral-300">
                <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-green-500' : 'text-neutral-700'}`} />
                <span>{ex.name}</span>
              </div>
            ))}
            {workout && workout.exercises.length > 3 && (
              <p className="text-xs text-neutral-500">...y {workout.exercises.length - 3} más</p>
            )}
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

      <section className="space-y-3">
        <div className="flex justify-between items-end">
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">Progreso del Plan</h3>
          <span className="text-xs font-mono text-orange-500">{profile.planDay}/30</span>
        </div>
        <Progress value={progress} className="h-2 bg-neutral-800" />
      </section>
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
