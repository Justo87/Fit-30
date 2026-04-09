import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType, signOut } from '@/firebase';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'motion/react';
import { Scale, Dumbbell, Target, Loader2, LogOut } from 'lucide-react';

export default function Onboarding({ user, onComplete }: { user: User, onComplete: (p: UserProfile) => void }) {
  const [step, setStep] = useState(1);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('');
  const [dumbbell, setDumbbell] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState<'principiante' | 'intermedio' | 'avanzado'>('principiante');
  const [motivation, setMotivation] = useState<'perder_peso' | 'ganar_musculo' | 'salud_general' | 'otro'>('salud_general');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!weight || !height || !goal || !dumbbell) return;
    setLoading(true);
    const userPath = `users/${user.uid}`;
    const weightLogPath = `users/${user.uid}/weightLogs`;
    console.log("Completing onboarding for user:", user.uid);
    try {
      const profile: UserProfile = {
        uid: user.uid,
        name: user.displayName || 'Atleta',
        email: user.email || '',
        currentWeight: parseFloat(weight),
        height: parseFloat(height),
        weightGoal: parseFloat(goal),
        dumbbellWeight: parseFloat(dumbbell),
        fitnessLevel,
        motivation,
        startDate: new Date().toISOString(),
        planDay: 1
      };

      console.log("Saving profile to Firestore:", profile);
      await setDoc(doc(db, userPath), profile);
      
      console.log("Saving initial weight log");
      await addDoc(collection(db, weightLogPath), {
        uid: user.uid,
        date: new Date().toISOString(),
        weight: parseFloat(weight)
      });

      onComplete(profile);
    } catch (error) {
      console.error("Error in handleComplete:", error);
      handleFirestoreError(error, OperationType.WRITE, userPath);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <Card className="bg-neutral-900 border-neutral-800 text-white overflow-hidden">
          <div className="h-1 bg-neutral-800">
            <motion.div 
              className="h-full bg-orange-500" 
              initial={{ width: '0%' }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          
          <CardHeader className="pt-8 relative">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={signOut}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <CardTitle className="text-2xl font-bold tracking-tighter text-center">
              {step === 1 && "Datos Básicos"}
              {step === 2 && "Tus Objetivos"}
              {step === 3 && "¿Cuál es tu nivel?"}
              {step === 4 && "¿Qué te motiva?"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8 pb-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-neutral-400">Peso actual (kg)</Label>
                  <Input 
                    id="weight"
                    type="number" 
                    placeholder="75.5" 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 py-6 text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-neutral-400">Altura (cm)</Label>
                  <Input 
                    id="height"
                    type="number" 
                    placeholder="175" 
                    value={height} 
                    onChange={(e) => setHeight(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 py-6 text-center"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-neutral-400">Peso deseado (kg)</Label>
                  <Input 
                    id="goal"
                    type="number" 
                    placeholder="70.0" 
                    value={goal} 
                    onChange={(e) => setGoal(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 py-6 text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dumbbell" className="text-neutral-400">Peso de tu mancuerna (kg)</Label>
                  <Input 
                    id="dumbbell"
                    type="number" 
                    placeholder="5" 
                    value={dumbbell} 
                    onChange={(e) => setDumbbell(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 py-6 text-center"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 gap-3">
                {(['principiante', 'intermedio', 'avanzado'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={fitnessLevel === level ? 'default' : 'outline'}
                    onClick={() => setFitnessLevel(level)}
                    className={`py-8 rounded-xl capitalize font-bold ${fitnessLevel === level ? 'bg-orange-500 hover:bg-orange-600' : 'border-neutral-700 text-neutral-400'}`}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'perder_peso', label: 'Perder Peso' },
                  { id: 'ganar_musculo', label: 'Ganar Músculo' },
                  { id: 'salud_general', label: 'Salud General' },
                  { id: 'otro', label: 'Otro' }
                ].map((m) => (
                  <Button
                    key={m.id}
                    variant={motivation === m.id ? 'default' : 'outline'}
                    onClick={() => setMotivation(m.id as any)}
                    className={`py-8 rounded-xl font-bold ${motivation === m.id ? 'bg-orange-500 hover:bg-orange-600' : 'border-neutral-700 text-neutral-400'}`}
                  >
                    {m.label}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex space-x-3">
              {step > 1 && (
                <Button 
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                  className="flex-1 border-neutral-700 text-neutral-400 hover:bg-neutral-800"
                >
                  Atrás
                </Button>
              )}
              <Button 
                onClick={() => step < totalSteps ? setStep(step + 1) : handleComplete()}
                disabled={loading || (step === 1 ? (!weight || !height) : step === 2 ? (!goal || !dumbbell) : false)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-xl"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : step === totalSteps ? "¡Empezar!" : "Siguiente"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
