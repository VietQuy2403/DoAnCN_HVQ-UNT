import React, { createContext, useState, useEffect, useContext } from 'react';
import { useConvex, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { hashPassword, saveSession, getSession, clearSession } from '../services/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const convex = useConvex();

  const signUpMutation = useMutation(api.auth.signUp);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const userId = await getSession();
      if (userId) {
        // Verify user exists in database
        try {
          const userData = await convex.query(api.auth.getUser, { userId });
          if (userData) {
            setUser({ userId, ...userData });
          } else {
            // User doesn't exist in database, clear invalid session
            console.log('User not found in database, clearing session');
            await clearSession();
            setUser(null);
          }
        } catch (error) {
          // Error fetching user, clear session
          console.error('Error fetching user:', error);
          await clearSession();
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, name) => {
    const passwordHash = hashPassword(password);
    const userId = await signUpMutation({ email, passwordHash, name });

    // Don't auto-login, just return userId
    return userId;
  };

  const signIn = async (email, password) => {
    const passwordHash = hashPassword(password);

    try {
      // Clear any existing session first to prevent data mixing
      await clearSession();
      setUser(null);

      const userData = await convex.query(api.auth.signIn, { email, passwordHash });
      await saveSession(userData.userId);
      setUser(userData);
      return userData;
    } catch (error) {
      throw new Error(error.message || 'Đăng nhập thất bại');
    }
  };

  const signOut = async () => {
    await clearSession();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
