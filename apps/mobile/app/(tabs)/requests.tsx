import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { theme } from "../../src/theme";

export default function RequestsScreen() {
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR TRAVEL ACTIVITY</Text>
        <Text style={styles.title}>My requests</Text>
        <Text style={styles.subtitle}>
          Keep track of the experiences you have enquired about.
        </Text>
      </View>

      <View style={styles.emptyCard}>
        <View style={styles.iconWrap}>
          <Ionicons name="paper-plane-outline" size={28} color={theme.colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Your requests will appear here</Text>
        <Text style={styles.emptyDescription}>
          When the IRIFE enquiry service is connected, you will be able to review provider replies and request statuses here.
        </Text>
        <View style={styles.status}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Enquiry service not connected</Text>
        </View>
      </View>

      <Link href="/(tabs)/profile" asChild>
        <Pressable style={styles.backLink}>
          <Ionicons name="person-outline" size={17} color={theme.colors.primary} />
          <Text style={styles.backText}>Back to your account</Text>
          <Ionicons name="arrow-forward" size={15} color={theme.colors.primary} />
        </Pressable>
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: 8 },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.secondary,
    fontSize: 13,
    lineHeight: 20,
  },
  emptyCard: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  iconWrap: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: theme.colors.softMint,
  },
  emptyTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyDescription: {
    color: theme.colors.secondary,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
  },
  status: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.softMint,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  statusText: {
    color: theme.colors.primaryDark,
    fontSize: 9,
    fontWeight: "800",
  },
  backLink: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
  },
  backText: { color: theme.colors.primary, fontSize: 11, fontWeight: "800" },
});
