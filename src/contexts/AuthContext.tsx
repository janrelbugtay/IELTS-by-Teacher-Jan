import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Validate connection
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email === 'janrelbugtay03@gmail.com') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      
      if (currentUser) {
        // Track the user activity in Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          // Set with merge so we don't overwrite if it exists, but we update lastActive
          await setDoc(userRef, {
            name: currentUser.displayName || 'Student',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            lastActive: serverTimestamp(),
          }, { merge: true });
        } catch (e) {
          console.warn("Failed to update user activity (likely rules propagating):", e);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Update activity periodically while logged in
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          lastActive: serverTimestamp()
        }, { merge: true });
      } catch (e) { }
    }, 60000); // once a minute
    return () => clearInterval(interval);
  }, [user]);

  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // set createdAt explicitly on login
      if (result.user) {
        try {
          // Check if user exists first to only set createdAt on first login
          const docSnap = await getDocFromServer(doc(db, 'users', result.user.uid));
          if (!docSnap.exists()) {
             await setDoc(doc(db, 'users', result.user.uid), {
                name: result.user.displayName || 'Student',
                email: result.user.email || '',
                photoURL: result.user.photoURL || '',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp(),
                lastActive: serverTimestamp(),
             });
          } else {
             await setDoc(doc(db, 'users', result.user.uid), {
                lastLogin: serverTimestamp(),
                lastActive: serverTimestamp(),
             }, { merge: true });
          }
        } catch(e) {}
      }
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
