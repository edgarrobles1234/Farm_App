// (tabs)/grocerylist.tsx
import { StyleSheet, TextInput, View, FlatList } from 'react-native';
import React, { useState, useMemo } from 'react';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GroceryListCard } from '@/components/ui/grocerylist/GroceryListCard';
import { mockGroceryLists } from '@/mockdata/GroceryList';

const toTime = (dateStr: string) => {
  if (!dateStr) return 0;
  if (dateStr.toLowerCase() === "today") return Date.now();

  const [m, d, yy] = dateStr.split("/").map(Number);
  if (!m || !d || !yy) return 0;

  const fullYear = yy < 100 ? 2000 + yy : yy;
  return new Date(fullYear, m - 1, d).getTime();
};

export default function GroceryListScreen() {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLists = useMemo(() => {
    if (!searchQuery.trim()) return mockGroceryLists;
    
    return mockGroceryLists.filter(list =>
      list.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background}} edges={['top']}>
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Search Bar */}
        <View style={[
          styles.searchContainer, 
          { 
            backgroundColor: colors.input.background, 
            borderColor: colors.border.light, 
            borderWidth: 1 
          }
        ]}>
          <Ionicons name="search" size={30} color={colors.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.input.text }]}
            placeholder="Search through your grocery lists"
            placeholderTextColor={colors.input.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Grocery Lists */}
        <FlatList
          data={filteredLists}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GroceryListCard list={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
});