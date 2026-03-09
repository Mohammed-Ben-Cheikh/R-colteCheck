/**
 * Authentication Context
 *
 * Provides authentication state and actions to the entire app.
 * Uses Firebase Authentication with persistent sessions.
 * Automatically creates a user profile on registration.
 */

import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  User,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { createUserProfile, getUserProfile } from "../services/userService";
import { UserProfile } from "../types";
import { getFirebaseErrorMessage } from "../utils/errors";

/** Shape of the auth context value */
interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider wraps the app and manages authentication state.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          setProfile(userProfile);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  /** Sign in with email and password */
  const signIn = async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const userProfile = await getUserProfile(credential.user.uid);
      setProfile(userProfile);
    } catch (error) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  };

  /** Register a new farmer account */
  const signUp = async (name: string, email: string, password: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await createUserProfile(credential.user.uid, { name, email });
      const userProfile = await getUserProfile(credential.user.uid);
      setProfile(userProfile);
    } catch (error) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  };

  /** Sign out the current user */
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setProfile(null);
    } catch (error) {
      throw new Error(getFirebaseErrorMessage(error));
    }
  };

  /** Reload the profile from Firestore */
  const refreshProfile = async () => {
    if (!user) return;
    const userProfile = await getUserProfile(user.uid);
    setProfile(userProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume the auth context.
 * Throws if used outside of AuthProvider.
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
