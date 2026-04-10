import React from 'react';
import { motion } from 'motion/react';
import { Flame, Trophy } from 'lucide-react';

interface PlanProgressProps {
  currentDay: number;
  totalDays?: number;
  className?: string;
}

export default function PlanProgress({ currentDay, totalDays = 30, className = "" }: PlanProgressProps) {
  const progress = Math.min(Math.round((currentDay / totalDays) * 100), 100);
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-end px-1">
        <div className="flex items-center space-x-1.5">
          <div className="w-6 h-6 bg-orange-500/20 rounded-lg flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-400">
            Día <span className="text-white">{currentDay}</span> de {totalDays}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-[10px] font-bold text-orange-500 font-mono">{progress}%</span>
          {progress === 100 && <Trophy className="w-3 h-3 text-yellow-500" />}
        </div>
      </div>
      
      <div className="relative h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/50">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-400 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.4)]"
        />
      </div>
    </div>
  );
}
