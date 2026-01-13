import { Image } from 'expo-image';
import { StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { router } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts, theme } from '@/constants/theme';
import { Button } from '@/components/ui/button';

export default function HomeScreen() {
  const handleLogout = () => {
    // TODO: Clear auth tokens, AsyncStorage, etc.
    // For now, just navigate back to login
    router.replace('/(auth)/login');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="house.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Welcome Home!
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.contentContainer}>
        <ThemedText>
          You've successfully logged in. This is your home screen.
        </ThemedText>
        
        {/* Add your home screen content here */}
        <ThemedText style={styles.subtitle}>
          What would you like to do today?
        </ThemedText>
        
        {/* Example content sections */}
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold">Quick Actions</ThemedText>
          <ThemedText>Add your main features here</ThemedText>
        </ThemedView>

        {/* Logout Button */}
        <Button
          variant="primary"
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Log out
        </Button>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentContainer: {
    gap: 16,
    marginTop: 16,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 18,
  },
  section: {
    gap: 8,
    marginTop: 12,
  },
  logoutButton: {
    marginTop: 24,
  },
});