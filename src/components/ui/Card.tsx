/**
 * Card Component
 *
 * A reusable card wrapper with shadow and rounded corners.
 * Used for parcel cards, harvest cards, dashboard stat cards, etc.
 */

import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { BorderRadius, Colors, Shadows, Spacing } from "../../constants/theme";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, onPress, style }) => {
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
});
