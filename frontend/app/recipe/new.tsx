import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  View,
  Text,
  ScrollView,
  Platform,
  Image,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/useTheme";
import { theme } from "@/constants/theme";

export default function NewRecipeScreen() {
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUris, setMediaUris] = useState<string[]>([]);

  const handleMediaUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setMediaUris((prev) => [...prev, ...uris]);
    }
  };

  const handleAddMore = async () => {
    await handleMediaUpload();
  };

  const handleDeleteMedia = (index: number) => {
    setMediaUris((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={28} color={colors.text.primary} />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      />

      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
        edges={["bottom"]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.container}>

            {/* Page Title */}
            <Text style={[styles.pageTitle, { color: colors.text.primary }]}>
              New Recipe
            </Text>

            {/* Upload area — shows image once selected */}
            {mediaUris.length === 0 ? (
              <TouchableOpacity
                style={[
                  styles.uploadBox,
                  {
                    backgroundColor: colors.input.background,
                    borderColor: theme.brand.primary,
                  },
                ]}
                onPress={handleMediaUpload}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={48} color={theme.brand.primary} />
                <Text style={[styles.uploadText, { color: colors.text.primary }]}>
                  Add photos / video
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.mediaPreviewContainer}>
                {/* Main large image */}
                <View style={styles.mainImageWrapper}>
                  <TouchableOpacity onPress={handleMediaUpload} activeOpacity={0.85} style={{ flex: 1 }}>
                    <Image
                      source={{ uri: mediaUris[0] }}
                      style={styles.mainImage}
                      resizeMode="cover"
                    />
                    {/* Edit badge bottom-right */}
                    <View style={[styles.editBadge, { backgroundColor: theme.brand.primary }]}>
                      <Ionicons name="pencil" size={12} color="#fff" />
                    </View>
                  </TouchableOpacity>
                  {/* X button top-left */}
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteMedia(0)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* Thumbnail strip for additional images */}
                {mediaUris.length > 1 && (
                  <FlatList
                    data={mediaUris.slice(1)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(_, i) => i.toString()}
                    contentContainerStyle={styles.thumbnailStrip}
                    renderItem={({ item, index }) => (
                      <View style={styles.thumbnailWrapper}>
                        <TouchableOpacity
                          onPress={handleMediaUpload}
                          activeOpacity={0.8}
                          style={{ flex: 1 }}
                        >
                          <Image
                            source={{ uri: item }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                        {/* X button top-left */}
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleDeleteMedia(index + 1)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <Ionicons name="close" size={12} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                )}
              </View>
            )}

            {/* Title input */}
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.input.background,
                  borderColor: colors.border.default,
                },
              ]}
            >
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
                placeholderTextColor={colors.text.tertiary}
                style={[styles.input, { color: colors.text.primary }]}
              />
            </View>

            {/* Description input */}
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.input.background,
                  borderColor: colors.border.default,
                },
              ]}
            >
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Description (Recommended)"
                placeholderTextColor={colors.text.tertiary}
                style={[styles.input, { color: colors.text.primary }]}
              />
            </View>

            {/* Add more button — only shown after first upload */}
            {mediaUris.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.addMoreBox,
                  {
                    backgroundColor: colors.input.background,
                    borderColor: theme.brand.darkerOrange,
                  },
                ]}
                onPress={handleAddMore}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={48} color={theme.brand.primary} />
                <Text style={[styles.uploadText, { color: colors.text.tertiary }]}>
                  Add more
                </Text>
              </TouchableOpacity>
            )}

          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  pageTitle: {
    fontSize: theme.typography.fontSizes.h2,
    fontWeight: theme.typography.fontWeights.bold,
    alignSelf: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  uploadBox: {
    width: "100%",
    height: 104,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  uploadText: {
    fontSize: theme.typography.fontSizes.h5,
    fontWeight: theme.typography.fontWeights.semibold,
  },
  inputWrapper: {
    width: "100%",
    height: 45,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    paddingHorizontal: theme.spacing.sm,
    justifyContent: "center",
  },
  input: {
    fontSize: theme.typography.fontSizes.h4,
    fontWeight: theme.typography.fontWeights.regular,
    ...(Platform.OS === "web" ? {} : {}),
  },
  addMoreBox: {
    width: "100%",
    height: 104,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  mediaPreviewContainer: {
    width: "100%",
    gap: theme.spacing.sm,
  },
  mainImageWrapper: {
    width: "100%",
    height: 200,
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  editBadge: {
    position: "absolute",
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    position: "absolute",
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  thumbnailStrip: {
    gap: theme.spacing.sm,
    paddingHorizontal: 2,
  },
  thumbnailWrapper: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
});