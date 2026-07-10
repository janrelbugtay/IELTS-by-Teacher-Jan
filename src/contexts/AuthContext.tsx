import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, getRedirectResult } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  userCourse: string | null;
  user: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  userCourse: null,
  user: null,
  loading: true,
  isAdmin: false,
  signIn: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userCourse, setUserCourse] = useState<string | null>(null);

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

    // Handle redirect result
    getRedirectResult(auth).then(async (result) => {
      if (result?.user) {
        try {
          // Admins can log in freely
          if (result.user.email === 'janrelbugtay03@gmail.com' || result.user.email === 'khaisangschool.edu.vn@gmail.com') {
            await setDoc(doc(db, 'users', result.user.uid), {
              name: result.user.displayName || 'Admin',
              email: result.user.email,
              lastLogin: serverTimestamp(),
              lastActive: serverTimestamp(),
            }, { merge: true });
            return;
          }

          const docSnap = await getDocFromServer(doc(db, 'users', result.user.uid));
          if (!docSnap.exists()) {
            // Not linked/created!
            await firebaseSignOut(auth);
            // Optionally delete the user if possible, but signOut is enough to stop them
            alert("Your Google account is not linked to any student account. Please contact your teacher.");
          } else {
            await setDoc(doc(db, 'users', result.user.uid), {
              lastLogin: serverTimestamp(),
              lastActive: serverTimestamp(),
            }, { merge: true });
          }
        } catch (e) {
          console.error('Error handling redirect user data:', e);
        }
      }
    }).catch((error) => {
      console.error('Error with redirect sign-in:', error);
    });

    const checkUser = async (currentUser: FirebaseUser | null) => {
      let activeUser = currentUser as any;
      const studentUid = localStorage.getItem('studentUid');
      
      if (studentUid) {
        // We have a student logged in via custom auth
        try {
          const userDoc = await getDocFromServer(doc(db, 'users', studentUid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            activeUser = {
              uid: studentUid,
              email: data.email || data.authEmail || null,
              displayName: data.name || null,
              photoURL: null,
              isAnonymous: true,
              getIdToken: async () => '',
              providerData: [],
              customAuth: true
            };
          } else {
            localStorage.removeItem('studentUid');
          }
        } catch (e) {
          console.error("Error fetching custom student user", e);
        }
      } else if (currentUser) {
        activeUser = currentUser;
      }
      
      setUser(activeUser);
      if (['janrelbugtay03@gmail.com', 'khaisangschool.edu.vn@gmail.com'].includes(activeUser?.email || '') || (currentUser && ['janrelbugtay03@gmail.com', 'khaisangschool.edu.vn@gmail.com'].includes(currentUser.email || ''))) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      
      if (activeUser) {
        // Track the user activity in Firestore
        try {
          const ud = await getDocFromServer(doc(db, 'users', activeUser.uid));
          if (ud.exists() && ud.data().course) {
            setUserCourse(ud.data().course);
          } else {
            setUserCourse(null);
          }
        } catch(e) {}

        try {
          const userRef = doc(db, 'users', activeUser.uid);
          const updateData: any = {
            lastActive: serverTimestamp(),
          };
          if (activeUser.displayName) updateData.name = activeUser.displayName;
          if (activeUser.email) updateData.email = activeUser.email;
          if (activeUser.photoURL) updateData.photoURL = activeUser.photoURL;
          
          await setDoc(userRef, updateData, { merge: true });
        } catch (e) {
          console.warn("Failed to update user activity (likely rules propagating):", e);
        }
      }
      
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      checkUser(currentUser);
    });

    const handleStorage = () => {
      checkUser(auth.currentUser);
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
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
      
      if (result?.user) {
        try {
          if (result.user.email === 'janrelbugtay03@gmail.com' || result.user.email === 'khaisangschool.edu.vn@gmail.com') {
            await setDoc(doc(db, 'users', result.user.uid), {
              name: result.user.displayName || 'Admin',
              email: result.user.email,
              lastLogin: serverTimestamp(),
              lastActive: serverTimestamp(),
            }, { merge: true });
            return;
          }

          const docSnap = await getDocFromServer(doc(db, 'users', result.user.uid));
          if (!docSnap.exists()) {
            await firebaseSignOut(auth);
            throw new Error("Your Google account is not linked to any student account. Please contact your teacher.");
          } else {
            await setDoc(doc(db, 'users', result.user.uid), {
              lastLogin: serverTimestamp(),
              lastActive: serverTimestamp(),
            }, { merge: true });
          }
        } catch (e) {
          console.error('Error handling popup user data:', e);
          throw e;
        }
      }
    } catch (error: any) {
      console.error('Error initiating sign in:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed before completing. Please try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google Sign-In. Please contact support.');
      }
      throw error;
    }
  };

  const signInWithEmail = async (e: string, p: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, e, p);
      if (result.user) {
        try {
          await setDoc(doc(db, 'users', result.user.uid), {
            lastLogin: serverTimestamp(),
            lastActive: serverTimestamp(),
          }, { merge: true });
        } catch(e) {}
      }
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (e: string, p: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, e, p);
      if (result.user) {
        try {
          await setDoc(doc(db, 'users', result.user.uid), {
            name: result.user.displayName || e.split('@')[0],
            email: result.user.email || '',
            photoURL: result.user.photoURL || '',
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
            lastActive: serverTimestamp(),
          });
        } catch(e) {}
      }
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('studentUid');
      setUser(null);
      setIsAdmin(false);
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userCourse, loading, isAdmin, signIn, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
