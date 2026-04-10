export interface ExerciseInfo {
  name: string;
  videoUrl: string;
  imageUrl: string;
  description: string;
}

// Curated list of exercises with high-quality illustrations (Flat design style)
export const EXERCISE_REPOSITORY: Record<string, ExerciseInfo> = {
  "Sentadillas": {
    name: "Sentadillas (Squats)",
    videoUrl: "https://www.youtube.com/embed/U5zrloYWKnw",
    imageUrl: "https://img.freepik.com/free-vector/man-doing-squats-exercise-white-background_1308-132474.jpg",
    description: "Enfoque en cuádriceps y glúteos. Mantén el torso erguido y baja controladamente."
  },
  "Flexiones": {
    name: "Flexiones (Push-ups)",
    videoUrl: "https://www.youtube.com/embed/Eh00_rniF8E",
    imageUrl: "https://img.freepik.com/free-vector/man-doing-push-ups-exercise-white-background_1308-132242.jpg",
    description: "Trabaja pecho y tríceps. Mantén el core activado para proteger la zona lumbar."
  },
  "Zancadas": {
    name: "Zancadas (Lunges)",
    videoUrl: "https://www.youtube.com/embed/L8fvypPrzzs",
    imageUrl: "https://img.freepik.com/free-vector/man-doing-lunges-exercise-white-background_1308-132473.jpg",
    description: "Excelente para glúteos e isquiotibiales. Evita que la rodilla delantera sobrepase la punta del pie."
  },
  "Plancha": {
    name: "Plancha Abdominal (Plank)",
    videoUrl: "https://www.youtube.com/embed/TvxNkmjdhMM",
    imageUrl: "https://img.freepik.com/free-vector/man-doing-plank-exercise-white-background_1308-132243.jpg",
    description: "Isométrico para todo el core. Mantén una línea recta desde los hombros hasta los talones."
  },
  "Press de Hombros": {
    name: "Press de Hombros con Mancuernas",
    videoUrl: "https://www.youtube.com/embed/B-aVuyhvLHU",
    imageUrl: "https://img.freepik.com/free-vector/man-doing-shoulder-press-exercise-white-background_1308-132475.jpg",
    description: "Enfoque en deltoides. Empuja verticalmente sin arquear la espalda."
  },
  "Curl de Bíceps": {
    name: "Curl de Bíceps con Mancuernas",
    videoUrl: "https://www.youtube.com/embed/sAq_ocpRh_I",
    imageUrl: "https://img.freepik.com/free-vector/man-doing-biceps-curl-exercise-white-background_1308-132472.jpg",
    description: "Aislamiento de bíceps. Evita balancear el cuerpo para subir el peso."
  },
  "Remo con Mancuerna": {
    name: "Remo con Mancuerna",
    videoUrl: "https://www.youtube.com/embed/6u9S7-2X_5Y",
    imageUrl: "https://img.freepik.com/free-vector/man-doing-dumbbell-row-exercise-white-background_1308-132476.jpg",
    description: "Trabaja el dorsal ancho. Lleva el codo hacia atrás rozando el costado."
  },
  "Peso Muerto Rumano": {
    name: "Peso Muerto Rumano con Mancuernas",
    videoUrl: "https://www.youtube.com/embed/J74X_D_p67A",
    imageUrl: "https://img.freepik.com/free-vector/man-doing-deadlift-exercise-white-background_1308-132477.jpg",
    description: "Enfoque en cadena posterior. Baja las pesas pegadas a las piernas sintiendo el estiramiento."
  },
  "Elevaciones Laterales": {
    name: "Elevaciones Laterales",
    videoUrl: "https://www.youtube.com/embed/WJm9JqD_3_I",
    imageUrl: "https://img.freepik.com/free-vector/man-doing-lateral-raise-exercise-white-background_1308-132478.jpg",
    description: "Aislamiento del deltoides lateral. Sube los brazos hasta la altura de los hombros."
  },
  "Elevaciones Frontales": {
    name: "Elevaciones Frontales con Mancuernas",
    videoUrl: "https://www.youtube.com/embed/hS0S9_9p6_w",
    imageUrl: "https://img.freepik.com/free-vector/man-doing-front-raise-exercise-white-background_1308-132479.jpg",
    description: "Enfoque en deltoides anterior. Sube las pesas frente a ti de forma controlada."
  }
};

export const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800";
