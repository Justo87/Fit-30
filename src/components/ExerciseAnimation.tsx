import React from 'react';
import { motion } from 'motion/react';

interface Props {
  type: string;
}

export default function ExerciseAnimation({ type }: Props) {
  // High-fidelity Organic Anatomical Model
  const isSquat = type.toLowerCase().includes('sentadilla') || type.toLowerCase().includes('squat');
  const isPushup = type.toLowerCase().includes('flexion') || type.toLowerCase().includes('push-up') || type.toLowerCase().includes('pushup');
  const isPlank = type.toLowerCase().includes('plancha') || type.toLowerCase().includes('plank');
  const isCurl = type.toLowerCase().includes('curl');
  const isPress = type.toLowerCase().includes('press');
  const isRow = type.toLowerCase().includes('remo') || type.toLowerCase().includes('row');

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-neutral-950 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />
      
      <div className="relative w-72 h-80 flex items-center justify-center">
        <svg viewBox="0 0 120 160" className="w-full h-full drop-shadow-[0_0_20px_rgba(249,115,22,0.15)]">
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5f5f5" />
              <stop offset="50%" stopColor="#d4d4d4" />
              <stop offset="100%" stopColor="#a3a3a3" />
            </linearGradient>
            <linearGradient id="activeMuscle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Anatomical Model Group */}
          <motion.g
            animate={isSquat ? { y: [0, 45, 0] } : isPushup ? { y: [0, 30, 0], rotate: [0, 3, 0] } : isPress ? { y: [0, -8, 0] } : {}}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Head & Neck - More organic shape */}
            <path d="M52 10 Q60 8 68 10 Q72 15 70 22 Q60 25 50 22 Q48 15 52 10" fill="url(#bodyGradient)" />
            <path d="M56 22 L64 22 L64 28 L56 28 Z" fill="url(#bodyGradient)" />
            
            {/* Torso - Anatomical Chest and Abs */}
            <motion.g
              animate={isSquat ? { scaleY: [1, 0.85, 1], y: [0, 4, 0] } : {}}
              style={{ originX: "60px", originY: "30px" }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Ribcage / Torso Shape */}
              <path d="M45 30 Q60 26 75 30 Q82 50 78 75 Q60 82 42 75 Q38 50 45 30" fill="url(#bodyGradient)" />
              
              {/* Pectorals */}
              {(isPushup || isPress) && (
                <path 
                  d="M48 35 Q60 32 72 35 Q74 45 60 48 Q46 45 48 35" 
                  fill="url(#activeMuscle)" 
                  filter="url(#glow)"
                  opacity="0.9" 
                />
              )}

              {/* Abs / Core */}
              {(isSquat || isPlank) && (
                <g opacity="0.7" filter="url(#glow)">
                  <path d="M52 52 Q60 51 68 52 L67 56 Q60 55 53 56 Z" fill="#ea580c" />
                  <path d="M52 58 Q60 57 68 58 L67 62 Q60 61 53 62 Z" fill="#ea580c" />
                  <path d="M52 64 Q60 63 68 64 L67 68 Q60 67 53 68 Z" fill="#ea580c" />
                </g>
              )}
            </motion.g>

            {/* Arms - Multi-segment organic paths */}
            {/* Left Arm */}
            <motion.g
              animate={isCurl ? { rotate: [0, -115, 0] } : isPress ? { y: [0, -40, 0], rotate: [0, -15, 0] } : isPushup ? { rotate: [0, -40, 0] } : isRow ? { x: [0, 12, 0], rotate: [0, -25, 0] } : {}}
              style={{ originX: "45px", originY: "32px" }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Upper Arm (Bicep/Tricep) */}
              <path d="M30 32 Q38 30 45 32 L42 45 Q35 48 28 45 Z" fill="url(#bodyGradient)" />
              {isCurl && <path d="M32 32 Q38 31 43 32 L41 40 Q35 42 30 40 Z" fill="url(#activeMuscle)" opacity="0.9" filter="url(#glow)" />}
              
              {/* Forearm */}
              <motion.g
                animate={isCurl ? { rotate: [0, -5, 0] } : {}}
                style={{ originX: "30px", originY: "42px" }}
              >
                <path d="M12 42 Q20 40 30 42 L28 50 Q20 52 10 50 Z" fill="url(#bodyGradient)" />
                <circle cx="10" cy="46" r="4.5" fill="#333" /> {/* Dumbbell/Hand */}
              </motion.g>
            </motion.g>

            {/* Right Arm */}
            <motion.g
              animate={isCurl ? { rotate: [0, 115, 0] } : isPress ? { y: [0, -40, 0], rotate: [0, 15, 0] } : isPushup ? { rotate: [0, 40, 0] } : isRow ? { x: [0, -12, 0], rotate: [0, 25, 0] } : {}}
              style={{ originX: "75px", originY: "32px" }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Upper Arm */}
              <path d="M75 32 Q82 30 90 32 L92 45 Q85 48 78 45 Z" fill="url(#bodyGradient)" />
              {isCurl && <path d="M77 32 Q82 31 88 32 L89 40 Q85 42 80 40 Z" fill="url(#activeMuscle)" opacity="0.9" filter="url(#glow)" />}
              
              {/* Forearm */}
              <motion.g
                animate={isCurl ? { rotate: [0, 5, 0] } : {}}
                style={{ originX: "90px", originY: "42px" }}
              >
                <path d="M90 42 Q100 40 108 42 L110 50 Q100 52 92 50 Z" fill="url(#bodyGradient)" />
                <circle cx="110" cy="46" r="4.5" fill="#333" />
              </motion.g>
            </motion.g>

            {/* Legs - Anatomical Thighs and Calves */}
            {/* Left Leg */}
            <motion.g
              animate={isSquat ? { rotate: [0, 65, 0] } : isPlank ? { rotate: 90, x: -45, y: 20 } : {}}
              style={{ originX: "48px", originY: "75px" }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Thigh (Quadricep) */}
              <path d="M42 75 Q50 72 58 75 L55 110 Q48 115 40 110 Z" fill="url(#bodyGradient)" />
              {isSquat && <path d="M44 75 Q50 74 56 75 L54 100 Q48 103 42 100 Z" fill="url(#activeMuscle)" opacity="0.8" filter="url(#glow)" />}
              
              {/* Lower Leg (Calf) */}
              <motion.g
                animate={isSquat ? { rotate: [0, -125, 0] } : {}}
                style={{ originX: "48px", originY: "110px" }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <path d="M42 110 Q48 108 54 110 L52 145 Q48 148 44 145 Z" fill="url(#bodyGradient)" />
              </motion.g>
            </motion.g>

            {/* Right Leg */}
            <motion.g
              animate={isSquat ? { rotate: [0, -65, 0] } : isPlank ? { rotate: 90, x: -45, y: 20 } : {}}
              style={{ originX: "72px", originY: "75px" }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Thigh */}
              <path d="M62 75 Q70 72 78 75 L80 110 Q72 115 65 110 Z" fill="url(#bodyGradient)" />
              {isSquat && <path d="M64 75 Q70 74 76 75 L78 100 Q72 103 66 100 Z" fill="url(#activeMuscle)" opacity="0.8" filter="url(#glow)" />}
              
              {/* Lower Leg */}
              <motion.g
                animate={isSquat ? { rotate: [0, 125, 0] } : {}}
                style={{ originX: "72px", originY: "110px" }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <path d="M66 110 Q72 108 78 110 L80 145 Q72 148 68 145 Z" fill="url(#bodyGradient)" />
              </motion.g>
            </motion.g>
          </motion.g>
        </svg>
      </div>

      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-[9px] text-orange-500/80 font-mono uppercase tracking-[0.4em] font-bold">
          {isSquat || isPushup || isPlank || isCurl || isPress || isRow ? "FREE ANATOMICAL ENGINE" : "VISUALIZATION UNAVAILABLE"}
        </p>
      </div>
    </div>
  );
}
