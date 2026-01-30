import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { theme } from "@/constants/theme";

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

  /* -----------------------------
     Location
  ------------------------------*/
  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();
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

  if (!region) return <Text>Loading map…</Text>;

  return (
    <View style={{ flex: 1 }}>
      {/* MAP */}
      <MapView
        style={{ flex: 1 }}
        region={region}
        showsUserLocation
      >
        <Marker coordinate={region} title="You are here" />
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
        snapPoints={["5%", "60%", "80%"]}
        index={0}
        backgroundStyle={{ backgroundColor: colors.background }}
        handleIndicatorStyle={{ backgroundColor: colors.border.light }}
      >
        <BottomSheetView style={styles.sheetContent}>
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
            <Text style={{ color: colors.text.primary }}>
              See All
            </Text>
          </View>

          <View style={styles.farmsRow}>
            <View style={[styles.card, { backgroundColor: colors.card }]} />
            <View style={[styles.card, { backgroundColor: colors.card }]} />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

/* -----------------------------
   Styles (Home-consistent)
------------------------------*/
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
    marginBottom: theme.spacing.sm,
  },
  recentsBox: {
    height: 80,
    borderRadius: 30,
    marginBottom: theme.spacing.lg,
  },
  farmsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  card: {
    flex: 1,
    height: 140,
    borderRadius: theme.borderRadius.lg,
  },
});
