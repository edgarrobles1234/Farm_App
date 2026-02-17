import { Tabs } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

import { HapticTab } from "@/components/haptic-tab";
import { CreateTabButton } from "@/components/create-tab-button";
import { theme } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.brand.primary,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: colors.background,
            borderTopColor: colors.border.light,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={28} name={focused ? "home" : "home-outline"} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="map"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={28} name={focused ? "map" : "map-outline"} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            tabBarButton: (props) => <CreateTabButton {...props} />,
            tabBarIcon: ({ color }) => (
              <Ionicons size={28} name="add" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="grocerylist"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={28} name={focused ? "list" : "list-outline"} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={28} name={focused ? "person" : "person-outline"} color={color} />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
