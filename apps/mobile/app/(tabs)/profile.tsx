import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { theme } from "../../src/theme";

function AccountRow({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  description: string;
  href: "/requests" | "/settings";
}) {
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowDescription}>{description}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.secondary} />
      </Pressable>
    </Link>
  );
}

export default function ProfileScreen() {
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>YOUR TRAVEL SPACE</Text>
        <Text style={styles.title}>Your account</Text>
        <Text style={styles.subtitle}>
          Keep your travel plans, requests and preferences together.
        </Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color={theme.colors.primaryDark} />
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.profileTitle}>Welcome to IRIFE</Text>
          <Text style={styles.profileSubtitle}>
            Sign-in and personal profile will be available in a later release.
          </Text>
        </View>
        <View style={styles.previewBadge}>
          <Text style={styles.previewBadgeText}>PREVIEW</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your activity</Text>
        <View style={styles.group}>
          <AccountRow
            icon="document-text-outline"
            title="My requests"
            description="Review your experience enquiries"
            href="/requests"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.group}>
          <AccountRow
            icon="settings-outline"
            title="Settings"
            description="Language, appearance and privacy"
            href="/settings"
          />
        </View>
      </View>

      <View style={styles.helpCard}>
        <View style={styles.helpIcon}>
          <Ionicons name="help-circle-outline" size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.helpCopy}>
          <Text style={styles.helpTitle}>Need a hand?</Text>
          <Text style={styles.helpDescription}>
            Help and traveler support will be added before public launch.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: 8 },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
  },
  subtitle: {
    color: theme.colors.secondary,
    fontSize: 14,
    lineHeight: 21,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 17,
    borderRadius: theme.radius.card,
    backgroundColor: theme.colors.softMint,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.white,
  },
  profileCopy: { flex: 1, gap: 4 },
  profileTitle: {
    color: theme.colors.primaryDark,
    fontSize: 15,
    fontWeight: "900",
  },
  profileSubtitle: {
    color: theme.colors.secondary,
    fontSize: 11,
    lineHeight: 16,
  },
  previewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.white,
  },
  previewBadgeText: {
    color: theme.colors.primaryDark,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  section: { gap: 11 },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
  },
  group: {
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.softMint,
  },
  rowCopy: { flex: 1, gap: 4 },
  rowTitle: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  rowDescription: {
    color: theme.colors.secondary,
    fontSize: 11,
  },
  helpCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  helpIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.softMint,
  },
  helpCopy: { flex: 1, gap: 4 },
  helpTitle: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  helpDescription: {
    color: theme.colors.secondary,
    fontSize: 11,
    lineHeight: 16,
  },
  pressed: { opacity: 0.75 },
});
