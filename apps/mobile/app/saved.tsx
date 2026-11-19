import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../src/components/ScreenContainer";
import { theme } from "../src/theme";

export default function SavedScreen() {
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR PERSONAL COLLECTION</Text>
        <Text style={styles.title}>Saved places & trips</Text>
        <Text style={styles.subtitle}>
          Keep the places and journeys you want to come back to.
        </Text>
      </View>

      <View style={styles.emptyCard}>
        <View style={styles.iconWrap}>
          <Ionicons name="bookmark-outline" size={28} color={theme.colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Your collection starts here</Text>
        <Text style={styles.emptyDescription}>
          Saving places and AI-created itineraries will be enabled when your account and catalogue services are connected.
        </Text>
        <Link href="/(tabs)/discover" asChild>
          <Pressable style={styles.link}>
            <Text style={styles.linkText}>Explore IRIFE</Text>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
          </Pressable>
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: 8 },
  eyebrow: { color: theme.colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  title: { color: theme.colors.ink, fontSize: 28, lineHeight: 34, fontWeight: "900" },
  subtitle: { color: theme.colors.secondary, fontSize: 13, lineHeight: 20 },
  emptyCard: {
    alignItems: "center",
    gap: 12,
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  iconWrap: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: theme.colors.softMint,
  },
  emptyTitle: { color: theme.colors.ink, fontSize: 17, fontWeight: "900", textAlign: "center" },
  emptyDescription: { color: theme.colors.secondary, fontSize: 12, lineHeight: 19, textAlign: "center" },
  link: { flexDirection: "row", alignItems: "center", gap: 7, padding: 8 },
  linkText: { color: theme.colors.primary, fontSize: 11, fontWeight: "900" },
});
