export interface ExerciseInfo {
  name: string;
  videoUrl: string;
  description: string;
}

// Curated list of exercises with high-quality 3D anatomical animations (Fitness Volt / Muscle & Motion style)
export const EXERCISE_REPOSITORY: Record<string, ExerciseInfo> = {
  "Sentadillas": {
    name: "Sentadillas (Squats)",
    videoUrl: "https://www.youtube.com/embed/U5zrloYWKnw",
    description: "Enfoque en cuádriceps y glúteos. Mantén el torso erguido y baja controladamente."
  },
  "Flexiones": {
    name: "Flexiones (Push-ups)",
    videoUrl: "https://www.youtube.com/embed/Eh00_rniF8E",
    description: "Trabaja pecho y tríceps. Mantén el core activado para proteger la zona lumbar."
  },
  "Zancadas": {
    name: "Zancadas (Lunges)",
    videoUrl: "https://www.youtube.com/embed/L8fvypPrzzs",
    description: "Excelente para glúteos e isquiotibiales. Evita que la rodilla delantera sobrepase la punta del pie."
  },
  "Plancha": {
    name: "Plancha Abdominal (Plank)",
    videoUrl: "https://www.youtube.com/embed/TvxNkmjdhMM",
    description: "Isométrico para todo el core. Mantén una línea recta desde los hombros hasta los talones."
  },
  "Press de Hombros": {
    name: "Press de Hombros con Mancuernas",
    videoUrl: "https://www.youtube.com/embed/B-aVuyhvLHU",
    description: "Enfoque en deltoides. Empuja verticalmente sin arquear la espalda."
  },
  "Curl de Bíceps": {
    name: "Curl de Bíceps con Mancuernas",
    videoUrl: "https://www.youtube.com/embed/sAq_ocpRh_I",
    description: "Aislamiento de bíceps. Evita balancear el cuerpo para subir el peso."
  },
  "Remo con Mancuerna": {
    name: "Remo con Mancuerna",
    videoUrl: "https://www.youtube.com/embed/6u9S7-2X_5Y",
    description: "Trabaja el dorsal ancho. Lleva el codo hacia atrás rozando el costado."
  },
  "Peso Muerto Rumano": {
    name: "Peso Muerto Rumano con Mancuernas",
    videoUrl: "https://www.youtube.com/embed/J74X_D_p67A",
    description: "Enfoque en cadena posterior. Baja las pesas pegadas a las piernas sintiendo el estiramiento."
  },
  "Elevaciones Laterales": {
    name: "Elevaciones Laterales",
    videoUrl: "https://www.youtube.com/embed/WJm9JqD_3_I",
    description: "Aislamiento del deltoides lateral. Sube los brazos hasta la altura de los hombros."
  },
  "Elevaciones Frontales": {
    name: "Elevaciones Frontales con Mancuernas",
    videoUrl: "https://www.youtube.com/embed/hS0S9_9p6_w",
    description: "Enfoque en deltoides anterior. Sube las pesas frente a ti de forma controlada."
  }
};
