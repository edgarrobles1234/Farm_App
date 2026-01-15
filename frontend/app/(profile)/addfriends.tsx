// (profile)/addfriends.tsx
import { StyleSheet, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

// Mock data for friends
const MOCK_USERS = [
  { id: '1', name: 'Abeyah Calpatura', username: '@abeyahc' },
  { id: '2', name: 'Edgar Robles', username: '@edgarrobles' },
  { id: '3', name: 'Sean Griffin', username: '@seangriffin' },
];

export default function AddFriends() {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("Heading back to profile")
    router.back();
  };

  const handleAddFriend = (userId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log('Add friend:', userId);
    setAddedFriends(prev => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
    });
    // Add your friend logic here
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>

        {/* Title */}
        <ThemedText type="title" style={[styles.title, { color: colors.text.primary }]}>
          Find your friends
        </ThemedText>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.input.background, borderColor: colors.border.light, borderWidth: 1 }]}>
            <Ionicons name="search" size={30} color={colors.text.tertiary} style={styles.searchIcon} />
            <TextInput
                style={[styles.searchInput, { color: colors.input.text }]}
                placeholder="Search friends..."
                placeholderTextColor={colors.input.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
        </View>

        {/* Friends List */}
        <FlatList
          data={MOCK_USERS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              {/* Profile Picture */}
              <View style={[styles.profilePic, { backgroundColor: theme.neutral[400] }]} />
              
              {/* User Info */}
              <View style={styles.userInfo}>
                <ThemedText style={[styles.userName, { color: colors.text.primary }]}>
                  {item.name}
                </ThemedText>
                <ThemedText style={[styles.userHandle, { color: colors.text.secondary }]}>
                  {item.username}
                </ThemedText>
              </View>

              {/* Add Friend Button */}
              <TouchableOpacity
                onPress={() => handleAddFriend(item.id)}
                style={[styles.addButton, { backgroundColor: addedFriends.has(item.id)
                    ? theme.brand.darkerOrange
                    : theme.brand.primary, }]}
              >
                <Ionicons name={addedFriends.has(item.id) ? "checkmark" : "person-add"} size={21} color={theme.neutral.white} />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  backButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSizes.h2,
    fontWeight: theme.typography.fontWeights.bold,
    marginBottom: theme.spacing.md,
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
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  userHandle: {
    fontSize: theme.typography.fontSizes.h4,
    marginTop: 2,
    fontFamily: theme.typography.fontFamily,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    gap: 4,
  },
  addButtonText: {
    fontSize: theme.typography.fontSizes.h3,
    fontWeight: theme.typography.fontWeights.bold,
    fontFamily: theme.typography.fontFamily,
  },
});