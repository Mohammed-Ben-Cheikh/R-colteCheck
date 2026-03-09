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

type Parcel = {
  id: string;
  name: string;
  areaHectares: number;
  cropName: string;
  harvestPeriod: string;
  notes: string;
};

export default function ParcellesScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parcels, setParcels] = useState<Parcel[]>([]);

  const [name, setName] = useState("");
  const [areaHectares, setAreaHectares] = useState("");
  const [cropName, setCropName] = useState("");
  const [harvestPeriod, setHarvestPeriod] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    const parcelsRef = collection(db, "farmers", user.uid, "parcels");
    const parcelsQuery = query(parcelsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(parcelsQuery, (snapshot) => {
      const data = snapshot.docs.map((item) => {
        const raw = item.data();
        return {
          id: item.id,
          name: String(raw.name ?? ""),
          areaHectares: Number(raw.areaHectares ?? 0),
          cropName: String(raw.cropName ?? ""),
          harvestPeriod: String(raw.harvestPeriod ?? ""),
          notes: String(raw.notes ?? ""),
        };
      });
      setParcels(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const parcelCountLabel = useMemo(
    () => `${parcels.length} parcelle(s)`,
    [parcels.length],
  );

  const resetForm = () => {
    setName("");
    setAreaHectares("");
    setCropName("");
    setHarvestPeriod("");
    setNotes("");
  };

  const createParcel = async () => {
    if (!user) {
      return;
    }

    if (!name.trim() || !cropName.trim()) {
      Alert.alert(
        "Validation",
        "Le nom de la parcelle et la culture sont obligatoires.",
      );
      return;
    }

    const parsedArea = Number(areaHectares.replace(",", "."));
    if (Number.isNaN(parsedArea) || parsedArea <= 0) {
      Alert.alert(
        "Validation",
        "Surface invalide. Entrez un nombre supérieur à 0.",
      );
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, "farmers", user.uid, "parcels"), {
        name: name.trim(),
        areaHectares: parsedArea,
        cropName: cropName.trim(),
        harvestPeriod: harvestPeriod.trim(),
        notes: notes.trim(),
        createdAt: serverTimestamp(),
      });
      resetForm();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de créer la parcelle.";
      Alert.alert("Erreur", message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (parcelId: string) => {
    if (!user) {
      return;
    }

    Alert.alert("Supprimer la parcelle", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "farmers", user.uid, "parcels", parcelId));
        },
      },
    ]);
  };

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
        Parcelles
      </ThemedText>
      <ThemedText>{parcelCountLabel}</ThemedText>

      <ThemedView style={styles.formCard}>
        <ThemedText type="subtitle">Nouvelle parcelle</ThemedText>
        <TextInput
          placeholder="Nom"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Surface (ha)"
          style={styles.input}
          value={areaHectares}
          onChangeText={setAreaHectares}
          keyboardType="decimal-pad"
        />
        <TextInput
          placeholder="Culture"
          style={styles.input}
          value={cropName}
          onChangeText={setCropName}
        />
        <TextInput
          placeholder="Période de récolte (ex: Juin - Juillet)"
          style={styles.input}
          value={harvestPeriod}
          onChangeText={setHarvestPeriod}
        />
        <TextInput
          placeholder="Notes"
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Pressable
          onPress={createParcel}
          style={styles.primaryButton}
          disabled={saving}
        >
          <ThemedText style={styles.primaryButtonText}>
            {saving ? "Enregistrement..." : "Ajouter la parcelle"}
          </ThemedText>
        </Pressable>
      </ThemedView>

      {parcels.map((parcel) => (
        <ThemedView key={parcel.id} style={styles.itemCard}>
          <ThemedText type="defaultSemiBold">{parcel.name}</ThemedText>
          <ThemedText>
            {parcel.cropName} • {parcel.areaHectares} ha
          </ThemedText>
          <ThemedText>
            Période: {parcel.harvestPeriod || "Non renseignée"}
          </ThemedText>
          {parcel.notes ? <ThemedText>Notes: {parcel.notes}</ThemedText> : null}

          <Pressable
            onPress={() => confirmDelete(parcel.id)}
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
