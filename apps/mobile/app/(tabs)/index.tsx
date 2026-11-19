import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { theme } from "../../src/theme";

const interests = [
  {
    icon: "🌊",
    title: "Coast & ocean",
    description: "Beaches, sea air and slow days",
    tint: "#E5F1F2",
  },
  {
    icon: "⛰️",
    title: "Mountains & nature",
    description: "Open landscapes and fresh air",
    tint: "#E9F0E7",
  },
  {
    icon: "🏛️",
    title: "Culture & heritage",
    description: "Architecture, craft and history",
    tint: "#F4E9DC",
  },
  {
    icon: "🍃",
    title: "Food & local life",
    description: "Flavours and everyday moments",
    tint: "#F0E9EF",
  },
];

function DiscoverLink({
  children,
  label,
  style,
}: {
  children: React.ReactNode;
  label: string;
  style?: object;
}) {
  return (
    <Link href="/discover" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [style, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    </Link>
  );
}

export default function HomeScreen() {
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
        <View style={styles.countryTag}>
          <Text style={styles.countryTagText}>MOROCCO</Text>
        </View>
      </View>

      <View style={styles.intro}>
        <Text style={styles.eyebrow}>YOUR NEXT STORY STARTS HERE</Text>
        <Text style={styles.title}>Find your kind of Morocco.</Text>
        <Text style={styles.subtitle}>
          Discover places, experiences and local moments worth travelling for.
        </Text>
      </View>

      <DiscoverLink label="Search destinations and experiences" style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <Text style={styles.searchText}>Where would you like to explore?</Text>
        <Text style={styles.searchArrow}>›</Text>
      </DiscoverLink>

      <View style={styles.hero}>
        <View style={styles.heroOrb} />
        <View style={styles.heroOrbSmall} />
        <View style={styles.heroContent}>
          <Text style={styles.heroKicker}>TRAVEL AT YOUR OWN PACE</Text>
          <Text style={styles.heroTitle}>A thousand ways to experience Morocco.</Text>
          <Text style={styles.heroDescription}>
            Start with what you love. We’ll help you find where it leads.
          </Text>
          <DiscoverLink label="Explore destinations and experiences" style={styles.heroButton}>
            <Text style={styles.heroButtonText}>Explore IRIFE</Text>
            <Text style={styles.heroButtonArrow}>→</Text>
          </DiscoverLink>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionEyebrow}>FOLLOW YOUR CURIOSITY</Text>
            <Text style={styles.sectionTitle}>Explore by interest</Text>
          </View>
          <DiscoverLink label="See all interests" style={styles.seeAll}>
            <Text style={styles.seeAllText}>See all</Text>
            <Text style={styles.seeAllArrow}>→</Text>
          </DiscoverLink>
        </View>

        <View style={styles.interestGrid}>
          {interests.map((interest) => (
            <DiscoverLink
              key={interest.title}
              label={`Explore ${interest.title}`}
              style={[styles.interestCard, { backgroundColor: interest.tint }]}
            >
              <Text style={styles.interestIcon}>{interest.icon}</Text>
              <Text style={styles.interestTitle}>{interest.title}</Text>
              <Text style={styles.interestDescription}>{interest.description}</Text>
            </DiscoverLink>
          ))}
        </View>
      </View>

      <View style={styles.footerCard}>
        <Text style={styles.footerEyebrow}>THE IRIFE WAY</Text>
        <Text style={styles.footerTitle}>Discover first. Choose with confidence.</Text>
        <Text style={styles.footerDescription}>
          Explore the catalogue, learn about each experience, and send a clear
          request when you find the right fit.
        </Text>
        <DiscoverLink label="Start discovering with IRIFE" style={styles.footerLink}>
          <Text style={styles.footerLinkText}>Start discovering</Text>
          <Text style={styles.footerLinkArrow}>→</Text>
        </DiscoverLink>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
  },
  brandMarkText: {
    color: theme.colors.white,
    fontSize: 27,
    lineHeight: 30,
    fontWeight: "800",
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
  countryTag: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#EAF1EF",
  },
  countryTagText: {
    color: theme.colors.primaryDark,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  intro: {
    gap: 9,
    paddingTop: 8,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.7,
  },
  title: {
    maxWidth: 330,
    color: theme.colors.ink,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  subtitle: {
    color: theme.colors.secondary,
    fontSize: 14,
    lineHeight: 22,
  },
  search: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 17,
    backgroundColor: theme.colors.surface,
  },
  searchIcon: {
    color: theme.colors.primary,
    fontSize: 27,
    lineHeight: 30,
  },
  searchText: {
    flex: 1,
    color: "#7C8C88",
    fontSize: 13,
  },
  searchArrow: {
    color: theme.colors.secondary,
    fontSize: 23,
  },
  hero: {
    minHeight: 260,
    overflow: "hidden",
    justifyContent: "center",
    padding: 22,
    borderRadius: 25,
    backgroundColor: theme.colors.ink,
  },
  heroOrb: {
    position: "absolute",
    width: 220,
    height: 220,
    top: -105,
    right: -60,
    borderRadius: 110,
    backgroundColor: "#24504A",
  },
  heroOrbSmall: {
    position: "absolute",
    width: 116,
    height: 116,
    right: 48,
    bottom: -75,
    borderRadius: 58,
    backgroundColor: "#1B3D39",
  },
  heroContent: {
    gap: 12,
  },
  heroKicker: {
    color: "#9DD8CD",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.6,
  },
  heroTitle: {
    maxWidth: 285,
    color: theme.colors.white,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
  },
  heroDescription: {
    maxWidth: 290,
    color: "#D7E5E0",
    fontSize: 13,
    lineHeight: 20,
  },
  heroButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 3,
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor: "#9DD8CD",
  },
  heroButtonText: {
    color: theme.colors.ink,
    fontSize: 12,
    fontWeight: "900",
  },
  heroButtonArrow: {
    color: theme.colors.ink,
    fontSize: 17,
    fontWeight: "700",
  },
  section: {
    gap: 15,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionEyebrow: {
    marginBottom: 5,
    color: theme.colors.secondary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.25,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 21,
    fontWeight: "900",
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
  },
  seeAllText: {
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  seeAllArrow: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  interestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
  },
  interestCard: {
    width: "48%",
    minHeight: 142,
    flexGrow: 1,
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 18,
  },
  interestIcon: {
    fontSize: 24,
  },
  interestTitle: {
    marginTop: 10,
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  interestDescription: {
    marginTop: 4,
    color: theme.colors.secondary,
    fontSize: 10,
    lineHeight: 15,
  },
  footerCard: {
    gap: 9,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
  },
  footerEyebrow: {
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  footerTitle: {
    color: theme.colors.ink,
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
  },
  footerDescription: {
    color: theme.colors.secondary,
    fontSize: 12,
    lineHeight: 19,
  },
  footerLink: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 5,
  },
  footerLinkText: {
    color: theme.colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  footerLinkArrow: {
    color: theme.colors.primaryDark,
    fontSize: 16,
  },
  pressed: {
    opacity: 0.78,
  },
});
