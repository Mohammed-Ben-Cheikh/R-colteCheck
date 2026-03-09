/**
 * Harvest History Screen
 *
 * Full history of all harvest records for a specific parcel.
 * Allows deleting individual harvest records.
 */

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  LoadingSpinner,
} from "@/src/components";
import { Colors, FontSizes, Spacing } from "@/src/constants/theme";
import {
  deleteHarvest,
  getHarvestsByParcel,
} from "@/src/services/harvestService";
import { getParcelById } from "@/src/services/parcelService";
import { Harvest, Parcel } from "@/src/types";
import { formatDate, formatWeight } from "@/src/utils/formatters";

export default function HarvestHistoryScreen() {
  const { parcelId } = useLocalSearchParams<{ parcelId: string }>();

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Harvest | null>(null);
  const [deleting, setDeleting] = useState(false);

  /** Load harvest history */
  const loadData = useCallback(async () => {
    if (!parcelId) return;
    try {
      const [p, h] = await Promise.all([
        getParcelById(parcelId),
        getHarvestsByParcel(parcelId),
      ]);
      setParcel(p);
      setHarvests(h);
    } catch (error) {
      console.error("Error loading harvests:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [parcelId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  /** Delete a harvest record */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteHarvest(deleteTarget.id);
      setDeleteTarget(null);
      loadData();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de supprimer la récolte.");
    } finally {
      setDeleting(false);
    }
  };

  /** Render a single harvest item */
  const renderHarvest = ({ item }: { item: Harvest }) => (
    <Card style={styles.harvestCard}>
      <View style={styles.harvestRow}>
        <View style={styles.harvestIconWrap}>
          <Ionicons name="leaf" size={20} color={Colors.primary} />
        </View>
        <View style={styles.harvestInfo}>
          <Text style={styles.harvestCrop}>{item.crop}</Text>
          <Text style={styles.harvestDate}>{formatDate(item.date)}</Text>
          {item.notes ? (
            <Text style={styles.harvestNotes}>{item.notes}</Text>
          ) : null}
        </View>
        <View style={styles.harvestRight}>
          <Text style={styles.harvestWeight}>
            {formatWeight(item.weight, item.unit)}
          </Text>
          <Button
            title="Supprimer"
            variant="danger"
            onPress={() => setDeleteTarget(item)}
            style={styles.deleteBtn}
            textStyle={styles.deleteBtnText}
          />
        </View>
      </View>
    </Card>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      {/* Parcel info header */}
      {parcel && (
        <View style={styles.headerBar}>
          <Ionicons name="map" size={18} color={Colors.primary} />
          <Text style={styles.headerText}>{parcel.name}</Text>
          <Text style={styles.headerCount}>{harvests.length} récolte(s)</Text>
        </View>
      )}

      <FlatList
        data={harvests}
        keyExtractor={(item) => item.id}
        renderItem={renderHarvest}
        contentContainerStyle={[
          styles.listContent,
          harvests.length === 0 && styles.emptyList,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="leaf-outline"
            title="Aucune récolte"
            description="Ajoutez votre première récolte pour cette parcelle"
          />
        }
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={!!deleteTarget}
        title="Supprimer la récolte"
        message={`Voulez-vous supprimer cette récolte de ${deleteTarget?.crop || ""} (${deleteTarget ? formatWeight(deleteTarget.weight, deleteTarget.unit) : ""}) ?`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary + "10",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerText: {
    fontSize: FontSizes.md,
    fontWeight: "600",
    color: Colors.primary,
    flex: 1,
  },
  headerCount: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  emptyList: {
    flex: 1,
  },
  harvestCard: {
    marginBottom: Spacing.sm,
  },
  harvestRow: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  harvestDate: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  harvestNotes: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontStyle: "italic",
  },
  harvestRight: {
    alignItems: "flex-end",
    gap: Spacing.xs,
  },
  harvestWeight: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: Colors.primary,
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    minHeight: 28,
  },
  deleteBtnText: {
    fontSize: FontSizes.xs,
  },
});
