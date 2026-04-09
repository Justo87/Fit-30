import React, { useState, useEffect } from 'react';
import { UserProfile, WeightLog } from '@/types';
import { db, handleFirestoreError, OperationType } from '@/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Scale, TrendingDown, TrendingUp, History, Trash2, Edit2, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProgressView({ profile }: { profile: UserProfile }) {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const path = `users/${profile.uid}/weightLogs`;
    const q = query(collection(db, path), orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeightLog));
      
      // If no logs exist, automatically create the first one from profile data
      if (data.length === 0 && profile.currentWeight) {
        console.log("No weight logs found, creating initial log from profile.");
        addDoc(collection(db, path), {
          uid: profile.uid,
          date: profile.startDate || new Date().toISOString(),
          weight: profile.currentWeight
        }).catch(err => console.error("Error creating auto-initial log:", err));
      }
      
      setLogs(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return () => unsubscribe();
  }, [profile.uid, profile.currentWeight, profile.startDate]);

  const handleAddWeight = async () => {
    if (!newWeight) return;
    const weight = parseFloat(newWeight);
    const path = `users/${profile.uid}/weightLogs`;
    
    try {
      await addDoc(collection(db, path), {
        uid: profile.uid,
        date: new Date().toISOString(),
        weight: weight
      });

      await updateDoc(doc(db, 'users', profile.uid), {
        currentWeight: weight
      });

      setNewWeight('');
      setShowAdd(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const path = `users/${profile.uid}/weightLogs/${deleteId}`;
    try {
      await deleteDoc(doc(db, path));
      setDeleteId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleEdit = async (id: string) => {
    const weight = parseFloat(editWeight);
    if (isNaN(weight)) return;
    const path = `users/${profile.uid}/weightLogs/${id}`;
    try {
      await updateDoc(doc(db, path), { weight });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const chartData = logs.map(log => ({
    date: format(new Date(log.date), 'dd MMM', { locale: es }),
    weight: log.weight
  }));

  // If only one data point, add a dummy one or handle it
  const displayData = chartData.length === 1 
    ? [{ date: 'Inicio', weight: chartData[0].weight }, ...chartData]
    : chartData;

  const weightDiff = profile.currentWeight - profile.weightGoal;
  const isLosing = weightDiff > 0;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tighter">Tu Progreso</h2>
        <Button 
          size="sm" 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full"
        >
          <Plus className="w-4 h-4 mr-1" />
          Registrar Peso
        </Button>
      </div>

      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newWeight" className="text-neutral-400">Peso actual (kg)</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="newWeight"
                    type="number" 
                    placeholder="75.0" 
                    value={newWeight} 
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                  <Button onClick={handleAddWeight} className="bg-white text-neutral-900 font-bold">Guardar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <Scale className="w-4 h-4 text-neutral-500" />
              {isLosing ? <TrendingDown className="w-4 h-4 text-green-500" /> : <TrendingUp className="w-4 h-4 text-orange-500" />}
            </div>
            <p className="text-2xl font-bold text-white">{profile.currentWeight} <span className="text-sm font-normal text-neutral-500">kg</span></p>
            <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Peso Actual</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <History className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-2xl font-bold text-white">{Math.abs(weightDiff).toFixed(1)} <span className="text-sm font-normal text-neutral-500">kg</span></p>
            <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Para el Objetivo</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-neutral-900 border-neutral-800 p-0 overflow-hidden">
        <CardHeader className="p-4">
          <CardTitle className="text-xs uppercase tracking-widest font-mono text-neutral-500">Historial de Peso</CardTitle>
        </CardHeader>
        <CardContent className="p-0 h-64">
          {logs.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#a3a3a3" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#a3a3a3" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f97316' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorWeight)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-neutral-600 text-sm italic">
              Registra tu peso para ver la gráfica
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest font-mono text-neutral-400">Últimos Registros</h3>
        <div className="space-y-2">
          <AnimatePresence>
            {logs.slice().reverse().map((log) => (
              <motion.div 
                key={log.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex justify-between items-center p-4 bg-neutral-900 rounded-2xl border border-neutral-800"
              >
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-500">{format(new Date(log.date), 'dd MMMM yyyy', { locale: es })}</span>
                  {editingId === log.id ? (
                    <div className="flex items-center space-x-2 mt-1">
                      <Input 
                        type="number" 
                        value={editWeight} 
                        onChange={(e) => setEditWeight(e.target.value)}
                        className="w-20 h-8 bg-neutral-800 border-neutral-700 text-sm text-white"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={() => handleEdit(log.id!)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-neutral-500" onClick={() => setEditingId(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <span className="font-bold text-lg text-white">{log.weight} kg</span>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-neutral-500 hover:text-white"
                    onClick={() => {
                      setEditingId(log.id!);
                      setEditWeight(log.weight.toString());
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-neutral-500 hover:text-red-500"
                    onClick={() => setDeleteId(log.id!)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle>¿Eliminar registro?</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Esta acción no se puede deshacer. El registro de peso se borrará permanentemente de tu historial.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 pt-4">
            <Button variant="ghost" onClick={() => setDeleteId(null)} className="text-neutral-400">
              Cancelar
            </Button>
            <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white font-bold">
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
