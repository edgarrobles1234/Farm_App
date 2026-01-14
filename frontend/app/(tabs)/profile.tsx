// (tabs)/profile.tsx
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import React from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/useTheme';
import { theme } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; 

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const handleAddFriends = () => {
    console.log("Going to AddFriends Page");
    router.navigate('/(profile)/addfriends');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
      <ScrollView style={styles.container}>
        {/* Header Background */}
        <View style={[styles.headerBackground, { backgroundColor: theme.brand.light }]} />

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Image */}
          <View style={[styles.profileImageContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.profileImage, { backgroundColor: theme.neutral[400] }]}>
              {/* Placeholder for profile image */}
            </View>
          </View>

          {/* Stats and Button Section */}
        <View style={styles.userfriendsSection}>
        {/* Left side: Name, Username, and Description */}
        <View style={styles.leftSection}>
            {/* Name and Username */}
            <View style={styles.userInfo}>
            <ThemedText type="title" style={styles.userName}>
                Abeyah Calpatura
            </ThemedText>
            <ThemedText style={[styles.username, { color: colors.text.secondary }]}>
                @abeyahc
            </ThemedText>
            </View>

            {/* Description */}
            <View style={styles.descriptionContainer}>
            <ThemedText type="defaultSemiBold" style={styles.descriptionTitle}>
                Description
            </ThemedText>
            <ThemedText style={[styles.descriptionText, { color: colors.text.secondary }]}>
                Lorem Ipsum
            </ThemedText>
            </View>
        </View>

        {/* Right side: Stats and Button */}
        <View style={styles.statsButtonSection}>
            {/* Stats */}
            <View style={styles.statsContainer}>
            <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>31</ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.text.secondary }]}>
                Followers
                </ThemedText>
            </View>
            <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>58</ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.text.secondary }]}>
                Following
                </ThemedText>
            </View>
            </View>

            {/* Add Friends Button */}
            <Button
            variant="primary"
            onPress={handleAddFriends}
            style={styles.addFriendsButton}
            >
            Add Friends
            </Button>
        </View>
        </View>
        </View>

        {/* My Recipes Header - Placeholder for future section */}
        <View style={styles.recipesHeader}>
          <ThemedText type="title" style={styles.recipesTitle}>
            My Recipes
          </ThemedText>
          <Button
            variant="primary"
            onPress={() => console.log('See All')}
            style={styles.seeAllButton}
          >
            See All
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    userfriendsSection: {
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
    width: '100%',
  },
  profileSection: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: -60,
  },
  profileImageContainer: {
    alignSelf: 'flex-start',
    borderRadius: 60,
    padding: 4,
  },
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 50,
  },
  statsButtonSection: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});