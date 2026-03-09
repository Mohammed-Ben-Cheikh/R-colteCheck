/**
 * Add Parcel Screen
 *
 * Form to create a new agricultural parcel.
 */

import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button, Input } from "@/src/components";
import {
  BorderRadius,
  Colors,
  FontSizes,
  Shadows,
  Spacing,
} from "@/src/constants/theme";
import { useAuth } from "@/src/context";
import { createParcel } from "@/src/services/parcelService";
import { formatDate } from "@/src/utils/formatters";
import { validateParcelForm } from "@/src/utils/validation";

export default function AddParcelScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [surface, setSurface] = useState("");
  const [cropType, setCropType] = useState("");
  const [plantingDate, setPlantingDate] = useState(new Date());
  const [harvestPeriod, setHarvestPeriod] = useState("");
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Handle form submission */
  const handleSubmit = async () => {
    const formErrors = validateParcelForm({
      name,
      surface,
      cropType,
      plantingDate: plantingDate.toISOString(),
    });
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    if (!user) return;

    setLoading(true);
    try {
      await createParcel(user.uid, {
        name: name.trim(),
        surface: parseFloat(surface),
        cropType: cropType.trim(),
        plantingDate: plantingDate.toISOString(),
        harvestPeriod: harvestPeriod.trim(),
        notes: notes.trim(),
      });
      Alert.alert("Succès", "Parcelle créée avec succès.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Erreur", "Impossible de créer la parcelle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Nouvelle parcelle</Text>

          <Input
            label="Nom de la parcelle *"
            placeholder="Ex: Parcelle Nord"
            icon="map-outline"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />

          <Input
            label="Superficie (hectares) *"
            placeholder="Ex: 2.5"
            icon="resize-outline"
            value={surface}
            onChangeText={setSurface}
            error={errors.surface}
            keyboardType="decimal-pad"
          />

          <Input
            label="Type de culture *"
            placeholder="Ex: Blé, Maïs, Tomates..."
            icon="leaf-outline"
            value={cropType}
            onChangeText={setCropType}
            error={errors.cropType}
          />

          {/* Planting Date */}
          <View style={styles.dateField}>
            <Text style={styles.label}>Date de plantation *</Text>
            <Button
              title={formatDate(plantingDate)}
              variant="outline"
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            />
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={plantingDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) setPlantingDate(selectedDate);
              }}
            />
          )}

          <Input
            label="Période de récolte prévue"
            placeholder="Ex: Juillet - Août"
            icon="calendar-outline"
            value={harvestPeriod}
            onChangeText={setHarvestPeriod}
          />

          <Input
            label="Notes"
            placeholder="Notes complémentaires..."
            icon="document-text-outline"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />

          <Button
            title="Créer la parcelle"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
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
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  formTitle: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  dateField: {
    marginBottom: Spacing.md,
  },
  dateButton: {
    alignItems: "flex-start",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});
