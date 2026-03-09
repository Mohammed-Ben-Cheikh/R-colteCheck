import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";

export default function ProfilScreen() {
  const { profile, signOutUser, saveProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setFullName(profile.fullName);
    setPhone(profile.phone);
    setLocation(profile.location);
  }, [profile]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("Validation", "Le nom complet est obligatoire.");
      return;
    }

    try {
      setSaving(true);
      await saveProfile({ fullName, phone, location });
      Alert.alert("Succès", "Profil mis à jour.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur de mise à jour.";
      Alert.alert("Erreur", message);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Profil Agriculteur
      </ThemedText>

      <ThemedView style={styles.card}>
        <ThemedText>Email</ThemedText>
        <ThemedText type="defaultSemiBold">{profile.email}</ThemedText>

        <ThemedText>Nom complet</ThemedText>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
        />

        <ThemedText>Téléphone</ThemedText>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <ThemedText>Localisation</ThemedText>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />

        <Pressable
          onPress={handleSave}
          style={styles.primaryButton}
          disabled={saving}
        >
          <ThemedText style={styles.primaryButtonText}>
            {saving ? "Enregistrement..." : "Enregistrer le profil"}
          </ThemedText>
        </Pressable>

        <Pressable onPress={signOutUser} style={styles.logoutButton}>
          <ThemedText style={styles.logoutButtonText}>
            Se déconnecter
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
  },
  card: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  primaryButton: {
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  logoutButton: {
    backgroundColor: "#334155",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
