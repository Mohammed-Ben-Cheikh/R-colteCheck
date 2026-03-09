import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [parcelCount, setParcelCount] = useState(0);
  const [harvestCount, setHarvestCount] = useState(0);
  const [totalWeightKg, setTotalWeightKg] = useState(0);
  const [lastHarvestDate, setLastHarvestDate] = useState("N/A");

  useEffect(() => {
    if (!user) {
      return;
    }

    const parcelsUnsubscribe = onSnapshot(
      collection(db, "farmers", user.uid, "parcels"),
      (snapshot) => {
        setParcelCount(snapshot.size);
        setLoading(false);
      },
    );

    const harvestsUnsubscribe = onSnapshot(
      collection(db, "farmers", user.uid, "harvests"),
      (snapshot) => {
        const harvests = snapshot.docs.map((entry) => entry.data());
        setHarvestCount(harvests.length);

        const total = harvests.reduce(
          (sum, item) => sum + Number(item.weightKg ?? 0),
          0,
        );
        setTotalWeightKg(total);

        const sortedDates = harvests
          .map((item) => String(item.harvestedAt ?? ""))
          .filter(Boolean)
          .sort()
          .reverse();

        setLastHarvestDate(sortedDates[0] ?? "N/A");
      },
    );

    return () => {
      parcelsUnsubscribe();
      harvestsUnsubscribe();
    };
  }, [user]);

  const greeting = useMemo(() => {
    if (profile?.fullName) {
      return `Bonjour ${profile.fullName}`;
    }
    return "Bonjour";
  }, [profile?.fullName]);

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
        RécolteCheck
      </ThemedText>
      <ThemedText>{greeting}</ThemedText>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Vue d&apos;ensemble</ThemedText>
        <ThemedText>Parcelles enregistrées: {parcelCount}</ThemedText>
        <ThemedText>Récoltes enregistrées: {harvestCount}</ThemedText>
        <ThemedText>
          Production totale: {totalWeightKg.toFixed(2)} kg
        </ThemedText>
        <ThemedText>Dernière récolte: {lastHarvestDate}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">Conseils de suivi</ThemedText>
        <ThemedText>• Ajoutez d&apos;abord vos parcelles.</ThemedText>
        <ThemedText>• Enregistrez chaque récolte par zone.</ThemedText>
        <ThemedText>
          • Vérifiez régulièrement le total de production.
        </ThemedText>
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
});
