// screens/LoginScreen.tsx
import ArtLogin from "@/assets/images/art_login.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { theme } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { AntDesign } from '@expo/vector-icons';
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/auth-context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();
  const { colors, isDark } = useTheme();

  const handleLogin = () => {
    Keyboard.dismiss();
    
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    signIn();
    router.replace("/(tabs)");
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign in");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.illustrationWrapper}>
              <ArtLogin width={320} height={240} />
            </View>

            <Animated.View entering={FadeInUp.delay(300)}>
              <Typography.H2 style={[styles.title, { color: colors.text.primary }]}>
                Let's sign you in
              </Typography.H2>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(500)}>
              <Typography.H5 style={styles.subtitle} color={colors.text.secondary}>
                Easily find farms near you with built in grocery lists, recipes, and awesome food!
              </Typography.H5>
            </Animated.View>

            <View style={styles.form}>
              <Input
                placeholder="Email or username"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />

              <Input
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            <Button
              variant="primary"
              onPress={handleLogin}
              style={styles.loginButton}
            >
              Log in
            </Button>

            <Typography.H5 style={[styles.divider, { color: colors.text.tertiary }]}>
              Or
            </Typography.H5>

            <TouchableOpacity
              onPress={handleGoogleSignIn}
              style={[
                styles.googleButton,
                {
                  borderColor: colors.border.default,
                  backgroundColor: colors.card,
                }
              ]}
              activeOpacity={0.8}
            >
              <View style={styles.googleButtonContent}>
                <AntDesign
                  name="google"
                  size={20}
                  color={colors.text.primary}
                  style={styles.googleIcon}
                />
                <Text style={[styles.googleButtonText, { color: colors.text.primary }]}>
                  Sign in with Google
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Typography.H5 color={colors.text.secondary}>
                Don't have an account?{' '}
              </Typography.H5>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Typography.H5 color={theme.brand.primary} style={styles.link}>
                  Create An account
                </Typography.H5>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.typography.fontSizes.h5,
  },
  form: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  loginButton: {
    marginBottom: theme.spacing.sm,
  },
  divider: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontSize: theme.typography.fontSizes.h5,
    fontWeight: theme.typography.fontWeights.semibold,
    fontFamily: theme.typography.fontFamily,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xs,
  },
  link: {
    fontWeight: theme.typography.fontWeights.semibold,
  },
  googleButton: {
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
  },
  googleIcon: {
    marginRight: theme.spacing.sm,
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
});