
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState }  from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser // Renaming to avoid conflict with our Pilot User type
} from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig'; // Assuming your firebaseConfig exports 'auth'

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  isAdmin: boolean | null; // null if not yet determined, true/false once checked
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idTokenResult = await currentUser.getIdTokenResult();
          setIsAdmin(idTokenResult.claims.isAdmin === true);
        } catch (error) {
          console.error("Error getting ID token result:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // Auth state change will be handled by onAuthStateChanged
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.info('Google Sign-In popup was closed by the user. To sign in, please complete the process in the popup window.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.info('Google Sign-In popup request was cancelled. This can happen if multiple popups were opened or due to other reasons. Please try again.');
      } else {
        console.error("Error during Google sign-in:", error);
        // Handle other specific errors if needed
      }
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
       setUser(null);
       setIsAdmin(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOutUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
