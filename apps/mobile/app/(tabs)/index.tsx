import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../src/components/AppButton";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { theme } from "../../src/theme";

const interests = [
  { icon: "water-outline" as const, title: "Coast & ocean", tint: "#E2EFF0" },
  { icon: "leaf-outline" as const, title: "Nature & trails", tint: "#E7EFE2" },
  { icon: "business-outline" as const, title: "Culture & heritage", tint: "#F0E7D9" },
  { icon: "restaurant-outline" as const, title: "Food & local life", tint: "#F2E8E5" },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>i</Text>
          </View>
          <View>
            <Text style={styles.brandName}>IRIFE</Text>
            <Text style={styles.brandCaption}>MADE FOR YOUR JOURNEY</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open account settings"
          onPress={() => router.push("/settings")}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={20} color={theme.colors.primaryDark} />
        </Pressable>
      </View>

      <View style={styles.intro}>
        <Text style={styles.eyebrow}>YOUR NEXT STORY STARTS HERE</Text>
        <Text style={styles.title}>Find your kind of Morocco.</Text>
        <Text style={styles.subtitle}>
          Discover places, people and experiences that make every journey yours.
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Explore destinations on the Smart Map"
        onPress={() => router.push("/(tabs)/map")}
        style={({ pressed }) => [styles.search, pressed && styles.pressed]}
      >
        <Ionicons name="search-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.searchText}>Where would you like to explore?</Text>
        <Ionicons name="arrow-forward" size={17} color={theme.colors.secondary} />
      </Pressable>

      <View style={styles.hero}>
        <View style={styles.heroOrb} />
        <View style={styles.heroOrbSmall} />
        <View style={styles.heroContent}>
          <View style={styles.heroTag}>
            <Ionicons name="sparkles" size={13} color={theme.colors.primaryDark} />
            <Text style={styles.heroTagText}>YOUR JOURNEY, YOUR WAY</Text>
          </View>
          <Text style={styles.heroTitle}>Let Morocco surprise you.</Text>
          <Text style={styles.heroDescription}>
            Tell our travel guide what you love. Discover a journey shaped around you.
          </Text>
          <AppButton
            label="Meet your AI Guide"
            icon="arrow-forward"
            onPress={() => router.push("/(tabs)/guide")}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionHeadingCopy}>
            <Text style={styles.sectionEyebrow}>START WITH WHAT YOU LOVE</Text>
            <Text style={styles.sectionTitle}>Explore by interest</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/(tabs)/discover")}
            style={styles.seeAll}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Ionicons name="arrow-forward" size={15} color={theme.colors.primary} />
          </Pressable>
        </View>

        <View style={styles.interestGrid}>
          {interests.map((interest) => (
            <Pressable
              key={interest.title}
              accessibilityRole="button"
              onPress={() => router.push("/(tabs)/discover")}
              style={({ pressed }) => [
                styles.interestCard,
                { backgroundColor: interest.tint },
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.interestIcon}>
                <Ionicons name={interest.icon} size={23} color={theme.colors.primaryDark} />
              </View>
              <Text style={styles.interestTitle}>{interest.title}</Text>
              <Ionicons name="arrow-up-right" size={15} color={theme.colors.primaryDark} />
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push("/(tabs)/map")}
        style={({ pressed }) => [styles.mapCard, pressed && styles.pressed]}
      >
        <View style={styles.mapCardIcon}>
          <Ionicons name="map-outline" size={22} color={theme.colors.primaryDark} />
        </View>
        <View style={styles.mapCardCopy}>
          <Text style={styles.mapCardEyebrow}>IRIFE SMART JOURNEY</Text>
          <Text style={styles.mapCardTitle}>See your next adventure on the map</Text>
          <Text style={styles.mapCardDescription}>Explore places and plan a route in one place.</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={theme.colors.primary} />
      </Pressable>

      <Text style={styles.footer}>A more thoughtful way to discover Morocco.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: theme.colors.primaryDark,
  },
  brandMarkText: {
    color: theme.colors.white,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: "900",
  },
  brandName: {
    color: theme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 2.2,
  },
  brandCaption: {
    marginTop: 2,
    color: theme.colors.secondary,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  settingsButton: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  intro: { gap: 8, paddingTop: 5 },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  title: {
    maxWidth: 330,
    color: theme.colors.ink,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  subtitle: {
    color: theme.colors.secondary,
    fontSize: 13,
    lineHeight: 20,
  },
  search: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 17,
    backgroundColor: theme.colors.surface,
  },
  searchText: { flex: 1, color: theme.colors.secondary, fontSize: 12 },
  hero: {
    minHeight: 250,
    overflow: "hidden",
    justifyContent: "center",
    padding: 21,
    borderRadius: 25,
    backgroundColor: theme.colors.hero,
  },
  heroOrb: {
    position: "absolute",
    width: 210,
    height: 210,
    top: -110,
    right: -65,
    borderRadius: 110,
    backgroundColor: "#245B50",
  },
  heroOrbSmall: {
    position: "absolute",
    width: 120,
    height: 120,
    right: 40,
    bottom: -78,
    borderRadius: 60,
    backgroundColor: "#1C4941",
  },
  heroContent: { alignItems: "flex-start", gap: 12 },
  heroTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.heroAccent,
  },
  heroTagText: {
    color: theme.colors.primaryDark,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  heroTitle: {
    maxWidth: 290,
    color: theme.colors.white,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "900",
  },
  heroDescription: {
    maxWidth: 290,
    color: "#D8E7E1",
    fontSize: 12,
    lineHeight: 19,
  },
  section: { gap: 14 },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionHeadingCopy: { gap: 4 },
  sectionEyebrow: {
    color: theme.colors.secondary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  sectionTitle: { color: theme.colors.ink, fontSize: 20, fontWeight: "900" },
  seeAll: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 5 },
  seeAllText: { color: theme.colors.primary, fontSize: 10, fontWeight: "900" },
  interestGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  interestCard: {
    width: "48%",
    minHeight: 112,
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: "space-between",
    padding: 13,
    borderRadius: 18,
  },
  interestIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  interestTitle: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  mapCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 15,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  mapCardIcon: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.softMint,
  },
  mapCardCopy: { flex: 1, gap: 4 },
  mapCardEyebrow: {
    color: theme.colors.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  mapCardTitle: {
    color: theme.colors.ink,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "900",
  },
  mapCardDescription: { color: theme.colors.secondary, fontSize: 10 },
  footer: {
    color: theme.colors.secondary,
    fontSize: 10,
    textAlign: "center",
    paddingBottom: 4,
  },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});
