import { GoogleGenAI, Type } from "@google/genai";
import { DailyWorkout, UserProfile } from "../types";
import { EXERCISE_REPOSITORY } from "@/constants/exercises";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getDailyWorkout(profile: UserProfile): Promise<DailyWorkout> {
  const exerciseList = Object.keys(EXERCISE_REPOSITORY).join(", ");
  
  const prompt = `Genera un entrenamiento en casa de 30 minutos para el día ${profile.planDay} de un plan de fitness de 30 días. 
  DATOS DEL USUARIO:
  - Nombre: ${profile.name}
  - Peso actual: ${profile.currentWeight}kg
  - Altura: ${profile.height}cm
  - Objetivo: ${profile.weightGoal}kg (${profile.motivation.replace('_', ' ')})
  - Nivel de forma física: ${profile.fitnessLevel}
  - Equipo disponible: Una sola mancuerna de ${profile.dumbbellWeight}kg.
  
  El entrenamiento debe ser desafiante pero adaptado a su nivel (${profile.fitnessLevel}) y objetivo (${profile.motivation}).
  
  REGLAS CRÍTICAS PARA EJERCICIOS:
  - DEBES elegir ejercicios de esta lista exacta: ${exerciseList}.
  - El campo "name" del JSON DEBE ser EXACTAMENTE uno de los nombres de la lista anterior (ej: "Sentadillas", "Flexiones"). NO añadas texto extra al nombre.
  - Usa la "imageUrl" y "videoUrl" correspondientes de nuestra base de datos para esos nombres.
  
  RETO DIARIO:
  - NO incluyas el campo "dailyChallenge" en la respuesta, ya lo gestionamos nosotros.
  
  Toda la respuesta debe estar en ESPAÑOL.
  Retorna el entrenamiento en formato JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          title: { type: Type.STRING },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reps: { type: Type.STRING },
                sets: { type: Type.NUMBER },
                description: { type: Type.STRING },
                imageUrl: { type: Type.STRING },
                videoUrls: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Lista de URLs de YouTube embed con la técnica del ejercicio" 
                }
              },
              required: ["name", "reps", "sets", "description", "videoUrls", "imageUrl"]
            }
          }
        },
        required: ["day", "title", "exercises"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function getMotivation(userName: string, progress: number): Promise<string> {
  const prompt = `Dame un mensaje corto y motivador en ESPAÑOL para ${userName} que lleva un ${progress}% de su desafío fitness de 30 días. Máximo 50 palabras.`;
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });
  return response.text;
}
