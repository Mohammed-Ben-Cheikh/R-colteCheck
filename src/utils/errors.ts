/**
 * Firebase error message mapper
 *
 * Translates Firebase error codes into user-friendly
 * French messages for the RécolteCheck app.
 */

/**
 * Map Firebase auth error codes to French messages.
 */
export const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "Cette adresse e-mail est déjà utilisée.";
    case "auth/invalid-email":
      return "L'adresse e-mail est invalide.";
    case "auth/user-not-found":
      return "Aucun compte trouvé avec cette adresse e-mail.";
    case "auth/wrong-password":
      return "Mot de passe incorrect.";
    case "auth/weak-password":
      return "Le mot de passe est trop faible. Utilisez au moins 6 caractères.";
    case "auth/too-many-requests":
      return "Trop de tentatives. Veuillez réessayer plus tard.";
    case "auth/network-request-failed":
      return "Erreur de connexion réseau. Vérifiez votre connexion Internet.";
    case "auth/invalid-credential":
      return "Identifiants invalides. Vérifiez votre e-mail et mot de passe.";
    default:
      return "Une erreur est survenue. Veuillez réessayer.";
  }
};

/**
 * Extract error code from Firebase error.
 */
export const extractErrorCode = (error: unknown): string => {
  if (error && typeof error === "object" && "code" in error) {
    return (error as { code: string }).code;
  }
  return "unknown";
};

/**
 * Get a user-friendly error message from any Firebase error.
 */
export const getFirebaseErrorMessage = (error: unknown): string => {
  const code = extractErrorCode(error);
  return getAuthErrorMessage(code);
};
