import React, { useState, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  View,
  Text,
  ScrollView,
  Image,
  FlatList,
  Alert,
  PanResponder,
  Animated,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/useTheme";
import { theme } from "@/constants/theme";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Ingredient {
  id: string;
  quantity: string;
  name: string;
}

interface Step {
  id: string;
  instruction: string;
  photoUris: string[];
}

// ─── Helper ───────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Sub-components ──────────────────────────────────────────────────────────

/** A single time input pill */
function TimeField({
  label,
  value,
  onChange,
  colors,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  colors: any;
}) {
  return (
    <View style={timeStyles.pill}>
      <Text style={[timeStyles.label, { color: colors.text.tertiary }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="—"
        placeholderTextColor={colors.text.tertiary}
        keyboardType="numeric"
        style={[timeStyles.input, { color: colors.text.primary, borderBottomColor: theme.brand.primary }]}
      />
      <Text style={[timeStyles.unit, { color: colors.text.tertiary }]}>min</Text>
    </View>
  );
}

const timeStyles = StyleSheet.create({
  pill: { alignItems: "center", flex: 1 },
  label: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  input: { fontSize: 18, fontWeight: "700", textAlign: "center", borderBottomWidth: 2, minWidth: 40, paddingBottom: 2 },
  unit: { fontSize: 10, marginTop: 3 },
});

/** Ingredient row */
function IngredientRow({
  item,
  onUpdate,
  onDelete,
  colors,
}: {
  item: Ingredient;
  onUpdate: (id: string, field: "quantity" | "name", val: string) => void;
  onDelete: (id: string) => void;
  colors: any;
}) {
  return (
    <View style={ingStyles.row}>
      <TextInput
        value={item.quantity}
        onChangeText={(v) => onUpdate(item.id, "quantity", v)}
        placeholder="Qty"
        placeholderTextColor={colors.text.tertiary}
        style={[
          ingStyles.qtyInput,
          {
            backgroundColor: colors.input.background,
            borderColor: colors.border.default,
            color: colors.text.primary,
          },
        ]}
      />
      <TextInput
        value={item.name}
        onChangeText={(v) => onUpdate(item.id, "name", v)}
        placeholder="Ingredient"
        placeholderTextColor={colors.text.tertiary}
        style={[
          ingStyles.nameInput,
          {
            backgroundColor: colors.input.background,
            borderColor: colors.border.default,
            color: colors.text.primary,
          },
        ]}
      />
      <TouchableOpacity onPress={() => onDelete(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close-circle" size={22} color={colors.text.tertiary} />
      </TouchableOpacity>
    </View>
  );
}

const ingStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, width: "100%" },
  qtyInput: {
    width: 64,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  nameInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    fontSize: 14,
  },
});

/** Step card with drag handle, instruction input, and inline photo strip */
function StepCard({
  step,
  index,
  total,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddPhoto,
  onDeletePhoto,
  colors,
}: {
  step: Step;
  index: number;
  total: number;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onAddPhoto: (id: string) => void;
  onDeletePhoto: (stepId: string, photoIndex: number) => void;
  colors: any;
}) {
  return (
    <View
      style={[
        stepStyles.card,
        { backgroundColor: colors.input.background, borderColor: colors.border.default },
      ]}
    >
      {/* Header row */}
      <View style={stepStyles.header}>
        <View style={[stepStyles.stepBadge, { backgroundColor: theme.brand.primary }]}>
          <Text style={stepStyles.stepNum}>{index + 1}</Text>
        </View>
        <Text style={[stepStyles.stepLabel, { color: colors.text.secondary }]}>Step</Text>

        {/* Reorder arrows */}
        <View style={stepStyles.reorderBtns}>
          <TouchableOpacity
            disabled={index === 0}
            onPress={() => onMoveUp(step.id)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="chevron-up" size={20} color={index === 0 ? colors.text.tertiary : colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={index === total - 1}
            onPress={() => onMoveDown(step.id)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons
              name="chevron-down"
              size={20}
              color={index === total - 1 ? colors.text.tertiary : colors.text.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Delete step */}
        <TouchableOpacity onPress={() => onDelete(step.id)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Ionicons name="trash-outline" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Instruction */}
      <TextInput
        value={step.instruction}
        onChangeText={(v) => onUpdate(step.id, v)}
        placeholder="Describe this step…"
        placeholderTextColor={colors.text.tertiary}
        multiline
        style={[stepStyles.textArea, { color: colors.text.primary }]}
      />

      {/* Photo strip */}
      <View style={stepStyles.photoRow}>
        {step.photoUris.map((uri, pi) => (
          <View key={pi} style={stepStyles.photoThumbWrapper}>
            <Image source={{ uri }} style={stepStyles.photoThumb} resizeMode="cover" />
            <TouchableOpacity
              style={stepStyles.photoDeleteBtn}
              onPress={() => onDeletePhoto(step.id, pi)}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              <Ionicons name="close" size={11} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        {/* Add photo button */}
        <TouchableOpacity
          style={[
            stepStyles.addPhotoBtn,
            { backgroundColor: colors.background, borderColor: theme.brand.primary },
          ]}
          onPress={() => onAddPhoto(step.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="camera-outline" size={22} color={theme.brand.primary} />
          <Text style={[stepStyles.addPhotoLabel, { color: theme.brand.primary }]}>Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { color: "#fff", fontSize: 13, fontWeight: "700" },
  stepLabel: { flex: 1, fontSize: 13, fontWeight: "600" },
  reorderBtns: { flexDirection: "row", gap: 2 },
  textArea: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 72,
    textAlignVertical: "top",
  },
  photoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  photoThumbWrapper: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: "hidden",
  },
  photoThumb: { width: "100%", height: "100%" },
  photoDeleteBtn: {
    position: "absolute",
    top: 3,
    left: 3,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoBtn: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  addPhotoLabel: { fontSize: 10, fontWeight: "600" },
});

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, colors }: { title: string; colors: any }) {
  return (
    <Text style={[sectionStyles.title, { color: colors.text.primary }]}>{title}</Text>
  );
}

const sectionStyles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
    alignSelf: "flex-start",
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function NewRecipeScreen() {
  const { colors } = useTheme();

  // Cover media
  const [mediaUris, setMediaUris] = useState<string[]>([]);

  // Basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Time (in minutes)
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [additionalTime, setAdditionalTime] = useState("");
  const [servings, setServings] = useState("");

  // Ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ id: uid(), quantity: "", name: "" }]);

  // Steps
  const [steps, setSteps] = useState<Step[]>([{ id: uid(), instruction: "", photoUris: [] }]);

  // ── Total time derived
  const totalMins =
    (parseInt(prepTime) || 0) + (parseInt(cookTime) || 0) + (parseInt(additionalTime) || 0);
  const totalDisplay = totalMins > 0 ? `${totalMins} min` : "—";

  // ── Cover media handlers
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

  const handleDeleteMedia = (index: number) => {
    setMediaUris((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Ingredient handlers
  const addIngredient = () =>
    setIngredients((prev) => [...prev, { id: uid(), quantity: "", name: "" }]);

  const updateIngredient = (id: string, field: "quantity" | "name", val: string) =>
    setIngredients((prev) => prev.map((ing) => (ing.id === id ? { ...ing, [field]: val } : ing)));

  const deleteIngredient = (id: string) =>
    setIngredients((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));

  // ── Step handlers
  const addStep = () =>
    setSteps((prev) => [...prev, { id: uid(), instruction: "", photoUris: [] }]);

  const updateStep = (id: string, text: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, instruction: text } : s)));

  const deleteStep = (id: string) =>
    setSteps((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));

  const moveStep = (id: string, dir: "up" | "down") => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (dir === "up" && idx === 0) return prev;
      if (dir === "down" && idx === prev.length - 1) return prev;
      const next = [...prev];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const addStepPhoto = async (stepId: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, photoUris: [...s.photoUris, ...uris] } : s))
      );
    }
  };

  const deleteStepPhoto = (stepId: string, photoIndex: number) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId ? { ...s, photoUris: s.photoUris.filter((_, i) => i !== photoIndex) } : s
      )
    );
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
          headerRight: () => (
            <TouchableOpacity
              style={[styles.publishBtn, { backgroundColor: theme.brand.primary }]}
              onPress={() => Alert.alert("Recipe saved!")}
            >
              <Text style={styles.publishBtnText}>Publish</Text>
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      />

      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={["bottom"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.container}>

            {/* ── Page Title */}
            <Text style={[styles.pageTitle, { color: colors.text.primary }]}>Make a New Recipe</Text>

            {/* ── Cover Media */}
            {mediaUris.length === 0 ? (
              <TouchableOpacity
                style={[styles.uploadBox, { backgroundColor: colors.input.background, borderColor: theme.brand.primary }]}
                onPress={handleMediaUpload}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={48} color={theme.brand.primary} />
                <Text style={[styles.uploadText, { color: colors.text.primary }]}>Add photos / video</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.mediaPreviewContainer}>
                <View style={styles.mainImageWrapper}>
                  <TouchableOpacity onPress={handleMediaUpload} activeOpacity={0.85} style={{ flex: 1 }}>
                    <Image source={{ uri: mediaUris[0] }} style={styles.mainImage} resizeMode="cover" />
                    <View style={[styles.editBadge, { backgroundColor: theme.brand.primary }]}>
                      <Ionicons name="pencil" size={12} color="#fff" />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteMedia(0)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>

                {mediaUris.length > 1 && (
                  <FlatList
                    data={mediaUris.slice(1)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(_, i) => i.toString()}
                    contentContainerStyle={styles.thumbnailStrip}
                    renderItem={({ item, index }) => (
                      <View style={styles.thumbnailWrapper}>
                        <TouchableOpacity onPress={handleMediaUpload} activeOpacity={0.8} style={{ flex: 1 }}>
                          <Image source={{ uri: item }} style={styles.thumbnail} resizeMode="cover" />
                        </TouchableOpacity>
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

            {/* ── Title */}
            <View style={[styles.inputWrapper, { backgroundColor: colors.input.background, borderColor: colors.border.default }]}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Title"
                placeholderTextColor={colors.text.tertiary}
                style={[styles.input, { color: colors.text.primary }]}
              />
            </View>

            {/* ── Description */}
            <View style={[styles.inputWrapper, { backgroundColor: colors.input.background, borderColor: colors.border.default }]}>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Description (Recommended)"
                placeholderTextColor={colors.text.tertiary}
                style={[styles.input, { color: colors.text.primary }]}
              />
            </View>

            {/* ── Add more cover media */}
            {mediaUris.length > 0 && (
              <TouchableOpacity
                style={[styles.addMoreBox, { backgroundColor: colors.input.background, borderColor: theme.brand.darkerOrange }]}
                onPress={handleMediaUpload}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={48} color={theme.brand.primary} />
                <Text style={[styles.uploadText, { color: colors.text.tertiary }]}>Add more</Text>
              </TouchableOpacity>
            )}

            {/* ═══════════════════════════════════════
                ── Time & Servings
            ═══════════════════════════════════════ */}
            <View style={[styles.timingCard, { backgroundColor: colors.input.background, borderColor: colors.border.default }]}>
              <SectionHeader title="Time & Servings" colors={colors} />

              {/* Time row */}
              <View style={styles.timeRow}>
                <TimeField label="Prep" value={prepTime} onChange={setPrepTime} colors={colors} />
                <View style={[styles.timeDivider, { backgroundColor: colors.border.default }]} />
                <TimeField label="Cook" value={cookTime} onChange={setCookTime} colors={colors} />
                <View style={[styles.timeDivider, { backgroundColor: colors.border.default }]} />
                <TimeField label="Additional" value={additionalTime} onChange={setAdditionalTime} colors={colors} />
                <View style={[styles.timeDivider, { backgroundColor: colors.border.default }]} />
                {/* Total — derived, read-only */}
                <View style={{ alignItems: "center", flex: 1 }}>
                  <Text style={[timeStyles.label, { color: colors.text.tertiary }]}>Total</Text>
                  <Text style={[{ fontSize: 18, fontWeight: "700", color: theme.brand.primary }]}>{totalDisplay}</Text>
                </View>
              </View>

              {/* Servings row */}
              <View style={styles.servingsRow}>
                <Ionicons name="people-outline" size={18} color={colors.text.tertiary} />
                <Text style={[styles.servingsLabel, { color: colors.text.secondary }]}>Servings</Text>
                <TextInput
                  value={servings}
                  onChangeText={setServings}
                  placeholder="e.g. 4"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="numeric"
                  style={[
                    styles.servingsInput,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border.default,
                      color: colors.text.primary,
                    },
                  ]}
                />
              </View>
            </View>

            {/* ═══════════════════════════════════════
                ── Ingredients
            ═══════════════════════════════════════ */}
            <View style={[styles.section, { borderColor: colors.border.default }]}>
              <SectionHeader title="Ingredients" colors={colors} />

              {ingredients.map((ing) => (
                <IngredientRow
                  key={ing.id}
                  item={ing}
                  onUpdate={updateIngredient}
                  onDelete={deleteIngredient}
                  colors={colors}
                />
              ))}

              <TouchableOpacity style={[styles.addRowBtn, { borderColor: theme.brand.primary }]} onPress={addIngredient}>
                <Ionicons name="add" size={18} color={theme.brand.primary} />
                <Text style={[styles.addRowLabel, { color: theme.brand.primary }]}>Add ingredient</Text>
              </TouchableOpacity>
            </View>

            {/* ═══════════════════════════════════════
                ── Steps
            ═══════════════════════════════════════ */}
            <View style={styles.section}>
              <SectionHeader title="Steps" colors={colors} />
              <Text style={[styles.stepsHint, { color: colors.text.tertiary }]}>
                Use ↑↓ to reorder • Tap "Photo" inside a step to attach images
              </Text>

              {steps.map((step, index) => (
                <StepCard
                  key={step.id}
                  step={step}
                  index={index}
                  total={steps.length}
                  onUpdate={updateStep}
                  onDelete={deleteStep}
                  onMoveUp={(id) => moveStep(id, "up")}
                  onMoveDown={(id) => moveStep(id, "down")}
                  onAddPhoto={addStepPhoto}
                  onDeletePhoto={deleteStepPhoto}
                  colors={colors}
                />
              ))}

              <TouchableOpacity style={[styles.addRowBtn, { borderColor: theme.brand.primary }]} onPress={addStep}>
                <Ionicons name="add" size={18} color={theme.brand.primary} />
                <Text style={[styles.addRowLabel, { color: theme.brand.primary }]}>Add step</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom padding */}
            <View style={{ height: 40 }} />
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

// ─── Main Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1 },
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
  mediaPreviewContainer: { width: "100%", gap: theme.spacing.sm },
  mainImageWrapper: {
    width: "100%",
    height: 200,
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
  },
  mainImage: { width: "100%", height: "100%" },
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
  thumbnailStrip: { gap: theme.spacing.sm, paddingHorizontal: 2 },
  thumbnailWrapper: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  thumbnail: { width: "100%", height: "100%" },

  // Timing card
  timingCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    gap: 16,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeDivider: { width: 1, height: 36, marginHorizontal: 4 },
  servingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  servingsLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  servingsInput: {
    width: 70,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },

  // Sections
  section: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 0,
    gap: 12,
  },
  addRowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
    alignSelf: "flex-start",
  },
  addRowLabel: { fontSize: 14, fontWeight: "600" },
  stepsHint: { fontSize: 12, marginTop: -4 },

  // Header publish button
  publishBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 4,
  },
  publishBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});