import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { auth, db } from "@/lib/firebase";

type FarmerProfile = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
};

type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
};

type AuthContextValue = {
  user: User | null;
  profile: FarmerProfile | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOutUser: () => Promise<void>;
  saveProfile: (
    input: Pick<FarmerProfile, "fullName" | "phone" | "location">,
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [initializing, setInitializing] = useState(true);

  const hydrateProfile = async (
    uid: string,
    fallback: { email: string; fullName: string },
  ) => {
    const profileRef = doc(db, "farmers", uid);
    const snapshot = await getDoc(profileRef);

    if (!snapshot.exists()) {
      const payload = {
        fullName: fallback.fullName,
        email: fallback.email,
        phone: "",
        location: "",
        role: "agriculteur",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(profileRef, payload);
      setProfile({
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone,
        location: payload.location,
      });
      return;
    }

    const data = snapshot.data();
    setProfile({
      fullName: String(data.fullName ?? fallback.fullName),
      email: String(data.email ?? fallback.email),
      phone: String(data.phone ?? ""),
      location: String(data.location ?? ""),
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (nextUser) {
        await hydrateProfile(nextUser.uid, {
          email: nextUser.email ?? "",
          fullName: nextUser.displayName ?? "Agriculteur",
        });
      } else {
        setProfile(null);
      }

      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      initializing,
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      },
      signUp: async ({ email, password, fullName, phone }) => {
        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

        if (fullName.trim()) {
          await updateProfile(credential.user, {
            displayName: fullName.trim(),
          });
        }

        const profileRef = doc(db, "farmers", credential.user.uid);
        await setDoc(profileRef, {
          fullName: fullName.trim(),
          email: credential.user.email,
          phone: (phone ?? "").trim(),
          location: "",
          role: "agriculteur",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setProfile({
          fullName: fullName.trim(),
          email: credential.user.email ?? email.trim(),
          phone: (phone ?? "").trim(),
          location: "",
        });
      },
      signOutUser: async () => {
        await signOut(auth);
      },
      saveProfile: async ({ fullName, phone, location }) => {
        if (!user) {
          return;
        }

        const profileRef = doc(db, "farmers", user.uid);
        await setDoc(
          profileRef,
          {
            fullName: fullName.trim(),
            email: user.email,
            phone: phone.trim(),
            location: location.trim(),
            role: "agriculteur",
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        if (fullName.trim() && fullName.trim() !== user.displayName) {
          await updateProfile(user, { displayName: fullName.trim() });
        }

        setProfile((current) => ({
          fullName: fullName.trim(),
          email: user.email ?? current?.email ?? "",
          phone: phone.trim(),
          location: location.trim(),
        }));
      },
    }),
    [initializing, profile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
