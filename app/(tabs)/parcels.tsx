/**
 * Parcels List Screen
 *
 * Displays all parcels belonging to the authenticated farmer.
 * Provides navigation to parcel details and add new parcel.
 */

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Card, EmptyState, LoadingSpinner } from "@/src/components";
import { Colors, FontSizes, Spacing } from "@/src/constants/theme";
import { useAuth } from "@/src/context";
import { getParcelsByUser } from "@/src/services/parcelService";
import { Parcel } from "@/src/types";
import { formatDate } from "@/src/utils/formatters";

export default function ParcelsListScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /** Load parcels from Firestore */
  const loadParcels = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getParcelsByUser(user.uid);
      setParcels(data);
    } catch (error) {
      console.error("Error loading parcels:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadParcels();
    }, [loadParcels]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadParcels();
  };

  /** Render a single parcel card */
  const renderParcel = ({ item }: { item: Parcel }) => (
    <Card
      onPress={() => router.push(`/parcel/${item.id}`)}
      style={styles.parcelCard}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name="map" size={22} color={Colors.primary} />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.parcelName}>{item.name}</Text>
          <Text style={styles.parcelCrop}>{item.cropType}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons
            name="resize-outline"
            size={14}
            color={Colors.textSecondary}
          />
          <Text style={styles.detailText}>{item.surface} ha</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={Colors.textSecondary}
          />
          <Text style={styles.detailText}>
            Planté le {formatDate(item.plantingDate)}
          </Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={parcels}
        keyExtractor={(item) => item.id}
        renderItem={renderParcel}
        contentContainerStyle={[
          styles.listContent,
          parcels.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="map-outline"
            title="Aucune parcelle"
            description="Créez votre première parcelle pour commencer"
          />
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/parcel/add")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 80,
  },
  emptyList: {
    flex: 1,
  },
  parcelCard: {
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  cardHeaderText: {
    flex: 1,
  },
  parcelName: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  parcelCrop: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cardDetails: {
    flexDirection: "row",
    gap: Spacing.md,
    paddingLeft: 56,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
});
