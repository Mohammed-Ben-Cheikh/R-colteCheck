/**
 * Auth Group Layout
 *
 * Simple stack layout for authentication screens (Login, Register).
 * No header shown – each screen manages its own header.
 */

import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
