import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../src/components/ScreenContainer";
import { theme } from "../src/theme";

const groups = [
  {
    title: "App preferences",
    rows: [
      { icon: "language-outline" as const, title: "Language", value: "English preview", description: "Arabic and French localization are planned." },
      { icon: "contrast-outline" as const, title: "Appearance", value: "System default", description: "Theme selection will be saved with your preferences." },
      { icon: "resize-outline" as const, title: "Distance units", value: "Kilometres", description: "Travel units will be configurable in a later release." },
    ],
  },
  {
    title: "Privacy and permissions",
    rows: [
      { icon: "location-outline" as const, title: "Location access", value: "Not requested", description: "IRIFE will ask only when you choose a location-based feature." },
      { icon: "notifications-outline" as const, title: "Notifications", value: "Not connected", description: "Notification preferences will appear after push delivery is implemented." },
      { icon: "shield-checkmark-outline" as const, title: "Privacy and data", value: "Setup pending", description: "Conversation and account data controls will be connected to the privacy API." },
    ],
  },
  {
    title: "Account security",
    rows: [
      { icon: "lock-closed-outline" as const, title: "Sign-in and security", value: "Coming later", description: "Secure account sessions are not enabled in this preview." },
    ],
  },
];

export default function SettingsScreen() {
  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Link href="/(tabs)/profile" asChild>
          <Pressable style={styles.back}>
            <Ionicons name="chevron-back" size={19} color={theme.colors.primaryDark} />
            <Text style={styles.backText}>Account</Text>
          </Pressable>
        </Link>
        <Text style={styles.eyebrow}>MAKE IRIFE YOURS</Text>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Your preferences and privacy controls, in one place.
        </Text>
      </View>

      {groups.map((group) => (
        <View key={group.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{group.title}</Text>
          <View style={styles.group}>
            {group.rows.map((item, index) => (
              <View key={item.title}>
                <View style={styles.row}>
                  <View style={styles.iconWrap}>
                    <Ionicons name={item.icon} size={19} color={theme.colors.primary} />
                  </View>
                  <View style={styles.copy}>
                    <View style={styles.rowHeading}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      <Text style={styles.value}>{item.value}</Text>
                    </View>
                    <Text style={styles.description}>{item.description}</Text>
                  </View>
                </View>
                {index < group.rows.length - 1 ? <View style={styles.separator} /> : null}
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={19} color={theme.colors.primary} />
        <Text style={styles.noteText}>
          These settings are a preview. No preference is saved or permission is requested from this screen yet.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { gap: 8 },
  back: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
    paddingVertical: 4,
  },
  backText: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },
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
  section: { gap: 10 },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
  },
  group: {
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: theme.colors.softMint,
  },
  copy: { flex: 1, gap: 4 },
  rowHeading: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 5,
  },
  rowTitle: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "800",
  },
  value: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: "800",
  },
  description: {
    color: theme.colors.secondary,
    fontSize: 10,
    lineHeight: 15,
  },
  separator: {
    height: 1,
    marginLeft: 65,
    backgroundColor: theme.colors.border,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 14,
    borderRadius: 16,
    backgroundColor: theme.colors.softMint,
  },
  noteText: {
    flex: 1,
    color: theme.colors.primaryDark,
    fontSize: 11,
    lineHeight: 17,
  },
});
