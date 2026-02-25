import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { theme } from "@/constants/theme";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/hooks/useTheme";
import { followUser, listFollowing, unfollowUser, type SearchUser } from "@/lib/follows";

export default function FollowingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const accessToken = session?.access_token ?? null;

  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = useMemo(() => searchQuery.trim(), [searchQuery]);

  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  useEffect(() => {
    if (!accessToken) return;

    let isActive = true;
    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const results = await listFollowing(accessToken, normalizedQuery, 200);
        if (!isActive) return;
        setUsers(results);
      } catch (e) {
        if (!isActive) return;
        const message = e instanceof Error ? e.message : "Unable to load following";
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
  }, [accessToken, normalizedQuery]);

  const toggleFollow = async (targetUserId: string) => {
    if (!accessToken) return;
    const current = users.find((u) => u.id === targetUserId);
    const currentlyFollowing = current?.is_following ?? true;

    try {
      if (currentlyFollowing) {
        await unfollowUser(accessToken, targetUserId);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setUsers((prev) => prev.filter((u) => u.id !== targetUserId));
      } else {
        await followUser(accessToken, targetUserId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setUsers((prev) => prev.map((u) => (u.id === targetUserId ? { ...u, is_following: true } : u)));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to update follow";
      Alert.alert("Error", message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>

        <ThemedText type="title" style={[styles.title, { color: colors.text.primary }]}>
          Following
        </ThemedText>

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
            placeholder="Search following..."
            placeholderTextColor={colors.input.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.brand.primary} />
          </View>
        ) : null}

        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <View style={[styles.profilePic, { backgroundColor: theme.neutral[400] }]} />

              <View style={styles.userInfo}>
                <ThemedText style={[styles.userName, { color: colors.text.primary }]}>
                  {item.full_name ?? item.username ?? "Unknown user"}
                </ThemedText>
                <ThemedText style={[styles.userHandle, { color: colors.text.secondary }]}>
                  {item.username ? `@${item.username}` : ""}
                </ThemedText>
              </View>

              <TouchableOpacity
                onPress={() => toggleFollow(item.id)}
                style={[
                  styles.followButton,
                  {
                    backgroundColor: theme.brand.darkerOrange,
                  },
                ]}
              >
                <Ionicons name="checkmark" size={21} color={theme.neutral.white} />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            loading ? null : (
              <ThemedText style={{ color: colors.text.tertiary }}>
                You’re not following anyone yet.
              </ThemedText>
            )
          }
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
    flexDirection: "row",
    alignItems: "center",
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
  loadingContainer: {
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
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
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    gap: 4,
  },
});

