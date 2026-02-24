import React, { useState, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { PlatformPressable } from "@react-navigation/elements";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/useTheme";
import { theme } from "@/constants/theme";

type CreateChoice = "recipe" | "grocery";

export function CreateTabButton(props: BottomTabBarButtonProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuBackgroundColor = isDark ? colors.card : colors.background;
  const menuBorderColor = isDark ? colors.border.strong : colors.border.light;
  const menuPressedColor = isDark ? colors.background + "10" : colors.border.light;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  const openMenu = () => {
    setIsMenuOpen(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 10,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setIsMenuOpen(false));
  };

  const triggerHaptic = (style: Haptics.ImpactFeedbackStyle) => {
    // Haptics works on both iOS and Android
    // Android supports haptics on API level 26+ (Android 8.0+)
    Haptics.impactAsync(style).catch(() => {
      // Silently fail if haptics not supported on the device
    });
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleChoice = (choice: CreateChoice) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    const route = choice === "recipe" ? "/recipe/new" : "/grocery-list/new";
    closeMenu();
    setTimeout(() => router.navigate(route), 150);
  };

  return (
    <>
      {/* Invisible overlay to dismiss menu */}
      {isMenuOpen && (
        <Pressable style={styles.overlay} onPress={closeMenu} />
      )}

      <View style={styles.wrapper}>
        {/* Animated Menu */}
        {isMenuOpen && (
          <Animated.View
            style={[
              styles.menuContainer,
              {
                backgroundColor: menuBackgroundColor,
                borderColor: menuBorderColor,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Recipe Option */}
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: menuPressedColor },
              ]}
              onPress={() => handleChoice("recipe")}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: theme.brand.primary + '15' }]}>
                <Ionicons name="restaurant-outline" size={20} color={theme.brand.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <ThemedText style={[styles.menuLabel, { color: colors.text.primary }]}>
                  Recipe
                </ThemedText>
                <ThemedText style={[styles.menuSubLabel, { color: colors.text.tertiary }]}>
                  Create a new recipe
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: menuBorderColor }]} />

            {/* Grocery List Option */}
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { backgroundColor: menuPressedColor },
              ]}
              onPress={() => handleChoice("grocery")}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: theme.brand.primary + '15' }]}>
                <Ionicons name="list-outline" size={20} color={theme.brand.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <ThemedText style={[styles.menuLabel, { color: colors.text.primary }]}>
                  Grocery List
                </ThemedText>
                <ThemedText style={[styles.menuSubLabel, { color: colors.text.tertiary }]}>
                  Start a new list
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.tertiary} />
            </Pressable>
          </Animated.View>
        )}

        {/* Tab Button */}
        <PlatformPressable {...props} onPress={toggleMenu}>
          {props.children}
        </PlatformPressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  wrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  menuContainer: {
    position: "absolute",
    bottom: 60,
    width: 220,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    overflow: "hidden",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: theme.typography.fontSizes.h4,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  menuSubLabel: {
    fontSize: theme.typography.fontSizes.h5,
    fontFamily: theme.typography.fontFamily,
    marginTop: 1,
  },
  divider: {
    height: 1,
    width: "100%",
  },
});
