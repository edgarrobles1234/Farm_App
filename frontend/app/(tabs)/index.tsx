import { Image } from 'expo-image';
import { ScrollView, StyleSheet, TouchableOpacity, TextInput, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useNavigation } from 'expo-router';
import * as Location from 'expo-location';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import FarmCard from '@/components/ui/farmcard';
import { Ionicons } from '@expo/vector-icons';

type Coords = { latitude: number; longitude: number };

type Farm = {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  products: string;
  latitude: number;
  longitude: number;
};

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

// Haversine distance in miles
function distanceMiles(a: Coords, b: Coords) {
  const R = 3958.7613; // Earth radius in miles
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);

  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * (sinDLon * sinDLon);

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationText, setLocationText] = useState('Getting location…');
  const [userCoords, setUserCoords] = useState<Coords | null>(null);

  // NOTE: Replace these coordinates with real farm coordinates later
  const farms: Farm[] = [
    {
      id: 1,
      name: "Sean's Farm",
      rating: 4.9,
      reviews: 209,
      products: 'Sells carrots, strawberries, etc.',
      latitude: 34.9530,
      longitude: -120.4357,
    },
    {
      id: 2,
      name: 'Green Valley Farm',
      rating: 4.9,
      reviews: 209,
      products: 'Sells carrots, strawbe...',
      latitude: 35.1428,
      longitude: -120.6413,
    },
  ];

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (mounted) setLocationText('Location permission denied');
          return;
        }

        const pos = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = pos.coords;

        if (mounted) {
          setUserCoords({ latitude, longitude });
        }

        const places = await Location.reverseGeocodeAsync({ latitude, longitude });
        const p = places?.[0];

        if (!mounted) return;

        if (p) {
          const pretty = [p.city, p.region].filter(Boolean).join(', ');
          setLocationText(pretty || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } else {
          setLocationText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } catch (e) {
        if (mounted) setLocationText('Could not get location');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const farmsWithDistance = farms
    .map((farm) => {
      const d =
        userCoords
          ? distanceMiles(userCoords, { latitude: farm.latitude, longitude: farm.longitude })
          : null;

      return { ...farm, distanceMi: d };
    })
    .sort((a, b) => (a.distanceMi ?? Infinity) - (b.distanceMi ?? Infinity));

  const handleFarmPress = (farmId: number) => {
    console.log('Farm pressed:', farmId);
    // TODO: Navigate to farm detail screen
  };

  const handleDirectionPress = (farmId: number) => {
    console.log('Direction pressed for farm:', farmId);
    // TODO: Open maps with directions
  };

  const handleSharePress = (farmId: number) => {
    console.log('Share pressed:', farmId);
    // TODO: Share farm details
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: theme.brand.primary }]}
            onPress={() => router.push('/settings')}
          >
            <ThemedText style={styles.aiText}>JS</ThemedText>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <ThemedText type="defaultSemiBold" style={[styles.welcome, { color: colors.text.primary }]}>
              Welcome John Smith!
            </ThemedText>
          </View>
        </ThemedView>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.input.background,
              borderColor: colors.border.light,
              borderWidth: 1,
            },
          ]}
        >
          <Ionicons name="search" size={30} color={colors.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.input.text }]}
            placeholder="Search farms, recipes..."
            placeholderTextColor={colors.input.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Grocery List */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Your Grocery List
          </ThemedText>
          <ThemedView style={[styles.card, styles.groceryCard, { backgroundColor: colors.card }]} />
        </ThemedView>

        {/* Close Farms */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Close Farms Near You
          </ThemedText>

          <ThemedText style={{ color: colors.text.tertiary, marginTop: 2, marginBottom: 8 }}>
            📍 {locationText}
          </ThemedText>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.farmsScroll}>
            {farmsWithDistance.map((farm) => (
              <FarmCard
                key={farm.id}
                name={farm.name}
                rating={farm.rating}
                reviews={farm.reviews}
                distance={
                  farm.distanceMi != null ? `${farm.distanceMi.toFixed(1)} mi` : '…'
                }
                products={farm.products}
                onPress={() => handleFarmPress(farm.id)}
                onDirectionPress={() => handleDirectionPress(farm.id)}
                onSharePress={() => handleSharePress(farm.id)}
              />
            ))}
          </ScrollView>
        </ThemedView>

        {/* Top Recipes */}
        <ThemedView style={[styles.section, { marginBottom: 80 }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Top Recipes of the Week
          </ThemedText>
          <ThemedView style={[styles.card, styles.recipesCard, { backgroundColor: colors.card }]} />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcome: {
    flex: 1,
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  aiText: {
    color: theme.neutral.white,
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSizes.h4,
    fontFamily: theme.typography.fontFamily,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
    marginBottom: theme.spacing.sm,
  },
  card: {
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.md,
  },
  groceryCard: {
    height: 80,
  },
  farmsScroll: {
    marginTop: theme.spacing.md,
    marginLeft: -theme.spacing.md,
    paddingLeft: theme.spacing.md,
  },
  recipesCard: {
    height: 120,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
