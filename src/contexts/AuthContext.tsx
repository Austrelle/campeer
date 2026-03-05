// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  deleteUser
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  register: (email: string, password: string, data: Omit<UserProfile, 'uid' | 'email' | 'isApproved' | 'role' | 'createdAt'>) => Promise<void>;
  login: (email: string, password: string) => Promise<{ approved: boolean; role: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) setUserProfile(snap.data() as UserProfile);
    else setUserProfile(null);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) await fetchProfile(user.uid);
      else setUserProfile(null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const register = async (email: string, password: string, data: any) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const profile: UserProfile = {
      uid: user.uid,
      email,
      ...data,
      isApproved: false,
      role: 'student',
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', user.uid), profile);
    await signOut(auth);
  };

  const login = async (email: string, password: string) => {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) { await signOut(auth); throw new Error('User data not found.'); }
    const profile = snap.data() as UserProfile;
    if (!profile.isApproved) {
      await signOut(auth);
      return { approved: false, role: profile.role };
    }
    setUserProfile(profile);
    return { approved: true, role: profile.role };
  };

  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (currentUser) await fetchProfile(currentUser.uid);
  };

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, register, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};