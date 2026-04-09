import React, { useState, useEffect } from 'react';
import { UserProfile, DailyWorkout, Exercise } from '@/types';
import { getOrGenerateWorkout } from '@/services/workoutService';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ChevronRight, ChevronLeft, Play, Info, Trophy, Loader2, Mic, MonitorPlay } from 'lucide-react';
import VoiceCoach from '@/components/VoiceCoach';
import ExerciseAnimation from '@/components/ExerciseAnimation';

export default function WorkoutView({ profile }: { profile: UserProfile }) {
  const [workout, setWorkout] = useState<DailyWorkout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCoach, setShowCoach] = useState(false);
  // Store animation preference per exercise index
  const [exercisePreferences, setExercisePreferences] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadWorkout() {
      setLoading(true);
      try {
        const w = await getOrGenerateWorkout(profile);
        if (isMounted) setWorkout(w);
      } catch (error) {
        console.error("Error loading workout:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadWorkout();
    return () => { isMounted = false; };
  }, [profile.uid, profile.planDay, profile.dumbbellWeight, profile.fitnessLevel, profile.motivation]);

  const handleNext = () => {
    if (workout && currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentVideoIndex(0); // Reset video index for next exercise
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    if (loading) return;
    setLoading(true);
    console.log("Finishing workout for day:", profile.planDay);
    try {
      const logsRef = collection(db, 'users', profile.uid, 'workoutLogs');
      const logData = {
        uid: profile.uid,
        day: profile.planDay,
        date: new Date().toISOString(),
        completed: true,
        duration: 30
      };
      
      console.log("Saving workout log:", logData);
      await addDoc(logsRef, logData);
      console.log("Workout log saved successfully");
      
      setCompleted(true);
    } catch (error) {
      console.error("Error in handleFinish:", error);
      handleFirestoreError(error, OperationType.WRITE, `users/${profile.uid}/workoutLogs`);
    } finally {
      setLoading(false);
    }
  };

  const [resetting, setResetting] = useState(false);

  const handleNextDay = async () => {
    setResetting(true);
    try {
      const nextDay = (profile.planDay || 1) + 1;
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        planDay: nextDay > 30 ? 30 : nextDay
      });
      window.location.reload();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        <p className="text-neutral-500 font-medium">Preparando tu rutina...</p>
      </div>
    );
  }

  if (completed) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12 space-y-6"
      >
        <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/20">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter">¡Día {profile.planDay} Completado!</h2>
          <p className="text-neutral-400">¿Quieres repetir el entrenamiento o pasar al siguiente día?</p>
        </div>
        <div className="space-y-3">
          <Button className="w-full bg-white text-neutral-900 font-bold py-6 rounded-2xl" onClick={() => setCompleted(false)}>
            Repetir Entrenamiento
          </Button>
          <Button 
            className="w-full bg-orange-500 text-white font-bold py-6 rounded-2xl" 
            onClick={handleNextDay}
            disabled={resetting}
          >
            {resetting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pasar al Día Siguiente"}
          </Button>
        </div>
      </motion.div>
    );
  }

  const currentExercise = workout?.exercises[currentExerciseIndex];
  const videoUrls = currentExercise?.videoUrls || [];
  const showAnimation = exercisePreferences[currentExerciseIndex] || false;

  const toggleAnimation = () => {
    setExercisePreferences(prev => ({
      ...prev,
      [currentExerciseIndex]: !showAnimation
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tighter">Rutina de Hoy</h2>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleAnimation}
            className={`rounded-full ${showAnimation ? 'text-orange-500 bg-orange-500/10' : 'text-neutral-500'}`}
            title="Cambiar entre Video y Modelo 3D"
          >
            <MonitorPlay className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowCoach(!showCoach)}
            className={`rounded-full ${showCoach ? 'text-orange-500 bg-orange-500/10' : 'text-neutral-500'}`}
          >
            <Mic className="w-5 h-5" />
          </Button>
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest flex items-center">
            {currentExerciseIndex + 1} / {workout?.exercises.length}
          </span>
        </div>
      </div>

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

      <AnimatePresence mode="wait">
        <motion.div
          key={currentExerciseIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
            <div className="aspect-video bg-neutral-800 flex items-center justify-center relative group">
              {showAnimation ? (
                <div className="relative w-full h-full">
                  <ExerciseAnimation type={currentExercise?.name || ''} />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="bg-black/60 text-white text-[10px] h-7"
                      onClick={() => toggleAnimation()}
                    >
                      <Play className="w-3 h-3 mr-1" /> Ver Video
                    </Button>
                  </div>
                </div>
              ) : videoUrls.length > 0 ? (
                <>
                  <iframe 
                    src={videoUrls[currentVideoIndex]} 
                    className="w-full h-full"
                    allowFullScreen
                  />
                  {/* Overlay button to switch to animation if video fails */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="bg-black/60 text-white text-[10px] h-7"
                      onClick={() => toggleAnimation()}
                    >
                      <MonitorPlay className="w-3 h-3 mr-1" /> Ver Modelo 3D
                    </Button>
                  </div>
                  {videoUrls.length > 1 && (
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={currentVideoIndex === 0}
                        onClick={() => setCurrentVideoIndex(currentVideoIndex - 1)}
                        className="pointer-events-auto bg-black/50 hover:bg-black/80 text-white rounded-full disabled:opacity-0"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={currentVideoIndex === videoUrls.length - 1}
                        onClick={() => setCurrentVideoIndex(currentVideoIndex + 1)}
                        className="pointer-events-auto bg-black/50 hover:bg-black/80 text-white rounded-full disabled:opacity-0"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </Button>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                    {videoUrls.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`w-1.5 h-1.5 rounded-full ${idx === currentVideoIndex ? 'bg-orange-500' : 'bg-white/30'}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-2 text-neutral-600">
                  <Play className="w-12 h-12" />
                  <span className="text-xs font-bold uppercase tracking-widest">Video no disponible</span>
                </div>
              )}
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold text-white">{currentExercise?.name}</CardTitle>
                  <p className="text-orange-500 font-bold text-lg">{currentExercise?.sets} series x {currentExercise?.reps}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-neutral-500">
                  <Info className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {currentExercise?.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex space-x-3">
        <Button 
          variant="outline" 
          disabled={currentExerciseIndex === 0}
          onClick={() => setCurrentExerciseIndex(currentExerciseIndex - 1)}
          className="flex-1 border-neutral-800 text-neutral-400 hover:bg-neutral-900 py-8 rounded-2xl"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Anterior
        </Button>
        <Button 
          onClick={handleNext}
          disabled={loading}
          className="flex-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-8 rounded-2xl transition-all active:scale-95"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              {currentExerciseIndex === (workout?.exercises.length || 0) - 1 ? "Finalizar" : "Siguiente"}
              <ChevronRight className="w-5 h-5 ml-1" />
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <Button 
          variant="link" 
          size="sm" 
          className="text-neutral-600 text-[10px] uppercase tracking-widest"
          onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(currentExercise?.name || '')}+técnica+ejercicio`, '_blank')}
        >
          ¿Video no carga? Buscar en YouTube
        </Button>
      </div>
    </div>
  );
}
