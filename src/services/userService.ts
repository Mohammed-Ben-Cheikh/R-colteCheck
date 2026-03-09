/**
 * User Profile Service
 *
 * Handles all Firestore operations related to the farmer's profile.
 * Collection: /users/{userId}
 */

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { ProfileFormData, UserProfile } from "../types";
import { getCurrentDateISO } from "../utils/formatters";

const USERS_COLLECTION = "users";

/**
 * Create a new user profile in Firestore after registration.
 */
export const createUserProfile = async (
  uid: string,
  data: { name: string; email: string },
): Promise<void> => {
  const now = getCurrentDateISO();
  const profile: UserProfile = {
    uid,
    name: data.name,
    email: data.email,
    phone: "",
    farmName: "",
    location: "",
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, USERS_COLLECTION, uid), profile);
};

/**
 * Fetch the current user's profile from Firestore.
 */
export const getUserProfile = async (
  uid: string,
): Promise<UserProfile | null> => {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
};

/**
 * Update the current user's profile.
 */
export const updateUserProfile = async (
  uid: string,
  data: Partial<ProfileFormData>,
): Promise<void> => {
  await updateDoc(doc(db, USERS_COLLECTION, uid), {
    ...data,
    updatedAt: getCurrentDateISO(),
  });
};
