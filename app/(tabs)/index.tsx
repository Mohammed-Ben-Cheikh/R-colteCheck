/**
 * Dashboard Screen (Home Tab)
 *
 * Shows a summary of the farmer's data:
 * - Welcome message
 * - Stats: total parcels, total harvests, total weight
 * - Recent harvests
 * - Quick action buttons
 */

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button, Card, LoadingSpinner, StatCard } from "@/src/components";
import { Colors, FontSizes, Spacing } from "@/src/constants/theme";
import { useAuth } from "@/src/context";
import { getHarvestsByUser } from "@/src/services/harvestService";
import { getParcelsByUser } from "@/src/services/parcelService";
import { Harvest, Parcel } from "@/src/types";
import { formatDate, formatWeight } from "@/src/utils/formatters";

export default function DashboardScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /** Load dashboard data from Firestore */
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [p, h] = await Promise.all([
        getParcelsByUser(user.uid),
        getHarvestsByUser(user.uid),
      ]);
      setParcels(p);
      setHarvests(h);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Reload every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  /** Pull-to-refresh handler */
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  /** Calculate total harvest weight in kg */
  const totalWeight = harvests.reduce((sum, h) => {
    return sum + (h.unit === "tonnes" ? h.weight * 1000 : h.weight);
  }, 0);

  const recentHarvests = harvests.slice(0, 5);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
        />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>
          Bonjour, {profile?.name || "Agriculteur"} 👋
        </Text>
        <Text style={styles.welcomeSubtext}>
          Voici le résumé de votre exploitation
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard
          icon="map-outline"
          label="Parcelles"
          value={parcels.length}
          color={Colors.primary}
          onPress={() => router.push("/(tabs)/parcels")}
        />
        <View style={{ width: Spacing.sm }} />
        <StatCard
          icon="leaf-outline"
          label="Récoltes"
          value={harvests.length}
          color={Colors.accent}
        />
        <View style={{ width: Spacing.sm }} />
        <StatCard
          icon="scale-outline"
          label="Total (kg)"
          value={totalWeight > 0 ? totalWeight.toLocaleString("fr-FR") : "0"}
          color={Colors.info}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsRow}>
          <Button
            title="+ Parcelle"
            variant="primary"
            onPress={() => router.push("/parcel/add")}
            style={styles.actionButton}
          />
          <View style={{ width: Spacing.sm }} />
          <Button
            title="Mes parcelles"
            variant="outline"
            onPress={() => router.push("/(tabs)/parcels")}
            style={styles.actionButton}
          />
        </View>
      </View>

      {/* Recent Harvests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Récoltes récentes</Text>
        {recentHarvests.length === 0 ? (
          <Card>
            <View style={styles.emptyRecent}>
              <Ionicons
                name="leaf-outline"
                size={32}
                color={Colors.textLight}
              />
              <Text style={styles.emptyText}>Aucune récolte enregistrée</Text>
              <Text style={styles.emptySubtext}>
                Ajoutez des récoltes depuis vos parcelles
              </Text>
            </View>
          </Card>
        ) : (
          recentHarvests.map((harvest) => {
            const parcel = parcels.find((p) => p.id === harvest.parcelId);
            return (
              <Card key={harvest.id} style={styles.harvestCard}>
                <View style={styles.harvestRow}>
                  <View style={styles.harvestIconWrap}>
                    <Ionicons name="leaf" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.harvestInfo}>
                    <Text style={styles.harvestCrop}>{harvest.crop}</Text>
                    <Text style={styles.harvestParcel}>
                      {parcel?.name || "Parcelle inconnue"} •{" "}
                      {formatDate(harvest.date)}
                    </Text>
                  </View>
                  <Text style={styles.harvestWeight}>
                    {formatWeight(harvest.weight, harvest.unit)}
                  </Text>
                </View>
              </Card>
            );
          })
        )}
      </View>
    </ScrollView>
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
  welcomeSection: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  welcomeSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  actionsRow: {
    flexDirection: "row",
  },
  actionButton: {
    flex: 1,
  },
  emptyRecent: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textLight,
    marginTop: Spacing.xs,
  },
  harvestCard: {
    marginBottom: Spacing.sm,
  },
  harvestRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  harvestIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  harvestInfo: {
    flex: 1,
  },
  harvestCrop: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  harvestParcel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  harvestWeight: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: Colors.primary,
  },
});
