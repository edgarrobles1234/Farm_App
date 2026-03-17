import { Stack } from "expo-router";
import React from 'react';

export default function ProfileStack() {
  return (
    <Stack>
      <Stack.Screen name="addfriends" options={{ headerShown: false }} />
      <Stack.Screen name="followers" options={{ headerShown: false }} />
      <Stack.Screen name="following" options={{ headerShown: false }} />
    </Stack>
  );
}
