/**
 * Date formatting helpers
 *
 * Provides consistent date formatting across the application
 * using the French locale for farmer-friendly display.
 */

/**
 * Format a date string or Date to DD/MM/YYYY
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format a date to a long French-style string: "12 mars 2026"
 */
export const formatDateLong = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const months = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * Get current date as ISO string
 */
export const getCurrentDateISO = (): string => {
  return new Date().toISOString();
};

/**
 * Format a weight with its unit for display
 */
export const formatWeight = (weight: number, unit: string): string => {
  return `${weight.toLocaleString("fr-FR")} ${unit}`;
};
