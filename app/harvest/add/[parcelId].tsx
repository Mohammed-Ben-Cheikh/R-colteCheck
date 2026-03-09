/**
 * Add Harvest Screen
 *
 * Form to record a new harvest for a specific parcel.
 * Receives the parcelId from the route params.
 */

import { Ionicons } from "@expo/vector-icons";
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
  TouchableOpacity,
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
import { createHarvest } from "@/src/services/harvestService";
import { getParcelById } from "@/src/services/parcelService";
import { Parcel, WeightUnit } from "@/src/types";
import { formatDate } from "@/src/utils/formatters";
import { validateHarvestForm } from "@/src/utils/validation";

export default function AddHarvestScreen() {
  const { parcelId } = useLocalSearchParams<{ parcelId: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [date, setDate] = useState(new Date());
  const [crop, setCrop] = useState("");
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load parcel info to pre-fill crop type
  useFocusEffect(
    useCallback(() => {
      if (!parcelId) return;
      (async () => {
        try {
          const p = await getParcelById(parcelId);
          if (p) {
            setParcel(p);
            setCrop(p.cropType); // default crop from parcel
          }
        } catch (error) {
          console.error("Error loading parcel:", error);
        }
      })();
    }, [parcelId]),
  );

  /** Handle form submission */
  const handleSubmit = async () => {
    if (!user || !parcelId) return;

    const formErrors = validateHarvestForm({
      date: date.toISOString(),
      crop,
      weight,
    });
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setLoading(true);
    try {
      await createHarvest(user.uid, {
        parcelId,
        date: date.toISOString(),
        crop: crop.trim(),
        weight: parseFloat(weight),
        unit,
        notes: notes.trim(),
      });
      Alert.alert("Succès", "Récolte enregistrée avec succès.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Erreur", "Impossible d'enregistrer la récolte.");
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
        {/* Parcel info */}
        {parcel && (
          <View style={styles.parcelInfo}>
            <Ionicons name="map" size={18} color={Colors.primary} />
            <Text style={styles.parcelName}>Parcelle : {parcel.name}</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Nouvelle récolte</Text>

          {/* Harvest Date */}
          <View style={styles.dateField}>
            <Text style={styles.label}>Date de récolte *</Text>
            <Button
              title={formatDate(date)}
              variant="outline"
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            />
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          <Input
            label="Culture récoltée *"
            placeholder="Ex: Blé, Maïs..."
            icon="leaf-outline"
            value={crop}
            onChangeText={setCrop}
            error={errors.crop}
          />

          {/* Weight with unit toggle */}
          <View style={styles.weightRow}>
            <View style={styles.weightInput}>
              <Input
                label="Poids récolté *"
                placeholder="Ex: 500"
                icon="scale-outline"
                value={weight}
                onChangeText={setWeight}
                error={errors.weight}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.unitToggle}>
              <Text style={styles.label}>Unité</Text>
              <View style={styles.unitButtons}>
                <TouchableOpacity
                  style={[
                    styles.unitBtn,
                    unit === "kg" && styles.unitBtnActive,
                  ]}
                  onPress={() => setUnit("kg")}
                >
                  <Text
                    style={[
                      styles.unitBtnText,
                      unit === "kg" && styles.unitBtnTextActive,
                    ]}
                  >
                    kg
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.unitBtn,
                    unit === "tonnes" && styles.unitBtnActive,
                  ]}
                  onPress={() => setUnit("tonnes")}
                >
                  <Text
                    style={[
                      styles.unitBtnText,
                      unit === "tonnes" && styles.unitBtnTextActive,
                    ]}
                  >
                    t
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Input
            label="Notes"
            placeholder="Observations, conditions météo..."
            icon="document-text-outline"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />

          <Button
            title="Enregistrer la récolte"
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
  parcelInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    backgroundColor: Colors.primary + "15",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  parcelName: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: Colors.primary,
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
  weightRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  weightInput: {
    flex: 2,
  },
  unitToggle: {
    flex: 1,
  },
  unitButtons: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    minHeight: 46,
  },
  unitBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
  },
  unitBtnActive: {
    backgroundColor: Colors.primary,
  },
  unitBtnText: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  unitBtnTextActive: {
    color: Colors.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});
