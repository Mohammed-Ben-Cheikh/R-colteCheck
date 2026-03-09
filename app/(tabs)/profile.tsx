/**
 * Profile Screen
 *
 * Allows the farmer to view and edit their profile information,
 * and to sign out.
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button, Input, LoadingSpinner } from "@/src/components";
import {
  BorderRadius,
  Colors,
  FontSizes,
  Shadows,
  Spacing,
} from "@/src/constants/theme";
import { useAuth } from "@/src/context";
import { updateUserProfile } from "@/src/services/userService";
import { isValidPhone } from "@/src/utils/validation";

export default function ProfileScreen() {
  const { profile, signOut, refreshProfile } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [farmName, setFarmName] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Populate form with current profile data
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setFarmName(profile.farmName);
      setLocation(profile.location);
    }
  }, [profile]);

  /** Save profile changes */
  const handleSave = async () => {
    if (!profile) return;

    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom est requis.");
      return;
    }

    if (phone && !isValidPhone(phone)) {
      Alert.alert("Erreur", "Le numéro de téléphone est invalide.");
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile(profile.uid, {
        name: name.trim(),
        phone: phone.trim(),
        farmName: farmName.trim(),
        location: location.trim(),
        email: profile.email,
      });
      await refreshProfile();
      setEditing(false);
      Alert.alert("Succès", "Profil mis à jour avec succès.");
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error.message || "Impossible de mettre à jour le profil.",
      );
    } finally {
      setSaving(false);
    }
  };

  /** Handle sign out with confirmation */
  const handleSignOut = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert("Erreur", error.message);
          }
        },
      },
    ]);
  };

  if (!profile) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar & Name */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={Colors.white} />
          </View>
          <Text style={styles.userName}>{profile.name}</Text>
          <Text style={styles.userEmail}>{profile.email}</Text>
        </View>

        {/* Profile Form */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Informations personnelles</Text>
            {!editing && (
              <Text style={styles.editLink} onPress={() => setEditing(true)}>
                Modifier
              </Text>
            )}
          </View>

          <Input
            label="Nom complet"
            placeholder="Votre nom"
            icon="person-outline"
            value={name}
            onChangeText={setName}
            editable={editing}
          />

          <Input
            label="E-mail"
            placeholder="votre@email.com"
            icon="mail-outline"
            value={profile.email}
            editable={false}
          />

          <Input
            label="Téléphone"
            placeholder="+33 6 12 34 56 78"
            icon="call-outline"
            value={phone}
            onChangeText={setPhone}
            editable={editing}
            keyboardType="phone-pad"
          />

          <Input
            label="Nom de l'exploitation"
            placeholder="Ma Ferme (optionnel)"
            icon="business-outline"
            value={farmName}
            onChangeText={setFarmName}
            editable={editing}
          />

          <Input
            label="Localisation"
            placeholder="Ville, Région (optionnel)"
            icon="location-outline"
            value={location}
            onChangeText={setLocation}
            editable={editing}
          />

          {editing && (
            <View style={styles.formActions}>
              <Button
                title="Annuler"
                variant="outline"
                onPress={() => {
                  setEditing(false);
                  // Reset to original values
                  setName(profile.name);
                  setPhone(profile.phone);
                  setFarmName(profile.farmName);
                  setLocation(profile.location);
                }}
                style={styles.formActionBtn}
              />
              <Button
                title="Enregistrer"
                onPress={handleSave}
                loading={saving}
                style={styles.formActionBtn}
              />
            </View>
          )}
        </View>

        {/* Sign Out */}
        <Button
          title="Se déconnecter"
          variant="danger"
          onPress={handleSignOut}
          style={styles.signOutButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  userName: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  userEmail: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  formTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  editLink: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: "600",
  },
  formActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  formActionBtn: {
    flex: 1,
  },
  signOutButton: {
    marginTop: Spacing.sm,
  },
});
