/**
 * LoadingSpinner Component
 *
 * Full-screen centered loading indicator used during
 * async operations throughout the app.
 */

import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors, FontSizes, Spacing } from "../../constants/theme";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Chargement...",
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  message: {
    marginTop: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});
