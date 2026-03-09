/**
 * Edit Parcel Screen
 *
 * Form to edit an existing agricultural parcel.
 * Pre-populates with current parcel data.
 */

import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { getParcelById, updateParcel } from "@/src/services/parcelService";
import { Parcel } from "@/src/types";
import { formatDate } from "@/src/utils/formatters";
import { validateParcelForm } from "@/src/utils/validation";

export default function EditParcelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [name, setName] = useState("");
  const [surface, setSurface] = useState("");
  const [cropType, setCropType] = useState("");
  const [plantingDate, setPlantingDate] = useState(new Date());
  const [harvestPeriod, setHarvestPeriod] = useState("");
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Load existing parcel data */
  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      (async () => {
        try {
          const p = await getParcelById(id);
          if (p) {
            setParcel(p);
            setName(p.name);
            setSurface(p.surface.toString());
            setCropType(p.cropType);
            setPlantingDate(new Date(p.plantingDate));
            setHarvestPeriod(p.harvestPeriod);
            setNotes(p.notes);
          }
        } catch (error) {
          console.error("Error loading parcel:", error);
        } finally {
          setLoading(false);
        }
      })();
    }, [id]),
  );

  /** Handle form submission */
  const handleSubmit = async () => {
    if (!id) return;

    const formErrors = validateParcelForm({
      name,
      surface,
      cropType,
      plantingDate: plantingDate.toISOString(),
    });
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setSaving(true);
    try {
      await updateParcel(id, {
        name: name.trim(),
        surface: parseFloat(surface),
        cropType: cropType.trim(),
        plantingDate: plantingDate.toISOString(),
        harvestPeriod: harvestPeriod.trim(),
        notes: notes.trim(),
      });
      Alert.alert("Succès", "Parcelle mise à jour.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Erreur", "Impossible de mettre à jour la parcelle.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!parcel) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Parcelle introuvable</Text>
        <Button
          title="Retour"
          variant="outline"
          onPress={() => router.back()}
        />
      </View>
    );
  }

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
          <Text style={styles.formTitle}>Modifier la parcelle</Text>

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

          <View style={styles.actionsRow}>
            <Button
              title="Annuler"
              variant="outline"
              onPress={() => router.back()}
              style={styles.actionBtn}
            />
            <Button
              title="Enregistrer"
              onPress={handleSubmit}
              loading={saving}
              style={styles.actionBtn}
            />
          </View>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
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
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
