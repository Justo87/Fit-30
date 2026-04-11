// FIT30 - 30 Days Transformation App
import React, { useState, useEffect } from 'react';
import { auth, signIn, signOut, db, isFirebaseConfigured } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { UserProfile } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, Scale, Calendar, User as UserIcon, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '@/components/Logo';
import Dashboard from '@/components/Dashboard';
import WorkoutView from '@/components/WorkoutView';
import ProgressView from '@/components/ProgressView';
import ProfileView from '@/components/ProfileView';
import Onboarding from '@/components/Onboarding';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoadingTimeout(true);
      }
    }, 8000); // Show retry button after 8 seconds
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
      }
    }, (error) => {
      console.error("Auth State Error:", error);
      setFirebaseError(error.message);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      console.log("Fetching profile for user:", user.uid);
      let isMounted = true;

      // Use a combination of getDoc (fast initial) and onSnapshot (real-time)
      const fetchProfile = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          if (isMounted) {
            if (docSnap.exists()) {
              setProfile(docSnap.data() as UserProfile);
            } else {
              setProfile(null);
            }
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          // Don't set loading false here, let onSnapshot try or timeout handle it
        }
      };

      fetchProfile();

      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
        if (!isMounted) return;
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Profile Snapshot Error:", error);
        if (isMounted) setLoading(false);
      });

      return () => {
        isMounted = false;
        unsubscribe();
      };
    }
  }, [user]);

  const handleSignIn = async () => {
    setLoading(true);
    setFirebaseError(null);
    console.log("Starting sign in process...");
    try {
      const result = await signIn();
      console.log("Sign in successful for:", result.user.email);
      setUser(result.user);
      // The onAuthStateChanged listener will also fire, but setting it here 
      // speeds up the UI transition.
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.code === 'auth/popup-blocked') {
        setFirebaseError("El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para este sitio.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // User closed the popup, not a real error to show
        console.log("User cancelled login.");
      } else {
        setFirebaseError(`Error al iniciar sesión: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isFirebaseConfigured || firebaseError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-6 text-center text-white">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold tracking-tighter mb-2">
          {firebaseError ? "Error de Firebase" : "Configuración de Firebase Pendiente"}
        </h1>
        <p className="text-neutral-400 max-w-sm mx-auto mb-8">
          {firebaseError || "La base de datos de Firebase aún no se ha configurado correctamente. Por favor, espera un momento o verifica tus credenciales."}
        </p>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-white text-black font-bold py-6 px-8 rounded-2xl"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
          <p className="font-medium tracking-tight">Cargando tu progreso...</p>
          
          {loadingTimeout && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-4"
            >
              <p className="text-sm text-neutral-500 max-w-xs">
                Esto está tardando más de lo habitual. Podría ser un problema de conexión con la base de datos.
              </p>
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="border-neutral-800 text-white"
                >
                  Recargar aplicación
                </Button>
                <Button 
                  onClick={() => {
                    setLoading(false);
                    if (!profile) setProfile(null); // Force onboarding if we really can't load
                  }} 
                  variant="ghost"
                  className="text-neutral-600 text-xs"
                >
                  Omitir espera (podría reiniciar datos)
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="space-y-2">
            <Logo iconSize={40} textSize="text-5xl" className="justify-center mb-6" />
            <p className="text-neutral-400 text-lg">30 días. 30 minutos. 1 mancuerna.</p>
          </div>
          
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-white">Bienvenido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-400 text-sm">
                Inicia sesión para comenzar tu transformación personal de 30 días.
              </p>
              <Button 
                onClick={handleSignIn} 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 rounded-2xl transition-all active:scale-95"
              >
                Continuar con Google
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return <Onboarding user={user} onComplete={(p) => setProfile(p)} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-24">
      <header className="p-6 flex justify-between items-center border-b border-neutral-900 sticky top-0 bg-neutral-950/80 backdrop-blur-xl z-50">
        <div className="flex flex-col">
          <Logo iconSize={18} textSize="text-xl" />
          <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest mt-1 ml-1">Día {profile.planDay || 1} / 30</p>
        </div>
        <Button variant="ghost" size="icon" onClick={signOut} className="text-neutral-500 hover:text-white">
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <Dashboard profile={profile} onStartWorkout={() => setActiveTab('workout')} />}
            {activeTab === 'workout' && <WorkoutView profile={profile} />}
            {activeTab === 'progress' && <ProgressView profile={profile} />}
            {activeTab === 'profile' && <ProfileView profile={profile} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900/90 backdrop-blur-2xl border-t border-neutral-800 px-6 py-4 flex justify-between items-center z-50 max-w-lg mx-auto rounded-t-3xl shadow-2xl">
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Calendar className="w-6 h-6" />} label="Hoy" />
        <NavButton active={activeTab === 'workout'} onClick={() => setActiveTab('workout')} icon={<Dumbbell className="w-6 h-6" />} label="Entrenar" />
        <NavButton active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} icon={<Scale className="w-6 h-6" />} label="Progreso" />
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserIcon className="w-6 h-6" />} label="Perfil" />
      </nav>

      <PWAInstallPrompt />
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center space-y-1 transition-all ${active ? 'text-orange-500 scale-110' : 'text-neutral-500 hover:text-neutral-300'}`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
      {active && <motion.div layoutId="nav-indicator" className="w-1 h-1 bg-orange-500 rounded-full" />}
    </button>
  );
}
