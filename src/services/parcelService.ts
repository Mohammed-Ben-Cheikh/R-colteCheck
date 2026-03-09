/**
 * Parcel Service
 *
 * Handles all Firestore operations for agricultural parcels.
 * Collection: /parcels/{parcelId}
 *
 * All parcels are scoped to the authenticated farmer via userId.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { Parcel, ParcelFormData } from "../types";
import { getCurrentDateISO } from "../utils/formatters";

const PARCELS_COLLECTION = "parcels";

/**
 * Create a new parcel for the authenticated farmer.
 */
export const createParcel = async (
  userId: string,
  data: ParcelFormData,
): Promise<string> => {
  const now = getCurrentDateISO();
  const docRef = await addDoc(collection(db, PARCELS_COLLECTION), {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

/**
 * Get a single parcel by ID.
 */
export const getParcelById = async (
  parcelId: string,
): Promise<Parcel | null> => {
  const snapshot = await getDoc(doc(db, PARCELS_COLLECTION, parcelId));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Parcel;
};

/**
 * Get all parcels belonging to a farmer, ordered by creation date.
 */
export const getParcelsByUser = async (userId: string): Promise<Parcel[]> => {
  const q = query(
    collection(db, PARCELS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Parcel);
};

/**
 * Update an existing parcel.
 */
export const updateParcel = async (
  parcelId: string,
  data: Partial<ParcelFormData>,
): Promise<void> => {
  await updateDoc(doc(db, PARCELS_COLLECTION, parcelId), {
    ...data,
    updatedAt: getCurrentDateISO(),
  });
};

/**
 * Delete a parcel by ID.
 */
export const deleteParcel = async (parcelId: string): Promise<void> => {
  await deleteDoc(doc(db, PARCELS_COLLECTION, parcelId));
};
