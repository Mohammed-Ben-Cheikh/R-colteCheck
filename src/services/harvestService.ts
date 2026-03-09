/**
 * Harvest Service
 *
 * Handles all Firestore operations for harvest records.
 * Collection: /harvests/{harvestId}
 *
 * Each harvest is linked to a parcel and the authenticated farmer.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { Harvest, HarvestFormData } from "../types";
import { getCurrentDateISO } from "../utils/formatters";

const HARVESTS_COLLECTION = "harvests";

/**
 * Create a new harvest record for a parcel.
 */
export const createHarvest = async (
  userId: string,
  data: HarvestFormData,
): Promise<string> => {
  const now = getCurrentDateISO();
  const docRef = await addDoc(collection(db, HARVESTS_COLLECTION), {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
};

/**
 * Get all harvest records for a specific parcel.
 */
export const getHarvestsByParcel = async (
  parcelId: string,
): Promise<Harvest[]> => {
  const q = query(
    collection(db, HARVESTS_COLLECTION),
    where("parcelId", "==", parcelId),
    orderBy("date", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Harvest);
};

/**
 * Get all harvest records for a farmer (across all parcels).
 */
export const getHarvestsByUser = async (userId: string): Promise<Harvest[]> => {
  const q = query(
    collection(db, HARVESTS_COLLECTION),
    where("userId", "==", userId),
    orderBy("date", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Harvest);
};

/**
 * Delete a harvest record by ID.
 */
export const deleteHarvest = async (harvestId: string): Promise<void> => {
  await deleteDoc(doc(db, HARVESTS_COLLECTION, harvestId));
};

/**
 * Delete all harvests linked to a parcel (used when deleting a parcel).
 */
export const deleteHarvestsByParcel = async (
  parcelId: string,
): Promise<void> => {
  const q = query(
    collection(db, HARVESTS_COLLECTION),
    where("parcelId", "==", parcelId),
  );
  const snapshot = await getDocs(q);
  const deletions = snapshot.docs.map((d) => deleteDoc(d.ref));
  await Promise.all(deletions);
};
