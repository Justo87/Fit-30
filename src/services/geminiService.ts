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
  
  REGLAS PARA VIDEOS:
  - IMPORTANTE: Prioriza usar estos ejercicios de nuestra base de datos si encajan en el plan: ${exerciseList}.
  - Si usas un ejercicio de la lista anterior, DEBES usar exactamente la URL de video asociada en el campo videoUrls (como primer elemento).
  - PRIORIZA buscar videos de estilo "3D anatomical fitness animation" o "Muscle and Motion style" que muestren los músculos involucrados.
  - El formato DEBE ser embed: https://www.youtube.com/embed/VIDEO_ID
  - EVITA videos con música, trailers o que no permitan reproducción en otros sitios.
  - PRIORIZA canales como "Fitness Volt", "Muscle and Motion", "Workout Program" que usan modelos 3D.
  
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
                videoUrls: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Lista de URLs de YouTube embed con la técnica del ejercicio" 
                }
              },
              required: ["name", "reps", "sets", "description", "videoUrls"]
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
