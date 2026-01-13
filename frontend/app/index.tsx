import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";

export default function Index() {
  // TODO: Replace with actual auth check (AsyncStorage, etc.)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check auth status
    // For now, just set loading to false
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null; // or a loading screen
  }

  // Redirect based on auth status
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/login"} />;
}