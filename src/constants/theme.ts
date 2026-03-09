/**
 * Application-wide theme constants
 *
 * Defines the color palette, spacing, typography, and border radius
 * values used throughout the RécolteCheck application.
 * The green palette reflects the agricultural nature of the app.
 */

export const Colors = {
  // Primary green palette
  primary: "#2E7D32",
  primaryLight: "#4CAF50",
  primaryDark: "#1B5E20",

  // Secondary earth tones
  secondary: "#795548",
  secondaryLight: "#A1887F",
  secondaryDark: "#4E342E",

  // Accent / highlight
  accent: "#FF9800",
  accentLight: "#FFB74D",

  // Status colors
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  info: "#2196F3",

  // Neutrals
  white: "#FFFFFF",
  background: "#F5F7F5",
  surface: "#FFFFFF",
  border: "#E0E0E0",
  divider: "#EEEEEE",

  // Text
  textPrimary: "#212121",
  textSecondary: "#757575",
  textLight: "#BDBDBD",
  textOnPrimary: "#FFFFFF",

  // Transparent
  overlay: "rgba(0, 0, 0, 0.5)",
  ripple: "rgba(46, 125, 50, 0.12)",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  title: 34,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 8,
  },
};
