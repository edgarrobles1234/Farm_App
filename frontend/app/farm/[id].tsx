import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { theme } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useFarms } from '@/hooks/useFarms';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { addDistanceAndSort } from '@/lib/location';
import { formatAddress } from '@/lib/address';
import { openDirections } from '@/lib/directions';
import { getMockFarmProfile } from '@/lib/mock-farms';

function splitProducts(products: string | null | undefined) {
  if (!products?.trim()) return [];

  return products
    .split(/,|•|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function FarmDetailScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const farmId = Number(id);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const tabTranslateX = useRef(new Animated.Value(0)).current;
  const previousTab = useRef<'overview' | 'reviews'>('overview');

  const { data: farms = [], isLoading, error } = useFarms();
  const { coords: userCoords } = useCurrentLocation();

  const farm = useMemo(() => farms.find((item) => item.id === farmId) ?? null, [farms, farmId]);

  const farmWithDistance = useMemo(() => {
    if (!farm) return null;
    return addDistanceAndSort([farm], userCoords)[0] ?? null;
  }, [farm, userCoords]);

  const mockProfile = useMemo(() => getMockFarmProfile(farmId, farm), [farm, farmId]);
  const produceItems = mockProfile.produce.length > 0 ? mockProfile.produce : splitProducts(farm?.products);
  const address = mockProfile.addressOverride ?? (farm ? formatAddress(farm) : '');

  const handleDirections = async () => {
    const hasRealAddress =
      !!farm?.street?.trim() && (!!farm.city?.trim() || !!farm.postal_code?.trim());

    const finalDest = mockProfile.addressOverride
      ? mockProfile.addressOverride
      : hasRealAddress
        ? formatAddress(farm)
        : farm
          ? `${farm.latitude},${farm.longitude}`
          : '';

    if (!finalDest) return;

    try {
      await openDirections(finalDest);
    } catch (e) {
      console.log('Could not open directions', e);
    }
  };

  useEffect(() => {
    const fromValue =
      activeTab === previousTab.current
        ? 0
        : activeTab === 'reviews'
          ? 36
          : -36;

    tabTranslateX.setValue(fromValue);

    Animated.spring(tabTranslateX, {
      toValue: 0,
      useNativeDriver: true,
      damping: 18,
      stiffness: 180,
      mass: 0.9,
    }).start();

    previousTab.current = activeTab;
  }, [activeTab, tabTranslateX]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.hero, { backgroundColor: '#F7E5BF' }]}>
          <View style={styles.heroShapes}>
            <View style={[styles.shape, styles.shapeLarge, { backgroundColor: '#F0C26A' }]} />
            <View style={[styles.shape, styles.shapeSmall, { backgroundColor: '#DCC16C' }]} />
          </View>

          <View style={[styles.heroTopRow, { paddingTop: insets.top + theme.spacing.sm }]}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: 'rgba(255,255,255,0.92)' }]}
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.brand.primary }]}
              onPress={handleDirections}
              activeOpacity={0.88}
            >
              <Ionicons name="navigate" size={18} color={theme.neutral.white} />
            </TouchableOpacity>
          </View>

          {isLoading && !farm ? (
            <View style={styles.heroBody}>
              <ThemedText style={[styles.eyebrow, { color: '#6E7B37' }]}>Farm profile</ThemedText>
              <ThemedText style={[styles.heroTitle, { color: '#2E2A1F' }]}>Loading farm…</ThemedText>
            </View>
          ) : error && !farm ? (
            <View style={styles.heroBody}>
              <ThemedText style={[styles.eyebrow, { color: '#6E7B37' }]}>Farm profile</ThemedText>
              <ThemedText style={[styles.heroTitle, { color: '#2E2A1F' }]}>Temporary farm profile</ThemedText>
              <ThemedText style={[styles.heroSubtitle, { color: '#5A564B' }]}>
                Showing mock content while live farm detail data is not available.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.heroBody}>
              <ThemedText style={[styles.eyebrow, { color: '#6E7B37' }]}>{mockProfile.heroLabel}</ThemedText>
              <ThemedText style={[styles.heroTitle, { color: '#2E2A1F' }]}>
                {farm?.name ?? mockProfile.title}
              </ThemedText>
              <ThemedText style={[styles.heroSubtitle, { color: '#5A564B' }]}>
                {mockProfile.tagline}
              </ThemedText>

              <View style={styles.heroPills}>
                <View style={styles.heroPill}>
                  <Ionicons name="star" size={14} color={theme.brand.red} />
                  <ThemedText style={styles.heroPillText}>
                    {mockProfile.rating.toFixed(1)} average
                  </ThemedText>
                </View>
                <View style={styles.heroPill}>
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color={theme.brand.tertiary} />
                  <ThemedText style={styles.heroPillText}>{mockProfile.reviews} reviews</ThemedText>
                </View>
                {farmWithDistance?.distanceMi != null ? (
                  <View style={styles.heroPill}>
                    <Ionicons name="location-outline" size={14} color={theme.brand.primary} />
                    <ThemedText style={styles.heroPillText}>
                      {farmWithDistance.distanceMi.toFixed(1)} mi away
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>
          )}
        </View>

        {!isLoading || farm ? (
          <View style={styles.sectionGroup}>
            <View
              style={[
                styles.tabRow,
                { backgroundColor: colors.background, borderColor: colors.border.light },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'overview' && { backgroundColor: theme.brand.primary },
                ]}
                onPress={() => setActiveTab('overview')}
                activeOpacity={0.85}
              >
                <ThemedText
                  style={[
                    styles.tabButtonText,
                    { color: activeTab === 'overview' ? theme.neutral.white : colors.text.secondary },
                  ]}
                >
                  Overview
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'reviews' && { backgroundColor: theme.brand.primary },
                ]}
                onPress={() => setActiveTab('reviews')}
                activeOpacity={0.85}
              >
                <ThemedText
                  style={[
                    styles.tabButtonText,
                    { color: activeTab === 'reviews' ? theme.neutral.white : colors.text.secondary },
                  ]}
                >
                  Reviews
                </ThemedText>
              </TouchableOpacity>
            </View>

            <Animated.View style={{ transform: [{ translateX: tabTranslateX }] }}>
              {activeTab === 'overview' ? (
                <>
            <View style={[styles.noticeCard, { backgroundColor: '#FFF7E7', borderColor: '#F2D39B' }]}>
              <Ionicons name="walk-outline" size={22} color="#7A5A18" />
              <View style={styles.noticeCopy}>
                <ThemedText style={[styles.noticeTitle, { color: '#6F4B00' }]}>
                  Visit the farm to buy produce
                </ThemedText>
                <ThemedText style={[styles.noticeBody, { color: '#7A5A18' }]}>
                  {mockProfile.visitNote}
                </ThemedText>
              </View>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: colors.background, borderColor: colors.border.light }]}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
                  What they are selling
                </ThemedText>
                <ThemedText style={[styles.sectionCaption, { color: colors.text.secondary }]}>
                  Current farm listing
                </ThemedText>
              </View>

              {mockProfile.produceListings.length > 0 ? (
                <View style={styles.listingsColumn}>
                  {mockProfile.produceListings.map((item) => (
                    <View
                      key={item.id}
                      style={[styles.produceListingCard, { borderColor: colors.border.light }]}
                    >
                      <View style={[styles.produceThumb, { backgroundColor: item.color }]}>
                        <Ionicons name={item.icon} size={28} color={theme.brand.tertiary} />
                      </View>

                      <View style={styles.produceListingBody}>
                        <View style={styles.produceListingTopRow}>
                          <View style={{ flex: 1 }}>
                            <ThemedText style={[styles.produceListingTitle, { color: colors.text.primary }]}>
                              {item.name}
                            </ThemedText>
                            <ThemedText style={[styles.produceListingMeta, { color: colors.text.secondary }]}>
                              {item.unit}
                            </ThemedText>
                          </View>
                          <View style={[styles.pricePill, { backgroundColor: colors.card }]}>
                            <ThemedText style={[styles.pricePillText, { color: colors.text.primary }]}>
                              {item.price}
                            </ThemedText>
                          </View>
                        </View>

                        <ThemedText style={[styles.produceListingNote, { color: colors.text.secondary }]}>
                          {item.note}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <ThemedText style={[styles.emptyText, { color: colors.text.secondary }]}>
                  This farm has not added a produce list yet.
                </ThemedText>
              )}
            </View>

            <View style={[styles.sectionCard, { backgroundColor: colors.background, borderColor: colors.border.light }]}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
                  Location
                </ThemedText>
                <ThemedText style={[styles.sectionCaption, { color: colors.text.secondary }]}>
                  In-person pickup
                </ThemedText>
              </View>

              <View style={styles.locationRow}>
                <View style={[styles.locationBadge, { backgroundColor: colors.card }]}>
                  <Ionicons name="location" size={16} color={theme.brand.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.locationTitle, { color: colors.text.primary }]}>
                    {address.trim().length
                      ? address
                      : farm
                        ? `${farm.latitude}, ${farm.longitude}`
                        : 'Location shared on the farm page'}
                  </ThemedText>
                  <ThemedText style={[styles.locationBody, { color: colors.text.secondary }]}>
                    {mockProfile.locationNote}
                  </ThemedText>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryAction, { backgroundColor: theme.brand.primary }]}
                onPress={handleDirections}
                activeOpacity={0.88}
              >
                <Ionicons name="navigate" size={18} color={theme.neutral.white} />
                <ThemedText style={styles.primaryActionText}>Get Directions</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.metricRow}>
              <View style={[styles.metricCard, { backgroundColor: colors.background, borderColor: colors.border.light }]}>
                <ThemedText style={[styles.metricValue, { color: colors.text.primary }]}>
                  {mockProfile.rating.toFixed(1)}
                </ThemedText>
                <ThemedText style={[styles.metricLabel, { color: colors.text.secondary }]}>
                  average rating
                </ThemedText>
              </View>

              <View style={[styles.metricCard, { backgroundColor: colors.background, borderColor: colors.border.light }]}>
                <ThemedText style={[styles.metricValue, { color: colors.text.primary }]}>
                  {mockProfile.reviews}
                </ThemedText>
                <ThemedText style={[styles.metricLabel, { color: colors.text.secondary }]}>
                  total reviews
                </ThemedText>
              </View>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: colors.background, borderColor: colors.border.light, marginTop: theme.spacing.md }]}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
                  What shoppers are saying
                </ThemedText>
                <ThemedText style={[styles.sectionCaption, { color: colors.text.secondary }]}>
                  Snapshot
                </ThemedText>
              </View>

              <View style={styles.reviewSummaryRow}>
                <View style={[styles.reviewCircle, { backgroundColor: colors.card }]}>
                  <ThemedText style={[styles.reviewCircleValue, { color: colors.text.primary }]}>
                    {mockProfile.rating.toFixed(1)}
                  </ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.reviewHeadline, { color: colors.text.primary }]}>
                    {mockProfile.reviewHeadline}
                  </ThemedText>
                  <ThemedText style={[styles.reviewBody, { color: colors.text.secondary }]}>
                    {mockProfile.reviewBody}
                  </ThemedText>
                </View>
              </View>
            </View>
                </>
              ) : (
                <>
                <View style={[styles.sectionCard, { backgroundColor: colors.background, borderColor: colors.border.light }]}>
                  <View style={styles.reviewSectionHeader}>
                    <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
                      Reviews
                    </ThemedText>
                    <ThemedText style={[styles.reviewSectionCaption, { color: colors.text.secondary }]}>
                      Ratings and user input
                    </ThemedText>
                  </View>

                  <View style={styles.reviewHeaderRow}>
                    <View style={[styles.reviewCircle, { backgroundColor: colors.card }]}>
                      <ThemedText style={[styles.reviewCircleValue, { color: colors.text.primary }]}>
                        {mockProfile.rating.toFixed(1)}
                      </ThemedText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.reviewHeadline, { color: colors.text.primary }]}>
                        {mockProfile.reviews} reviews from local shoppers
                      </ThemedText>
                      <ThemedText style={[styles.reviewBody, { color: colors.text.secondary }]}>
                        See how other users rated the visit, produce quality, and the overall in-person experience.
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <View style={styles.reviewList}>
                  {mockProfile.reviewEntries.map((entry) => (
                    <View
                      key={entry.id}
                      style={[styles.reviewCard, { backgroundColor: colors.background, borderColor: colors.border.light }]}
                    >
                      <View style={styles.reviewCardHeader}>
                        <View>
                          <ThemedText style={[styles.reviewAuthor, { color: colors.text.primary }]}>
                            {entry.author}
                          </ThemedText>
                          <ThemedText style={[styles.reviewDate, { color: colors.text.secondary }]}>
                            {entry.date}
                          </ThemedText>
                        </View>
                        <View style={[styles.reviewScorePill, { backgroundColor: colors.card }]}>
                          <Ionicons name="star" size={12} color={theme.brand.red} />
                          <ThemedText style={[styles.reviewScoreText, { color: colors.text.primary }]}>
                            {entry.rating.toFixed(1)}
                          </ThemedText>
                        </View>
                      </View>

                      <ThemedText style={[styles.reviewCardTitle, { color: colors.text.primary }]}>
                        {entry.title}
                      </ThemedText>
                      <ThemedText style={[styles.reviewCardBody, { color: colors.text.secondary }]}>
                        {entry.body}
                      </ThemedText>
                    </View>
                  ))}
                </View>
                </>
              )}
            </Animated.View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
  },
  hero: {
    minHeight: 320,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    overflow: 'hidden',
    marginHorizontal: -theme.spacing.lg,
  },
  heroShapes: {
    ...StyleSheet.absoluteFillObject,
  },
  shape: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.5,
  },
  shapeLarge: {
    width: 240,
    height: 240,
    right: -60,
    top: 30,
  },
  shapeSmall: {
    width: 140,
    height: 140,
    left: -30,
    bottom: 10,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  eyebrow: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
    maxWidth: '90%',
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: theme.typography.fontFamily,
    maxWidth: '92%',
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  heroPillText: {
    color: '#3F3A2D',
    fontSize: 13,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  sectionGroup: {
    marginTop: -theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  tabRow: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    padding: 6,
    flexDirection: 'row',
    gap: 6,
  },
  tabButton: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  noticeCopy: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  noticeBody: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.h2,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
    flex: 1,
  },
  sectionCaption: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily,
  },
  listingsColumn: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  produceListingCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  produceThumb: {
    width: 84,
    height: 84,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  produceListingBody: {
    flex: 1,
  },
  produceListingTopRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'flex-start',
  },
  produceListingTitle: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  produceListingMeta: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: theme.typography.fontFamily,
  },
  pricePill: {
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pricePillText: {
    fontSize: 14,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  produceListingNote: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  locationBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  locationBody: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily,
  },
  primaryAction: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  primaryActionText: {
    color: theme.neutral.white,
    fontSize: 15,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  metricRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    padding: theme.spacing.md,
    minHeight: 100,
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
    includeFontPadding: false,
  },
  metricLabel: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: theme.typography.fontFamily,
  },
  reviewSummaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  reviewSectionHeader: {
    marginBottom: theme.spacing.md,
  },
  reviewSectionCaption: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily,
  },
  reviewCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewCircleValue: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  reviewHeadline: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  reviewBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily,
  },
  reviewList: {
    paddingTop: theme.spacing.xs,
    gap: theme.spacing.md,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: theme.spacing.lg,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  reviewAuthor: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  reviewDate: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: theme.typography.fontFamily,
  },
  reviewScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  reviewScoreText: {
    fontSize: 13,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  reviewCardTitle: {
    marginTop: theme.spacing.sm,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  reviewCardBody: {
    marginTop: theme.spacing.sm,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: theme.typography.fontFamily,
  },
});
