/**
 * TypeScript type definitions for the RécolteCheck application.
 *
 * Defines the shape of all data models used across Firestore
 * and the application state.
 */

/** Farmer profile stored in Firestore /users/{userId} */
export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  farmName: string;
  location: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

/** Agricultural parcel stored in Firestore /parcels/{parcelId} */
export interface Parcel {
  id: string;
  userId: string;
  name: string;
  surface: number; // surface area in hectares
  cropType: string;
  plantingDate: string; // ISO date string
  harvestPeriod: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Unit of weight measurement for harvests */
export type WeightUnit = "kg" | "tonnes";

/** Harvest record stored in Firestore /harvests/{harvestId} */
export interface Harvest {
  id: string;
  parcelId: string;
  userId: string;
  date: string; // ISO date string
  crop: string;
  weight: number;
  unit: WeightUnit;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Form data types for creating / editing (without id and timestamps) */
export type ParcelFormData = Omit<
  Parcel,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type HarvestFormData = Omit<
  Harvest,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type ProfileFormData = Omit<
  UserProfile,
  "uid" | "createdAt" | "updatedAt"
>;

/** Generic loading / error state for async operations */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
