// app/(tabs)/create.tsx
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function CreateScreen() {
  const { colors } = useTheme();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const selectedType =
    type === 'recipe'
      ? 'Recipe'
      : type === 'grocery'
        ? 'Grocery List'
        : 'Choose what you want to create';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <ThemedView style={styles.container}>

        {/* Custom header row — mirrors the grocery Stack header */}
        <View style={[styles.header, { borderBottomColor: colors.border.light }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ThemedText type="title" style={{ color: colors.text.primary }}>
          Create
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.text.secondary }]}>
          {selectedType}
        </ThemedText>

      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    marginTop: 8,
  },
});
