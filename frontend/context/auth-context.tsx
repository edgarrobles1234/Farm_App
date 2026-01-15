import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

type SignUpMetadata = {
  name?: string;
  username?: string;
};

type AuthContextValue = {
  session: Session | null;
  initialized: boolean;
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signUpWithPassword: (
    email: string,
    password: string,
    metadata?: SignUpMetadata
  ) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      if (!error) {
        setSession(data.session ?? null);
      }
      setInitialized(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      initialized,
      signInWithPassword: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error?.message ?? null;
      },
      signUpWithPassword: async (email, password, metadata) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: metadata,
          },
        });
        return error?.message ?? null;
      },
      signInWithGoogle: async () => {
        const redirectTo = AuthSession.makeRedirectUri({
          useProxy: Platform.OS !== "web",
        });

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo },
        });

        if (error) return error.message;
        if (!data?.url) return "Unable to start Google sign-in";

        if (Platform.OS === "web") {
          globalThis.location?.assign(data.url);
          return null;
        }

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type !== "success" || !("url" in result) || !result.url) {
          return "Google sign-in cancelled";
        }

        const { error: sessionError } = await supabase.auth.getSessionFromUrl({
          url: result.url,
          storeSession: true,
        });

        return sessionError?.message ?? null;
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        return error?.message ?? null;
      },
    }),
    [initialized, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
