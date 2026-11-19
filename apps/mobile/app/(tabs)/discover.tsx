import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { theme } from "../../src/theme";

const categories = [
  { id: "all", label: "All" },
  { id: "culture", label: "Culture" },
  { id: "nature", label: "Nature" },
  { id: "food", label: "Food" },
  { id: "adventure", label: "Adventure" },
];

export default function DiscoverScreen() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>FIND YOUR NEXT EXPERIENCE</Text>
        <Text style={styles.title}>Discover Morocco</Text>
        <Text style={styles.subtitle}>
          From hidden local moments to unforgettable places.
        </Text>
      </View>

      <Link href="/(tabs)/map" asChild>
        <Pressable style={({ pressed }) => [styles.search, pressed && styles.pressed]}>
          <Ionicons name="search-outline" size={19} color={theme.colors.primary} />
          <Text style={styles.searchText}>Where would you like to explore?</Text>
          <Ionicons name="arrow-forward" size={17} color={theme.colors.secondary} />
        </Pressable>
      </Link>

      <View style={styles.categories}>
        {categories.map((category) => {
          const selected = category.id === activeCategory;
          return (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setActiveCategory(category.id)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.editorialCard}>
        <View style={styles.editorialArt}>
          <View style={styles.sun} />
          <View style={styles.mountainBack} />
          <View style={styles.mountainFront} />
          <View style={styles.editorialTag}>
            <Text style={styles.editorialTagText}>IRIFE COLLECTION</Text>
          </View>
          <Ionicons name="compass" size={30} color={theme.colors.white} style={styles.artIcon} />
        </View>
        <View style={styles.editorialCopy}>
          <Text style={styles.editorialEyebrow}>CURATED FOR CURIOUS TRAVELLERS</Text>
          <Text style={styles.editorialTitle}>Morocco, beyond the expected.</Text>
          <Text style={styles.editorialDescription}>
            Handpicked places and local experiences will live here as the IRIFE catalogue launches.
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Explore by interest</Text>
        <Text style={styles.selectedCategory}>
          {categories.find((category) => category.id === activeCategory)?.label}
        </Text>
      </View>

      <View style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Ionicons name="albums-outline" size={24} color={theme.colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Your discovery feed is being prepared</Text>
        <Text style={styles.emptyDescription}>
          The IRIFE destination and experience catalogue is not connected yet. This is not an empty search result.
        </Text>
        <Link href="/(tabs)/map" asChild>
          <Pressable style={styles.mapLink}>
            <Text style={styles.mapLinkText}>Preview the Smart Map</Text>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
          </Pressable>
        </Link>
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
  search: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  searchText: {
    flex: 1,
    color: theme.colors.secondary,
    fontSize: 12,
  },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipSelected: {
    borderColor: theme.colors.primaryDark,
    backgroundColor: theme.colors.primaryDark,
  },
  chipText: { color: theme.colors.secondary, fontSize: 10, fontWeight: "800" },
  chipTextSelected: { color: theme.colors.white },
  editorialCard: {
    overflow: "hidden",
    borderRadius: 23,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  editorialArt: {
    height: 175,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E8E1D2",
  },
  sun: {
    position: "absolute",
    width: 74,
    height: 74,
    top: 24,
    right: 36,
    borderRadius: 37,
    backgroundColor: "#E4B77D",
  },
  mountainBack: {
    position: "absolute",
    width: 250,
    height: 150,
    left: -30,
    bottom: -92,
    borderRadius: 30,
    backgroundColor: "#9AB7A4",
    transform: [{ rotate: "-22deg" }],
  },
  mountainFront: {
    position: "absolute",
    width: 270,
    height: 145,
    right: -40,
    bottom: -92,
    borderRadius: 30,
    backgroundColor: "#426F62",
    transform: [{ rotate: "20deg" }],
  },
  editorialTag: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  editorialTagText: {
    color: theme.colors.primaryDark,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },
  artIcon: { position: "absolute", bottom: 18, right: 18 },
  editorialCopy: { padding: 17, gap: 7 },
  editorialEyebrow: {
    color: theme.colors.primary,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  editorialTitle: {
    color: theme.colors.ink,
    fontSize: 19,
    fontWeight: "900",
  },
  editorialDescription: {
    color: theme.colors.secondary,
    fontSize: 11,
    lineHeight: 17,
  },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { color: theme.colors.ink, fontSize: 17, fontWeight: "900" },
  selectedCategory: { color: theme.colors.primary, fontSize: 10, fontWeight: "800" },
  emptyCard: {
    alignItems: "flex-start",
    gap: 9,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  emptyIcon: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: theme.colors.softMint,
  },
  emptyTitle: { color: theme.colors.ink, fontSize: 14, fontWeight: "900" },
  emptyDescription: { color: theme.colors.secondary, fontSize: 11, lineHeight: 17 },
  mapLink: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  mapLinkText: { color: theme.colors.primary, fontSize: 11, fontWeight: "900" },
  pressed: { opacity: 0.78 },
});
