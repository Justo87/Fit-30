import React, { useState } from 'react';
import { UserProfile } from '@/types';
import { db, signOut, handleFirestoreError, OperationType } from '@/firebase';
import { doc, updateDoc, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'motion/react';
import { User, Settings, Bell, Shield, LogOut, Save, Dumbbell, Scale, Target } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ProfileView({ profile }: { profile: UserProfile }) {
  const [name, setName] = useState(profile.name);
  const [currentWeight, setCurrentWeight] = useState(profile.currentWeight.toString());
  const [height, setHeight] = useState(profile.height.toString());
  const [goal, setGoal] = useState(profile.weightGoal.toString());
  const [dumbbell, setDumbbell] = useState(profile.dumbbellWeight.toString());
  const [fitnessLevel, setFitnessLevel] = useState(profile.fitnessLevel);
  const [motivation, setMotivation] = useState(profile.motivation);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const path = `users/${profile.uid}`;
    const weightValue = parseFloat(currentWeight);
    try {
      // Update profile
      await updateDoc(doc(db, path), {
        name,
        currentWeight: weightValue,
        height: parseFloat(height),
        weightGoal: parseFloat(goal),
        dumbbellWeight: parseFloat(dumbbell),
        fitnessLevel,
        motivation
      });

      // Also update the earliest weight log (the starting weight)
      const logsRef = collection(db, path, 'weightLogs');
      const q = query(logsRef, orderBy('date', 'asc'), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const firstLogDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, path, 'weightLogs', firstLogDoc.id), {
          weight: weightValue
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    const path = `users/${profile.uid}`;
    try {
      await updateDoc(doc(db, path), {
        planDay: 1,
        startDate: new Date().toISOString()
      });
      // No reload needed, onSnapshot in App.tsx will update the profile
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } finally {
      setResetting(false);
      setOpenResetDialog(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <h2 className="text-2xl font-bold tracking-tighter">Perfil</h2>

      <div className="flex flex-col items-center space-y-4 py-6">
        <div className="w-24 h-24 bg-neutral-900 border-2 border-orange-500 rounded-full flex items-center justify-center overflow-hidden">
          <User className="w-12 h-12 text-neutral-500" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold">{profile.name}</h3>
          <p className="text-neutral-500 text-sm">{profile.email}</p>
        </div>
      </div>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-xs uppercase tracking-widest font-mono text-neutral-400">Configuración del Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-neutral-300 flex items-center">
              <User className="w-4 h-4 mr-2" /> Nombre
            </Label>
            <Input 
              id="name"
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentWeight" className="text-neutral-300 flex items-center">
                <Scale className="w-4 h-4 mr-2" /> Peso Partida (kg)
              </Label>
              <Input 
                id="currentWeight"
                type="number"
                value={currentWeight} 
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal" className="text-neutral-300 flex items-center">
                <Target className="w-4 h-4 mr-2" /> Objetivo (kg)
              </Label>
              <Input 
                id="goal"
                type="number"
                value={goal} 
                onChange={(e) => setGoal(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height" className="text-neutral-300 flex items-center">
                <Settings className="w-4 h-4 mr-2" /> Altura (cm)
              </Label>
              <Input 
                id="height"
                type="number"
                value={height} 
                onChange={(e) => setHeight(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dumbbell" className="text-neutral-300 flex items-center">
                <Dumbbell className="w-4 h-4 mr-2" /> Mancuerna (kg)
              </Label>
              <Input 
                id="dumbbell"
                type="number"
                value={dumbbell} 
                onChange={(e) => setDumbbell(e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-neutral-400">Nivel de Forma Física</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['principiante', 'intermedio', 'avanzado'] as const).map((level) => (
                <Button
                  key={level}
                  variant={fitnessLevel === level ? 'default' : 'outline'}
                  onClick={() => setFitnessLevel(level)}
                  className={`text-[10px] h-8 capitalize ${fitnessLevel === level ? 'bg-orange-500' : 'border-neutral-700 text-neutral-500'}`}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-neutral-400">Motivación</Label>
            <div className="grid grid-cols-2 gap-2">
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
                  className={`text-[10px] h-8 ${motivation === m.id ? 'bg-orange-500' : 'border-neutral-700 text-neutral-500'}`}
                >
                  {m.label}
                </Button>
              ))}
            </div>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
            <Save className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Dialog open={openResetDialog} onOpenChange={setOpenResetDialog}>
          <DialogTrigger
            render={
              <Button 
                variant="ghost" 
                disabled={resetting}
                className="w-full justify-start text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 py-6 rounded-2xl"
              />
            }
          >
            <Settings className="w-5 h-5 mr-3" /> {resetting ? "Reiniciando..." : "Reiniciar Progreso (Día 1)"}
          </DialogTrigger>
          <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
            <DialogHeader>
              <DialogTitle>¿Reiniciar progreso?</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Esta acción volverá tu plan al Día 1. No se borrarán tus registros de peso, pero el contador de días se reiniciará.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 pt-4">
              <Button variant="ghost" onClick={() => setOpenResetDialog(false)} className="text-neutral-400">
                Cancelar
              </Button>
              <Button onClick={handleReset} disabled={resetting} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
                {resetting ? "Reiniciando..." : "Sí, reiniciar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="ghost" className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-900 py-6 rounded-2xl">
          <Bell className="w-5 h-5 mr-3" /> Notificaciones
        </Button>
        <Button variant="ghost" className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-900 py-6 rounded-2xl">
          <Shield className="w-5 h-5 mr-3" /> Privacidad
        </Button>
        <Button 
          variant="ghost" 
          onClick={signOut}
          className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 py-6 rounded-2xl"
        >
          <LogOut className="w-5 h-5 mr-3" /> Cerrar Sesión
        </Button>
      </div>

      <div className="text-center pt-8">
        <p className="text-[10px] text-neutral-700 uppercase font-bold tracking-[0.2em]">FIT30 v1.0.0</p>
      </div>
    </div>
  );
}
