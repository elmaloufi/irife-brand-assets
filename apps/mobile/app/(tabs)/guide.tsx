import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from 'react-native';
import { AppTextInput as TextInput } from '../../src/components/AppTextInput';
import { AppText as Text } from '../../src/components/AppText';
import { AppButton } from "../../src/components/AppButton";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { theme } from "../../src/theme";

const suggestions = [
  "Plan one day in Marrakech",
  "Find calm coastal escapes",
  "Explore Moroccan food and culture",
];

export default function GuideScreen() {
  const [draft, setDraft] = useState("");

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Ionicons name="sparkles" size={22} color={theme.colors.primaryDark} />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.eyebrow}>YOUR LOCAL TRAVEL COMPANION</Text>
            <Text style={styles.title}>Meet your IRIFE Guide</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          Tell us what you enjoy. Your guide will help shape a journey around you.
        </Text>
      </View>

      <View style={styles.welcomeCard}>
        <View style={styles.guideAvatar}>
          <Ionicons name="sparkles" size={26} color={theme.colors.white} />
        </View>
        <Text style={styles.welcomeTitle}>A better journey starts with a conversation.</Text>
        <Text style={styles.welcomeDescription}>
          Discover local experiences, build a day plan, and explore every suggested stop on the IRIFE Smart Map.
        </Text>
        <View style={styles.capabilityRow}>
          <View style={styles.capability}>
            <Ionicons name="map-outline" size={15} color={theme.colors.primaryDark} />
            <Text style={styles.capabilityText}>Map-ready plans</Text>
          </View>
          <View style={styles.capability}>
            <Ionicons name="heart-outline" size={15} color={theme.colors.primaryDark} />
            <Text style={styles.capabilityText}>Your interests</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Try asking</Text>
        <View style={styles.suggestions}>
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => setDraft(suggestion)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
              <Ionicons name="arrow-up-right-box" size={16} color={theme.colors.primary} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.composerCard}>
        <Text style={styles.composerLabel}>YOUR TRAVEL IDEA</Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Tell your guide what you have in mind..."
          placeholderTextColor={theme.colors.secondary}
          multiline
          editable
          accessibilityLabel="Write a travel idea for the IRIFE Guide"
          style={styles.input}
        />
        <View style={styles.composerFooter}>
          <Text style={styles.pendingText}>Guide connection not active yet</Text>
          <AppButton
            label="Send"
            icon="arrow-forward"
            onPress={() => undefined}
            disabled
          />
        </View>
      </View>

      <View style={styles.notice}>
        <Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.primary} />
        <Text style={styles.noticeText}>
          This is the guide preview. No message is sent and no AI response is generated until the secure IRIFE guide service is connected.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: 11 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: theme.colors.softMint,
  },
  brandCopy: { flex: 1, gap: 4 },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.secondary,
    fontSize: 13,
    lineHeight: 20,
  },
  welcomeCard: {
    gap: 12,
    padding: 20,
    borderRadius: 24,
    backgroundColor: theme.colors.hero,
  },
  guideAvatar: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
  },
  welcomeTitle: {
    maxWidth: 290,
    color: theme.colors.white,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
  },
  welcomeDescription: {
    color: "#D8E7E1",
    fontSize: 12,
    lineHeight: 19,
  },
  capabilityRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 },
  capability: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.heroAccent,
  },
  capabilityText: {
    color: theme.colors.primaryDark,
    fontSize: 9,
    fontWeight: "800",
  },
  section: { gap: 10 },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  suggestions: { gap: 8 },
  suggestion: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  suggestionText: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "700",
  },
  composerCard: {
    gap: 10,
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  composerLabel: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  input: {
    minHeight: 80,
    color: theme.colors.ink,
    fontSize: 13,
    lineHeight: 20,
    textAlignVertical: "top",
  },
  composerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  pendingText: {
    flex: 1,
    color: theme.colors.secondary,
    fontSize: 10,
    lineHeight: 15,
  },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 13,
    borderRadius: 15,
    backgroundColor: theme.colors.softMint,
  },
  noticeText: {
    flex: 1,
    color: theme.colors.primaryDark,
    fontSize: 10,
    lineHeight: 16,
  },
  pressed: { opacity: 0.78 },
});
