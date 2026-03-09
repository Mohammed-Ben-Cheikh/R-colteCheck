/**
 * Validation utility functions
 *
 * Provides reusable validation logic for forms
 * throughout the application.
 */

/** Check if a string is empty or only whitespace */
export const isEmpty = (value: string): boolean => {
  return !value || value.trim().length === 0;
};

/** Validate email format */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/** Validate that a number is positive */
export const isPositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

/** Validate minimum password length */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/** Validate phone number (basic – allows digits, spaces, dashes, plus) */
export const isValidPhone = (phone: string): boolean => {
  if (isEmpty(phone)) return true; // phone is optional
  const phoneRegex = /^[+]?[\d\s-]{7,15}$/;
  return phoneRegex.test(phone);
};

/** Validate that a date string is a valid date */
export const isValidDate = (dateString: string): boolean => {
  if (isEmpty(dateString)) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validate login form fields.
 * Returns an object with field-level error messages.
 */
export const validateLoginForm = (email: string, password: string) => {
  const errors: { email?: string; password?: string } = {};

  if (isEmpty(email)) {
    errors.email = "L'adresse e-mail est requise";
  } else if (!isValidEmail(email)) {
    errors.email = "Adresse e-mail invalide";
  }

  if (isEmpty(password)) {
    errors.password = "Le mot de passe est requis";
  } else if (!isValidPassword(password)) {
    errors.password = "Le mot de passe doit contenir au moins 6 caractères";
  }

  return errors;
};

/**
 * Validate registration form fields.
 */
export const validateRegisterForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
) => {
  const errors: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  } = {};

  if (isEmpty(name)) {
    errors.name = "Le nom est requis";
  }

  if (isEmpty(email)) {
    errors.email = "L'adresse e-mail est requise";
  } else if (!isValidEmail(email)) {
    errors.email = "Adresse e-mail invalide";
  }

  if (isEmpty(password)) {
    errors.password = "Le mot de passe est requis";
  } else if (!isValidPassword(password)) {
    errors.password = "Le mot de passe doit contenir au moins 6 caractères";
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas";
  }

  return errors;
};

/**
 * Validate parcel form fields.
 */
export const validateParcelForm = (data: {
  name: string;
  surface: string;
  cropType: string;
  plantingDate: string;
}) => {
  const errors: {
    name?: string;
    surface?: string;
    cropType?: string;
    plantingDate?: string;
  } = {};

  if (isEmpty(data.name)) {
    errors.name = "Le nom de la parcelle est requis";
  }

  if (isEmpty(data.surface)) {
    errors.surface = "La superficie est requise";
  } else if (!isPositiveNumber(parseFloat(data.surface))) {
    errors.surface = "La superficie doit être un nombre positif";
  }

  if (isEmpty(data.cropType)) {
    errors.cropType = "Le type de culture est requis";
  }

  if (isEmpty(data.plantingDate)) {
    errors.plantingDate = "La date de plantation est requise";
  }

  return errors;
};

/**
 * Validate harvest form fields.
 */
export const validateHarvestForm = (data: {
  date: string;
  crop: string;
  weight: string;
}) => {
  const errors: {
    date?: string;
    crop?: string;
    weight?: string;
  } = {};

  if (isEmpty(data.date)) {
    errors.date = "La date de récolte est requise";
  }

  if (isEmpty(data.crop)) {
    errors.crop = "La culture récoltée est requise";
  }

  if (isEmpty(data.weight)) {
    errors.weight = "Le poids est requis";
  } else if (!isPositiveNumber(parseFloat(data.weight))) {
    errors.weight = "Le poids doit être un nombre positif";
  }

  return errors;
};
