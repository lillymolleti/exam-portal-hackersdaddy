import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, doc, getDoc } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut, signInWithEmailAndPassword } from 'firebase/auth';

interface User {
  firebaseUser: FirebaseUser;
  name: string;
  role: 'admin' | 'student';
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          const newUser: User = {
            firebaseUser,
            name: userData.name || firebaseUser.email || 'Unknown User',
            email: firebaseUser.email || 'No email',
            role: (userData.role as 'admin' | 'student') || 'student',
          };
          setUser(newUser);
          console.log('AuthContext: User loaded:', {
            uid: firebaseUser.uid,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          });
        } catch (error) {
          console.error('AuthContext: Error fetching user data:', error);
          const newUser: User = {
            firebaseUser,
            name: firebaseUser.email || 'Unknown User',
            email: firebaseUser.email || 'No email',
            role: 'student',
          };
          setUser(newUser);
        }
      } else {
        setUser(null);
        console.log('AuthContext: No user signed in');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthContext: Login successful for email:', email);
    } catch (error: any) {
      console.error('AuthContext: Login error:', error.code, error.message);
      throw error; // Let the caller handle the error
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log('AuthContext: User signed out successfully');
      setUser(null);
    } catch (error) {
      console.error('AuthContext: Error signing out:', error);
    }
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};