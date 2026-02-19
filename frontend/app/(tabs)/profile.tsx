import { StyleSheet, View, ScrollView, Alert } from "react-native";
import React, { useCallback, useState } from "react";
import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/useTheme";
import { theme } from "@/constants/theme";
import { Button } from "@/components/ui/button";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/context/auth-context";
import { getMe, type ProfileRow } from "@/lib/follows";
import { useFocusEffect } from "@react-navigation/native";
import { RecipeCard } from '@/components/ui/recipes/recipecard';
import { recipes } from "@/lib/recipes";

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const accessToken = session?.access_token ?? null;
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(false);

  const handleAddFriends = () => {
    console.log("Going to Find People screen");
    router.navigate("/(profile)/addfriends");
  };

  useFocusEffect(
    useCallback(() => {
      if (!accessToken) return;
      let isActive = true;
      setLoading(true);

      (async () => {
        try {
          const me = await getMe(accessToken);
          if (!isActive) return;

          setProfile(me.profile);
          setCounts(me.counts);
        } catch (e) {
          if (!isActive) return;
          const message =
            e instanceof Error ? e.message : "Unable to load profile";
          Alert.alert("Error", message);
        } finally {
          if (!isActive) return;
          setLoading(false);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [accessToken]),
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["bottom"]}
    >
      <ScrollView style={styles.container}>
        {/* Header Background */}
        <View
          style={[
            styles.headerBackground,
            { backgroundColor: theme.brand.light },
          ]}
        />

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Image */}
          <View
            style={[
              styles.profileImageContainer,
              { backgroundColor: colors.background },
            ]}
          >
            <View
              style={[
                styles.profileImage,
                { backgroundColor: theme.neutral[400] },
              ]}
            >
              {/* Placeholder for profile image */}
            </View>
          </View>

          {/* Stats and Button Section */}
        <View style={styles.userFollowSection}>
            {/* Left side: Name, Username, and Description */}
            <View style={styles.leftSection}>
              {/* Name and Username */}
              <View style={styles.userInfo}>
                <ThemedText type="title" style={styles.userName}>
                  {profile?.full_name ?? profile?.username ?? "Your profile"}
                </ThemedText>
                <ThemedText
                  style={[styles.username, { color: colors.text.secondary }]}
                >
                  {profile?.username ? `@${profile.username}` : ""}
                </ThemedText>
              </View>

              {/* Description */}
              <View style={styles.descriptionContainer}>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.descriptionTitle}
                >
                  Description
                </ThemedText>
                <ThemedText
                  style={[
                    styles.descriptionText,
                    { color: colors.text.secondary },
                  ]}
                >
                  {loading
                    ? "Loading..."
                    : "Update your profile details in Settings."}
                </ThemedText>
              </View>
            </View>

            {/* Right side: Stats and Button */}
            <View style={styles.statsButtonSection}>
              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statNumber}>
                    {counts.followers}
                  </ThemedText>
                  <ThemedText
                    style={[styles.statLabel, { color: colors.text.secondary }]}
                  >
                    Followers
                  </ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statNumber}>
                    {counts.following}
                  </ThemedText>
                  <ThemedText
                    style={[styles.statLabel, { color: colors.text.secondary }]}
                  >
                    Following
                  </ThemedText>
                </View>
              </View>

            {/* Find People Button */}
            <Button
              variant="primary"
              onPress={handleAddFriends}
              style={styles.addFriendsButton}
              disabled={loading}
            >
              {loading ? "Loading..." : "Find People"}
            </Button>
            </View>
          </View>
        </View>

        {/* My Recipes Section */}
        <View style={styles.recipesHeader}>
          <ThemedText type="title" style={styles.recipesTitle}>
            My Recipes
          </ThemedText>
          <Button
            variant="primary"
            onPress={() => console.log("See All")}
            style={styles.seeAllButton}
          >
            See All
          </Button>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.recipesScroll}
          contentContainerStyle={styles.recipesScrollContent}
          pagingEnabled={false}
        >
          {recipes.slice(0, 4).map((recipe) => (
            <RecipeCard
              key={recipe.id}
              {...recipe}
              onPress={() => {
                console.log('Recipe pressed:', recipe.id);
                // Navigate to recipe detail
              }}
              onEditPress={() => {
                console.log('Edit recipe:', recipe.id);
                // Navigate to recipe edit
              }}
            />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  userFollowSection: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
  container: {
    flex: 1,
  },
  leftSection: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  headerBackground: {
    height: 133,
    width: "100%",
  },
  profileSection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: -60,
  },
  profileImageContainer: {
    alignSelf: "flex-start",
    borderRadius: 60,
    padding: 4,
  },
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 50,
  },
  statsButtonSection: {
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  statsContainer: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: theme.typography.fontSizes.h3,
  },
  statLabel: {
    fontSize: theme.typography.fontSizes.h5,
    marginTop: 2,
  },
  addFriendsButton: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xs,
  },
  userInfo: {
    marginTop: theme.spacing.xs,
  },
  userName: {
    fontSize: theme.typography.fontSizes.h2,
    fontWeight: theme.typography.fontWeights.bold,
  },
  username: {
    fontSize: theme.typography.fontSizes.h4,
    marginTop: 2,
  },
  descriptionContainer: {
    marginTop: theme.spacing.md,
  },
  descriptionTitle: {
    fontSize: theme.typography.fontSizes.h3,
    marginBottom: theme.spacing.xs,
  },
  descriptionText: {
    fontSize: theme.typography.fontSizes.h4,
  },
  recipesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  recipesTitle: {
    fontSize: theme.typography.fontSizes.h2,
  },
  seeAllButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  recipesScroll: {
    marginTop: theme.spacing.sm,
    paddingLeft: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  recipesScrollContent: {
    paddingRight: theme.spacing.lg,
  },
});
