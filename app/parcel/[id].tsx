/**
 * Parcel Details Screen
 *
 * Displays full details of a single parcel with actions:
 * - Edit parcel
 * - Delete parcel
 * - View harvest history
 * - Add a harvest record
 */

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Button, Card, ConfirmDialog, LoadingSpinner } from "@/src/components";
import {
  BorderRadius,
  Colors,
  FontSizes,
  Shadows,
  Spacing,
} from "@/src/constants/theme";
import {
  deleteHarvestsByParcel,
  getHarvestsByParcel,
} from "@/src/services/harvestService";
import { deleteParcel, getParcelById } from "@/src/services/parcelService";
import { Harvest, Parcel } from "@/src/types";
import {
  formatDate,
  formatDateLong,
  formatWeight,
} from "@/src/utils/formatters";

export default function ParcelDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /** Load parcel and its harvests */
  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [p, h] = await Promise.all([
        getParcelById(id),
        getHarvestsByParcel(id),
      ]);
      setParcel(p);
      setHarvests(h);
    } catch (error) {
      console.error("Error loading parcel details:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  /** Handle parcel deletion */
  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      // Delete all associated harvests first, then the parcel
      await deleteHarvestsByParcel(id);
      await deleteParcel(id);
      setShowDeleteDialog(false);
      Alert.alert("Succès", "Parcelle supprimée.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de supprimer la parcelle.");
    } finally {
      setDeleting(false);
    }
  };

  /** Calculate total harvest for this parcel */
  const totalWeight = harvests.reduce((sum, h) => {
    return sum + (h.unit === "tonnes" ? h.weight * 1000 : h.weight);
  }, 0);

  if (loading) return <LoadingSpinner />;

  if (!parcel) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={Colors.textLight}
        />
        <Text style={styles.notFoundText}>Parcelle introuvable</Text>
        <Button
          title="Retour"
          variant="outline"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
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
      >
        {/* Parcel Info Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.iconWrap}>
              <Ionicons name="map" size={28} color={Colors.primary} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.parcelName}>{parcel.name}</Text>
              <Text style={styles.cropType}>{parcel.cropType}</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <DetailItem
              icon="resize-outline"
              label="Superficie"
              value={`${parcel.surface} ha`}
            />
            <DetailItem
              icon="calendar-outline"
              label="Planté le"
              value={formatDateLong(parcel.plantingDate)}
            />
            <DetailItem
              icon="time-outline"
              label="Récolte prévue"
              value={parcel.harvestPeriod || "Non défini"}
            />
            <DetailItem
              icon="leaf-outline"
              label="Récoltes"
              value={`${harvests.length} enregistrement(s)`}
            />
            <DetailItem
              icon="scale-outline"
              label="Total récolté"
              value={
                totalWeight > 0
                  ? `${totalWeight.toLocaleString("fr-FR")} kg`
                  : "0 kg"
              }
            />
          </View>

          {parcel.notes ? (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes :</Text>
              <Text style={styles.notesText}>{parcel.notes}</Text>
            </View>
          ) : null}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Button
            title="Modifier"
            variant="outline"
            onPress={() => router.push(`/parcel/edit/${parcel.id}`)}
            style={styles.actionBtn}
          />
          <Button
            title="Supprimer"
            variant="danger"
            onPress={() => setShowDeleteDialog(true)}
            style={styles.actionBtn}
          />
        </View>

        {/* Harvest Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historique des récoltes</Text>
            <Button
              title="+ Récolte"
              variant="primary"
              onPress={() => router.push(`/harvest/add/${parcel.id}`)}
              style={styles.addHarvestBtn}
            />
          </View>

          {harvests.length === 0 ? (
            <Card>
              <View style={styles.emptyHarvest}>
                <Ionicons
                  name="leaf-outline"
                  size={32}
                  color={Colors.textLight}
                />
                <Text style={styles.emptyText}>Aucune récolte enregistrée</Text>
              </View>
            </Card>
          ) : (
            <>
              {harvests.slice(0, 5).map((harvest) => (
                <Card key={harvest.id} style={styles.harvestCard}>
                  <View style={styles.harvestRow}>
                    <View>
                      <Text style={styles.harvestCrop}>{harvest.crop}</Text>
                      <Text style={styles.harvestDate}>
                        {formatDate(harvest.date)}
                      </Text>
                    </View>
                    <Text style={styles.harvestWeight}>
                      {formatWeight(harvest.weight, harvest.unit)}
                    </Text>
                  </View>
                  {harvest.notes ? (
                    <Text style={styles.harvestNotes}>{harvest.notes}</Text>
                  ) : null}
                </Card>
              ))}
              {harvests.length > 5 && (
                <Button
                  title="Voir tout l'historique"
                  variant="outline"
                  onPress={() => router.push(`/harvest/${parcel.id}`)}
                />
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Supprimer la parcelle"
        message={`Voulez-vous vraiment supprimer "${parcel.name}" et toutes ses récoltes associées ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        loading={deleting}
      />
    </>
  );
}

/** Reusable detail row component */
function DetailItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={detailStyles.item}>
      <Ionicons name={icon} size={16} color={Colors.textSecondary} />
      <View style={detailStyles.texts}>
        <Text style={detailStyles.label}>{label}</Text>
        <Text style={detailStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    width: "50%",
  },
  texts: {
    flex: 1,
  },
  label: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: 2,
  },
});

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
  notFoundText: {
    fontSize: FontSizes.lg,
    color: Colors.textSecondary,
  },
  headerCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  parcelName: {
    fontSize: FontSizes.xl,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  cropType: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  notesSection: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  notesLabel: {
    fontSize: FontSizes.sm,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  notesText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  addHarvestBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
  emptyHarvest: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  harvestCard: {
    marginBottom: Spacing.sm,
  },
  harvestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  harvestWeight: {
    fontSize: FontSizes.md,
    fontWeight: "700",
    color: Colors.primary,
  },
  harvestNotes: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontStyle: "italic",
  },
});
