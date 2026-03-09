/**
 * Root Layout
 *
 * The top-level layout for the entire application.
 * Wraps the navigation tree with AuthProvider and handles
 * the auth redirect logic.
 */

import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { LoadingSpinner } from "@/src/components";
import { Colors } from "@/src/constants/theme";
import { AuthProvider, useAuth } from "@/src/context";

// Prevent the splash screen from hiding until auth state is resolved
SplashScreen.preventAutoHideAsync();

/**
 * Inner layout that handles auth-based navigation redirect.
 */
function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Check if the user is on an auth screen
    const inAuthGroup = segments[0] === "(auth)";

    if (!user && !inAuthGroup) {
      // Not signed in → redirect to login
      router.replace("/(auth)/login");
    } else if (user && inAuthGroup) {
      // Signed in → redirect to dashboard
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return <LoadingSpinner message="Initialisation..." />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: "600" },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="parcel/add"
          options={{ title: "Nouvelle Parcelle" }}
        />
        <Stack.Screen
          name="parcel/[id]"
          options={{ title: "Détails Parcelle" }}
        />
        <Stack.Screen
          name="parcel/edit/[id]"
          options={{ title: "Modifier Parcelle" }}
        />
        <Stack.Screen
          name="harvest/add/[parcelId]"
          options={{ title: "Nouvelle Récolte" }}
        />
        <Stack.Screen
          name="harvest/[parcelId]"
          options={{ title: "Historique Récoltes" }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

/**
 * Root Layout export – wraps everything in AuthProvider.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
