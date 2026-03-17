import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from '@/lib/supabase'; // adjust if needed
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { theme } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

import { openDirections } from '@/lib/directions';
import { formatAddress } from '@/lib/address';

type ProduceItem = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  default_sold_by: string;
};

type Farm = {
  id: string;
  name: string;
  products: string | null;
  rating: number | null;
  reviews: number | null;
  latitude: number;
  longitude: number;
  street: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  website?: string | null;
  description?: string | null;
};

type ListingRow = {
  id: string;
  price: number;
  currency: string;
  sold_by: string;
  available: boolean;
  start_date: string | null;
  end_date: string | null;
  farms: Farm;
  produce_varieties: { id: string; name: string } | null;
};

export default function ProduceDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [item, setItem] = useState<ProduceItem | null>(null);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [seasonMonths, setSeasonMonths] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthNames = useMemo(
    () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    []
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      // 1) Produce item
      const { data: itemData, error: itemErr } = await supabase
        .from('produce_items')
        .select('id,name,category,description,default_sold_by')
        .eq('id', id)
        .single();

      if (cancelled) return;

      if (itemErr || !itemData) {
        console.log('Item load error:', itemErr);
        setError('Could not load produce item.');
        setLoading(false);
        return;
      }

      setItem(itemData as ProduceItem);

      // 2) Season months (optional)
      const { data: smData, error: smErr } = await supabase
        .from('produce_item_season_months')
        .select('month')
        .eq('produce_item_id', id);

      if (!cancelled) {
        if (smErr) console.log('Season months error:', smErr);
        setSeasonMonths((smData ?? []).map((r: any) => r.month).sort((a: number, b: number) => a - b));
      }

      // 3) Listings for ANY variety belonging to this produce item
      // Uses explicit relationship names + inner join on produce_varieties
      const { data: listingData, error: listingErr } = await supabase
        .from('farm_listings')
        .select(
          `
          id,
          price,
          currency,
          sold_by,
          available,
          start_date,
          end_date,
          farms:farms!farm_listings_farm_id_fkey (
            id,
            name,
            products,
            rating,
            reviews,
            latitude,
            longitude,
            street,
            city,
            state,
            postal_code,
            country,
            website,
            description
          ),
          produce_varieties:produce_varieties!inner (
            id,
            name,
            produce_item_id
          )
        `
        )
        .eq('available', true)
        .eq('produce_varieties.produce_item_id', id)
        .order('price', { ascending: true });

      if (cancelled) return;

      if (listingErr) {
        console.log('Listing error:', listingErr);
        setError('Could not load farms for this produce.');
        setListings([]);
        setLoading(false);
        return;
      }

      // Normalize embedded objects (sometimes they come back as object|array|null)
      const cleaned: ListingRow[] = (listingData ?? [])
        .map((r: any) => {
          const farm = Array.isArray(r.farms) ? r.farms[0] : r.farms;
          const variety = Array.isArray(r.produce_varieties) ? r.produce_varieties[0] : r.produce_varieties;

          if (!farm || !variety) return null;

          return {
            id: r.id,
            price: r.price,
            currency: r.currency,
            sold_by: r.sold_by,
            available: r.available,
            start_date: r.start_date ?? null,
            end_date: r.end_date ?? null,
            farms: farm,
            produce_varieties: { id: variety.id, name: variety.name },
          } as ListingRow;
        })
        .filter((x): x is ListingRow => x !== null);

      setListings(cleaned);
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDirections = async (farm: Farm) => {
    const destination = formatAddress(farm);
    const finalDest =
      destination.trim().length > 0 ? destination : `${farm.latitude},${farm.longitude}`;

    try {
      await openDirections(finalDest);
    } catch (e) {
      console.log('Could not open directions', e);
    }
  };

  const renderSeasonText = () => {
    if (!seasonMonths.length) return 'Seasonality not set';
    return seasonMonths.map((m) => monthNames[m - 1]).join(' • ');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, { borderColor: colors.border.light }]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text.primary} />
            <ThemedText style={{ color: colors.text.primary }}>Back</ThemedText>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ThemedText style={{ color: colors.text.tertiary }}>Loading…</ThemedText>
        ) : error ? (
          <ThemedText style={{ color: colors.text.tertiary }}>{error}</ThemedText>
        ) : !item ? (
          <ThemedText style={{ color: colors.text.tertiary }}>Not found.</ThemedText>
        ) : (
          <>
            {/* Produce header */}
            <ThemedView style={styles.headerCard}>
              <ThemedText style={[styles.title, { color: colors.text.primary }]}>{item.name}</ThemedText>
              <ThemedText style={{ color: colors.text.tertiary, marginTop: 2 }}>
                {item.category} • Sold by {item.default_sold_by}
              </ThemedText>

              <ThemedText style={{ color: colors.text.tertiary, marginTop: 10 }}>
                {item.description?.trim() ? item.description : 'No description yet.'}
              </ThemedText>

              <ThemedText style={{ color: colors.text.tertiary, marginTop: 10 }}>
                In season: {renderSeasonText()}
              </ThemedText>
            </ThemedView>

            {/* Farms */}
            <ThemedView style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: colors.text.primary }]}>
                Farms that have this
              </ThemedText>

              {listings.length === 0 ? (
                <ThemedText style={{ color: colors.text.tertiary }}>
                  No farms have this listed right now.
                </ThemedText>
              ) : (
                listings.map((l) => (
                  <ThemedView
                    key={l.id}
                    style={[
                      styles.listingCard,
                      { borderColor: colors.border.light, backgroundColor: colors.input.background },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.farmName, { color: colors.text.primary }]}>
                        {l.farms.name}
                      </ThemedText>

                      <ThemedText style={{ color: colors.text.tertiary, marginTop: 2 }}>
                        {l.produce_varieties?.name ? `Variety: ${l.produce_varieties.name} • ` : ''}
                        {l.currency} {Number(l.price).toFixed(2)} / {l.sold_by}
                      </ThemedText>

                      {l.farms.rating != null && (
                        <ThemedText style={{ color: colors.text.tertiary, marginTop: 2 }}>
                          ⭐ {l.farms.rating} ({l.farms.reviews ?? 0})
                        </ThemedText>
                      )}

                      <ThemedText style={{ color: colors.text.tertiary, marginTop: 6 }}>
                        {formatAddress(l.farms)}
                      </ThemedText>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDirections(l.farms)}
                      style={[styles.dirBtn, { borderColor: colors.border.light }]}
                    >
                      <Ionicons name="navigate" size={18} color={colors.text.primary} />
                      <ThemedText style={{ color: colors.text.primary, marginLeft: 6 }}>
                        Directions
                      </ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                ))
              )}
            </ThemedView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: theme.spacing.md },
  topBar: { paddingVertical: theme.spacing.md },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  headerCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  title: {
    fontSize: theme.typography.fontSizes.h2,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
  section: { marginBottom: theme.spacing.lg },
  sectionTitle: {
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
    marginBottom: theme.spacing.sm,
  },
  listingCard: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  farmName: {
    fontSize: theme.typography.fontSizes.h4,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  dirBtn: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
});