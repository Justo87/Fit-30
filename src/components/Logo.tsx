import React from 'react';
import { Dumbbell } from 'lucide-react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export default function Logo({ className = "", iconSize = 24, textSize = "text-2xl" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="bg-orange-500 p-1.5 rounded-lg shadow-lg shadow-orange-500/20">
        <Dumbbell size={iconSize} className="text-white" />
      </div>
      <span className={`font-bold tracking-tighter text-white ${textSize}`}>
        FIT<span className="text-orange-500">30</span>
      </span>
    </div>
  );
}
