// (profile)/addfriends.tsx
import { StyleSheet, View, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { supabase } from '@/lib/supabase';
import { followUser, listFollowingIds, unfollowUser } from '@/lib/follows';
import { useAuth } from '@/context/auth-context';

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export default function AddFriends() {
  const { colors } = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const userId = session?.user.id ?? null;

  const normalizedQuery = useMemo(() => searchQuery.trim(), [searchQuery]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("Heading back to profile")
    router.back();
  };

  useEffect(() => {
    if (!userId) return;

    let isActive = true;
    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const profileQuery = supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .neq("id", userId)
          .limit(50);

        const filteredQuery = normalizedQuery
          ? profileQuery.or(`username.ilike.%${normalizedQuery}%,full_name.ilike.%${normalizedQuery}%`)
          : profileQuery;

        const [{ data: profileData, error: profilesError }, newFollowingIds] = await Promise.all([
          filteredQuery,
          listFollowingIds(userId),
        ]);

        if (profilesError) throw profilesError;

        if (!isActive) return;
        setProfiles((profileData ?? []) as ProfileRow[]);
        setFollowingIds(newFollowingIds);
      } catch (e) {
        if (!isActive) return;
        const message = e instanceof Error ? e.message : "Unable to load users";
        Alert.alert("Error", message);
      } finally {
        if (!isActive) return;
        setLoading(false);
      }
    }, 250);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [normalizedQuery, userId]);

  const toggleFollow = async (targetUserId: string) => {
    if (!userId) return;
    const currentlyFollowing = followingIds.has(targetUserId);

    try {
      if (currentlyFollowing) {
        await unfollowUser(userId, targetUserId);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(targetUserId);
          return next;
        });
      } else {
        await followUser(userId, targetUserId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setFollowingIds((prev) => new Set(prev).add(targetUserId));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to update follow";
      Alert.alert("Error", message);
    }
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.brand.primary} />
          </View>
        ) : null}
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              {/* Profile Picture */}
              <View style={[styles.profilePic, { backgroundColor: theme.neutral[400] }]} />
              
              {/* User Info */}
              <View style={styles.userInfo}>
                <ThemedText style={[styles.userName, { color: colors.text.primary }]}>
                  {item.full_name ?? item.username ?? "Unknown user"}
                </ThemedText>
                <ThemedText style={[styles.userHandle, { color: colors.text.secondary }]}>
                  {item.username ? `@${item.username}` : ""}
                </ThemedText>
              </View>

              {/* Add Friend Button */}
              <TouchableOpacity
                onPress={() => toggleFollow(item.id)}
                style={[
                  styles.addButton,
                  {
                    backgroundColor: followingIds.has(item.id)
                      ? theme.brand.darkerOrange
                      : theme.brand.primary,
                  },
                ]}
              >
                <Ionicons
                  name={followingIds.has(item.id) ? "checkmark" : "person-add"}
                  size={21}
                  color={theme.neutral.white}
                />
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
  loadingContainer: {
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
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
