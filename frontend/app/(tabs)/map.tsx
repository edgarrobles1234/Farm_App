// app/(tabs)/map.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import MapView, { Marker } from "react-native-maps";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { theme } from "@/constants/theme";
import FarmCard from "@/components/ui/farmcard";
import { Button } from "@/components/ui/button";

import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { addDistanceAndSort } from "@/lib/location";
import { useFarms } from "@/hooks/useFarms";

import { openDirections } from "@/lib/directions";
import { formatAddress } from "@/lib/address";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export default function MapTab() {
  const { colors } = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<number | null>(null);

  const { coords: userCoords, locationText } = useCurrentLocation();
  const { data: farms = [], isLoading: farmsLoading, error: farmsError } = useFarms();

  const farmsWithDistance = useMemo(
    () => addDistanceAndSort(farms, userCoords),
    [farms, userCoords]
  );

  // Choose a fallback center if user location isn't available yet
  const fallbackCenter = useMemo(() => {
    if (userCoords) return userCoords;
    if (farms.length > 0) return { latitude: farms[0].latitude, longitude: farms[0].longitude };
    // absolute fallback if nothing loaded yet
    return { latitude: 34.0522, longitude: -118.2437 };
  }, [userCoords, farms]);

  // Initialize / update region based on user or farms
  useEffect(() => {
    // don't override if user has focused a farm
    if (selectedFarmId != null) return;

    setRegion({
      latitude: fallbackCenter.latitude,
      longitude: fallbackCenter.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    });
  }, [fallbackCenter, selectedFarmId]);

  const focusFarm = (farmId: number) => {
    const farm = farms.find((f) => f.id === farmId);
    if (!farm) return;

    setSelectedFarmId(farmId);

    const next: Region = {
      latitude: farm.latitude,
      longitude: farm.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };

    setRegion(next);
    mapRef.current?.animateToRegion(next, 600);
    sheetRef.current?.snapToIndex(1);
  };

  const recenterOnUser = () => {
    if (!userCoords) return;

    const next: Region = {
      latitude: userCoords.latitude,
      longitude: userCoords.longitude,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    };

    setSelectedFarmId(null);
    setRegion(next);
    mapRef.current?.animateToRegion(next, 600);
  };

  const handleFarmPress = (farmId: number) => {
    console.log("Farm pressed:", farmId);
    focusFarm(farmId);
  };

  const handleDirectionPress = async (farmId: number) => {
    const farm = farms.find((f) => f.id === farmId);
    if (!farm) return;

    const hasRealAddress =
      !!farm.street?.trim() && (!!farm.city?.trim() || !!farm.postal_code?.trim());

    const finalDest = hasRealAddress
      ? formatAddress(farm)
      : `${farm.latitude},${farm.longitude}`;

    try {
      await openDirections(finalDest);
    } catch (e) {
      console.log("Could not open directions", e);
    }
  };

  const handleSharePress = (farmId: number) => {
    console.log("Share pressed:", farmId);
    // TODO: Share farm details
  };

  if (!region) return <Text>Loading map…</Text>;

  return (
    <View style={{ flex: 1 }}>
      {/* MAP */}
      <MapView ref={mapRef} style={{ flex: 1 }} region={region} showsUserLocation>
        {/* Farm markers */}
        {farms.map((farm) => (
          <Marker
            key={farm.id}
            coordinate={{ latitude: farm.latitude, longitude: farm.longitude }}
            title={farm.name}
            description={
              formatAddress(farm).trim().length > 0
                ? formatAddress(farm)
                : (farm.products ?? "")
            }
            pinColor={farm.id === selectedFarmId ? theme.brand.primary : undefined}
            onPress={() => focusFarm(farm.id)}
          />
        ))}
      </MapView>

      {/* RECENTER BUTTON */}
      <Pressable
        style={[
          styles.recenterBtn,
          { backgroundColor: colors.card, borderColor: colors.border.light },
        ]}
        onPress={recenterOnUser}
      >
        <Ionicons name="locate" size={22} color={colors.text.primary} />
      </Pressable>

      {/* FLOATING SEARCH BAR */}
      <Pressable
        style={[
          styles.floatingSearch,
          {
            backgroundColor: colors.input.background,
            borderColor: colors.border.light,
          },
        ]}
        onPress={() => sheetRef.current?.snapToIndex(1)}
      >
        <Ionicons
          name="search"
          size={30}
          color={colors.text.tertiary}
          style={styles.searchIcon}
        />
        <Text style={[styles.searchPlaceholder, { color: colors.input.placeholder }]}>
          Search farms, recipes…
        </Text>
      </Pressable>

      {/* BOTTOM SHEET */}
      <BottomSheet
        ref={sheetRef}
        snapPoints={["5%", "60%", "85%"]}
        index={0}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{ backgroundColor: colors.border.light }}
      >
        <BottomSheetScrollView style={styles.sheetContent}>
          {/* RECENTS */}
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Recents</Text>
          <View style={[styles.recentsBox, { backgroundColor: colors.card }]} />

          {/* FARMS NEAR YOU */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Farms Near You
            </Text>
            <Button
              variant="primary"
              onPress={() => console.log("See All")}
              style={styles.seeAllButton}
            >
              See All
            </Button>
          </View>

          <Text style={{ color: colors.text.tertiary, marginTop: 2, marginBottom: 8 }}>
            📍 {locationText}
          </Text>

          {/* Loading / Error states */}
          {farmsLoading ? (
            <Text style={{ color: colors.text.tertiary }}>Loading farms…</Text>
          ) : farmsError ? (
            <Text style={{ color: colors.text.tertiary }}>Could not load farms.</Text>
          ) : farmsWithDistance.length === 0 ? (
            <Text style={{ color: colors.text.tertiary }}>No farms available yet.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.farmsScroll}
              contentContainerStyle={{ gap: theme.spacing.md, paddingRight: theme.spacing.md }}
            >
              {farmsWithDistance.map((farm) => (
                <View key={farm.id} style={{ width: 300 }}>
                  <FarmCard
                    name={farm.name}
                    rating={farm.rating}
                    reviews={farm.reviews}
                    distance={farm.distanceMi != null ? `${farm.distanceMi.toFixed(1)} mi` : "…"}
                    products={farm.products}
                    onPress={() => handleFarmPress(farm.id)}
                    onDirectionPress={() => handleDirectionPress(farm.id)}
                    onSharePress={() => handleSharePress(farm.id)}
                  />
                </View>
              ))}
            </ScrollView>
          )}

          <View style={{ height: 40 }} />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingSearch: {
    position: "absolute",
    top: 60,
    left: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    zIndex: 20,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchPlaceholder: {
    fontSize: theme.typography.fontSizes.h4,
    fontFamily: theme.typography.fontFamily,
  },
  recenterBtn: {
    position: "absolute",
    right: theme.spacing.md,
    top: 130,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    zIndex: 21,
  },
  sheetContent: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
    marginBottom: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.lg,
  },
  recentsBox: {
    height: 80,
    borderRadius: 30,
  },
  farmsScroll: {
    marginTop: theme.spacing.sm,
    marginLeft: -theme.spacing.md,
    paddingLeft: theme.spacing.md,
  },
  seeAllButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
});
