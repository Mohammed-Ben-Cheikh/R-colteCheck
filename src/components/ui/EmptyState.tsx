/**
 * EmptyState Component
 *
 * Displayed when a list is empty (no parcels, no harvests, etc.).
 * Shows an icon, title and optional description.
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, FontSizes, Spacing } from "../../constants/theme";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={Colors.textLight} />
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  description: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});
