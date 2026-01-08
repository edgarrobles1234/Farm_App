// screens/LoginScreen.tsx
import ArtSignup from "@/assets/images/art_signup.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { theme } from "@/constants/theme";
import { AntDesign } from '@expo/vector-icons';
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import Animated, { FadeInUp } from "react-native-reanimated";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const handleLogin = () => {
    // temporary logic (no backend yet)
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    // later: real auth
    router.replace("/");
  };

  const handleGoogleSignIn = () => {
    console.log("Google sign in");
    // Add Google sign in logic later
  };

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
    <SafeAreaView style={styles.container}>

      <View style={styles.content}>
        <View style={styles.illustrationWrapper}>
          <ArtSignup width={412.06} height={225.48}/>
        </View>

        {/* Title */}
        <Animated.View
                  entering={FadeInUp.delay(300)}
        >
        <Typography.H2 style={styles.title}>
          Create An Account
        </Typography.H2>
        </Animated.View>
        
        <Animated.View
            entering={FadeInUp.delay(500)}
        >
        <Typography.H5 style={styles.subtitle} color={theme.neutral[500]}>
          Easily find farms near you with built in grocery lists, recipes, and awesome food!
        </Typography.H5>
        </Animated.View>

        {/* Form */}
        <View style={styles.form}>
            <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

            <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

            <Input 
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
          />
            
            <Input
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        {/* Login Button */}
        <Button
          variant="primary"
          onPress={handleLogin}
          style={styles.loginButton}
        >
          Sign Up
        </Button>

        {/* Divider */}
        <Typography.H5 style={styles.divider}>
          Or
        </Typography.H5>

        {/* Google Sign In */}
        <TouchableOpacity
        onPress={handleGoogleSignIn}
        style={styles.googleButton}
        activeOpacity={0.8}
      >
        <View style={styles.googleButtonContent}>
          <AntDesign
            name="google"
            size={20}
            color={theme.neutral[700]}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>
            Sign up with Google
          </Text>
        </View>
      </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <Typography.H5 color={theme.neutral[600]}>
            Already have an account?{' '}
          </Typography.H5>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Typography.H5 color={theme.brand.primary} style={styles.link}>
              Log in
            </Typography.H5>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.neutral.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSizes.h5,
  },
  form: {
    gap: theme.spacing.sm,
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
    color: theme.neutral[700],
    fontFamily: theme.typography.fontFamily,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  link: {
    fontWeight: theme.typography.fontWeights.semibold,
  },
  googleButton: {
  marginBottom: theme.spacing.md,
  paddingVertical: theme.spacing.md,
  borderRadius: theme.borderRadius.lg,
  borderWidth: 1,
  borderColor: theme.neutral[300],
  backgroundColor: theme.neutral.white,
  },
  googleIcon: {
  marginRight: theme.spacing.sm,
  },
  illustrationWrapper: {
  alignItems: 'center',
  marginBottom: theme.spacing.xs,
  },
});