import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import React from 'react';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function HomeScreen() {
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
});