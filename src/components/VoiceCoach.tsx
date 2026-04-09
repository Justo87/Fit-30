import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function VoiceCoach() {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('Listo para entrenar');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const toggleCoach = async () => {
    if (isActive) {
      stopCoach();
    } else {
      startCoach();
    }
  };

  const startCoach = async () => {
    setIsConnecting(true);
    setStatus('Conectando con tu coach...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            setStatus('Coach FIT30 en línea');
          },
          onmessage: async (message) => {
            // Handle audio output if needed
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && !isMuted) {
              // Play audio logic would go here
            }
          },
          onclose: () => stopCoach(),
          onerror: (err) => {
            console.error("Live API Error:", err);
            setStatus('Error de conexión');
            stopCoach();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "Eres un coach de fitness motivador llamado FIT30. Estás ayudando al usuario en su entrenamiento de 30 días con una sola mancuerna. Sé breve, enérgico y da consejos técnicos sobre ejercicios de fuerza. Habla en español.",
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
        }
      });

      sessionRef.current = await sessionPromise;
      
      // Setup audio capture
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
    } catch (error) {
      console.error("Error starting voice coach:", error);
      setStatus('Error de conexión');
      setIsConnecting(false);
    }
  };

  const stopCoach = () => {
    setIsActive(false);
    setStatus('Listo para entrenar');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    sessionRef.current = null;
  };

  return (
    <Card className="bg-neutral-900 border-orange-500/30 overflow-hidden shadow-2xl shadow-orange-500/5">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-orange-500 flex items-center">
            <Sparkles className="w-4 h-4 mr-2" /> Coach de Voz IA
          </CardTitle>
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-neutral-700'}`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-400 font-medium">{status}</p>
          {isActive && (
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMuted(!isMuted)}
                className="text-neutral-500 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>
          )}
        </div>

        <Button 
          onClick={toggleCoach}
          disabled={isConnecting}
          className={`w-full py-8 rounded-2xl font-bold text-lg transition-all active:scale-95 ${
            isActive 
              ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' 
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isConnecting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : isActive ? (
            <>
              <MicOff className="w-6 h-6 mr-2" /> Detener Coach
            </>
          ) : (
            <>
              <Mic className="w-6 h-6 mr-2" /> Hablar con Coach
            </>
          )}
        </Button>
        
        <AnimatePresence>
          {isActive && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center space-x-1 h-8 items-center"
            >
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    height: [8, 24, 12, 28, 10],
                    transition: { repeat: Infinity, duration: 0.5, delay: i * 0.1 }
                  }}
                  className="w-1 bg-orange-500 rounded-full"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
