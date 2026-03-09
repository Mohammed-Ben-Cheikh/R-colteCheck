import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
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
import { db } from "@/lib/firebase";

type ParcelOption = {
  id: string;
  name: string;
};

type Harvest = {
  id: string;
  parcelId: string;
  zoneName: string;
  weightKg: number;
  harvestedAt: string;
  notes: string;
};

export default function RecoltesScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [parcels, setParcels] = useState<ParcelOption[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);

  const [selectedParcelId, setSelectedParcelId] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [harvestedAt, setHarvestedAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    const parcelsUnsubscribe = onSnapshot(
      collection(db, "farmers", user.uid, "parcels"),
      (snapshot) => {
        const parcelData = snapshot.docs.map((entry) => ({
          id: entry.id,
          name: String(entry.data().name ?? "Parcelle"),
        }));
        setParcels(parcelData);
        if (!selectedParcelId && parcelData.length > 0) {
          setSelectedParcelId(parcelData[0].id);
        }
      },
    );

    const harvestsQuery = query(
      collection(db, "farmers", user.uid, "harvests"),
      orderBy("createdAt", "desc"),
    );

    const harvestsUnsubscribe = onSnapshot(harvestsQuery, (snapshot) => {
      const data = snapshot.docs.map((entry) => {
        const raw = entry.data();
        return {
          id: entry.id,
          parcelId: String(raw.parcelId ?? ""),
          zoneName: String(raw.zoneName ?? ""),
          weightKg: Number(raw.weightKg ?? 0),
          harvestedAt: String(raw.harvestedAt ?? ""),
          notes: String(raw.notes ?? ""),
        };
      });

      setHarvests(data);
      setLoading(false);
    });

    return () => {
      parcelsUnsubscribe();
      harvestsUnsubscribe();
    };
  }, [selectedParcelId, user]);

  const totalWeightKg = useMemo(
    () => harvests.reduce((sum, item) => sum + item.weightKg, 0),
    [harvests],
  );

  const resetForm = () => {
    setZoneName("");
    setWeightKg("");
    setHarvestedAt(new Date().toISOString().slice(0, 10));
    setNotes("");
  };

  const createHarvest = async () => {
    if (!user) {
      return;
    }

    if (!selectedParcelId) {
      Alert.alert("Validation", "Sélectionnez une parcelle.");
      return;
    }

    const parsedWeight = Number(weightKg.replace(",", "."));
    if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      Alert.alert("Validation", "Le poids récolté doit être supérieur à 0 kg.");
      return;
    }

    if (!zoneName.trim()) {
      Alert.alert("Validation", "La zone de récolte est obligatoire.");
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, "farmers", user.uid, "harvests"), {
        parcelId: selectedParcelId,
        zoneName: zoneName.trim(),
        weightKg: parsedWeight,
        harvestedAt: harvestedAt.trim(),
        notes: notes.trim(),
        createdAt: serverTimestamp(),
      });

      resetForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur lors de la création.";
      Alert.alert("Erreur", message);
    } finally {
      setSaving(false);
    }
  };

  const getParcelName = (parcelId: string) =>
    parcels.find((item) => item.id === parcelId)?.name ?? "N/A";

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Récoltes
      </ThemedText>
      <ThemedText>
        {harvests.length} entrée(s) • {totalWeightKg.toFixed(2)} kg
      </ThemedText>

      <ThemedView style={styles.formCard}>
        <ThemedText type="subtitle">Nouvelle récolte</ThemedText>

        <ThemedText type="defaultSemiBold">Parcelle</ThemedText>
        <View style={styles.chipsRow}>
          {parcels.map((parcel) => (
            <Pressable
              key={parcel.id}
              onPress={() => setSelectedParcelId(parcel.id)}
              style={[
                styles.chip,
                selectedParcelId === parcel.id
                  ? styles.chipSelected
                  : undefined,
              ]}
            >
              <ThemedText
                style={
                  selectedParcelId === parcel.id
                    ? styles.chipSelectedText
                    : undefined
                }
              >
                {parcel.name}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <TextInput
          placeholder="Zone (ex: Zone Nord)"
          style={styles.input}
          value={zoneName}
          onChangeText={setZoneName}
        />
        <TextInput
          placeholder="Poids (kg)"
          style={styles.input}
          value={weightKg}
          onChangeText={setWeightKg}
          keyboardType="decimal-pad"
        />
        <TextInput
          placeholder="Date (YYYY-MM-DD)"
          style={styles.input}
          value={harvestedAt}
          onChangeText={setHarvestedAt}
        />
        <TextInput
          placeholder="Notes"
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Pressable
          onPress={createHarvest}
          style={styles.primaryButton}
          disabled={saving}
        >
          <ThemedText style={styles.primaryButtonText}>
            {saving ? "Enregistrement..." : "Ajouter la récolte"}
          </ThemedText>
        </Pressable>
      </ThemedView>

      {harvests.map((harvest) => (
        <ThemedView key={harvest.id} style={styles.itemCard}>
          <ThemedText type="defaultSemiBold">
            {getParcelName(harvest.parcelId)}
          </ThemedText>
          <ThemedText>
            {harvest.zoneName} • {harvest.weightKg} kg
          </ThemedText>
          <ThemedText>Date: {harvest.harvestedAt || "N/A"}</ThemedText>
          {harvest.notes ? (
            <ThemedText>Notes: {harvest.notes}</ThemedText>
          ) : null}

          <Pressable
            onPress={async () => {
              if (!user) {
                return;
              }
              await deleteDoc(
                doc(db, "farmers", user.uid, "harvests", harvest.id),
              );
            }}
            style={styles.deleteButton}
          >
            <ThemedText style={styles.deleteButtonText}>Supprimer</ThemedText>
          </Pressable>
        </ThemedView>
      ))}
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
  formCard: {
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  chipSelected: {
    backgroundColor: "#0a7ea4",
    borderColor: "#0a7ea4",
  },
  chipSelectedText: {
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  itemCard: {
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  deleteButton: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#b91c1c",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: "#fff",
  },
});
