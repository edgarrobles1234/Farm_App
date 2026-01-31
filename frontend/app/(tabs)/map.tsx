// app/(tabs)/map.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { theme } from "@/constants/theme";
import FarmCard from "@/components/ui/farmcard";
import { Button } from "@/components/ui/button";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { addDistanceAndSort, type FarmWithCoords } from "@/lib/location";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export default function MapTab() {
  const { colors } = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const { coords: userCoords, locationText } = useCurrentLocation();

  // Sample farm data - replace with real data later
  const farms: FarmWithCoords[] = [
    {
      id: 1,
      name: "Sean's Farm",
      rating: 4.9,
      reviews: 209,
      products: 'Sells carrots, strawberries, etc.',
      latitude: 34.0522,
      longitude: -118.2437,
    },
    {
      id: 2,
      name: 'Green Valley Farm',
      rating: 4.9,
      reviews: 209,
      products: 'Sells carrots, strawbe...',
      latitude: 34.0407,
      longitude: -120.2468,
    },
    {
      id: 3,
      name: 'Sunny Acres',
      rating: 4.8,
      reviews: 156,
      products: 'Sells tomatoes, peppers...',
      latitude: 34.0600,
      longitude: -118.2500,
    },
  ];

  const farmsWithDistance = addDistanceAndSort(farms, userCoords);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const handleFarmPress = (farmId: number) => {
    console.log('Farm pressed:', farmId);
    // TODO: Navigate to farm detail screen or show on map
  };

  const handleDirectionPress = (farmId: number) => {
    console.log('Direction pressed for farm:', farmId);
    // TODO: Open maps with directions
  };

  const handleSharePress = (farmId: number) => {
    console.log('Share pressed:', farmId);
    // TODO: Share farm details
  };

  if (!region) return <Text>Loading map…</Text>;

  return (
    <View style={{ flex: 1 }}>
      {/* MAP */}
      <MapView
        style={{ flex: 1 }}
        region={region}
        showsUserLocation
      >
        {/* User location marker */}
        <Marker coordinate={region} title="You are here" />
        
        {/* Farm markers */}
        {farms.map((farm) => (
          <Marker
            key={farm.id}
            coordinate={{
              latitude: farm.latitude,
              longitude: farm.longitude,
            }}
            title={farm.name}
            description={farm.products}
            pinColor={theme.brand.primary}
          />
        ))}
      </MapView>

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
        <Text
          style={[
            styles.searchPlaceholder,
            { color: colors.input.placeholder },
          ]}
        >
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
    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
      Recents
    </Text>

    <View
      style={[
        styles.recentsBox,
        { backgroundColor: colors.card },
      ]}
    />

    {/* FARMS NEAR YOU */}
    <View style={styles.sectionHeader}>
      <Text
        style={[
          styles.sectionTitle,
          { color: colors.text.primary },
        ]}
      >
        Farms Near You
      </Text>
      <Button
      variant="primary"
      onPress={() => console.log('See All')}
      style={styles.seeAllButton}
      >
        See All
      </Button>
    </View>

    <Text style={{ color: colors.text.tertiary, marginTop: 2, marginBottom: 8 }}>
      📍 {locationText}
    </Text>

    {/* Horizontal Farm Cards */}
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
            distance={farm.distanceMi != null ? `${farm.distanceMi.toFixed(1)} mi` : '…'}
            products={farm.products}
            onPress={() => handleFarmPress(farm.id)}
            onDirectionPress={() => handleDirectionPress(farm.id)}
            onSharePress={() => handleSharePress(farm.id)}
          />
        </View>
      ))}
    </ScrollView>

    {/* Add some bottom padding */}
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
