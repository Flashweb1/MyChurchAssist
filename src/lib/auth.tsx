"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
  signInWithPopup,
  createUserWithEmailAndPassword,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  churchId: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  churchId: null,
  loading: true,
  login: async () => {},
  signup: async () => new Promise<UserCredential>(() => {}),
  loginWithGoogle: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [churchId, setChurchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        setUserProfile(profile);
        setChurchId(profile.churchId || uid);
      }
    } catch {
      // Profile not created yet (first signup)
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        setUserProfile(null);
        setChurchId(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, churchId, loading, login, signup, loginWithGoogle, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
