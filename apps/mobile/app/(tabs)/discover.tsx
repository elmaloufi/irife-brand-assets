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
          <View style={styles.searchAction}>
            <Ionicons name="arrow-forward" size={15} color={theme.colors.white} />
          </View>
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
          <View style={styles.archOuter}>
            <View style={styles.archInner}>
              <View style={styles.archDoor}>
                <View style={styles.archDoorGlow} />
              </View>
            </View>
          </View>
          <View pointerEvents="none" style={styles.tileMotif}>
            <View style={styles.tileDiamond} />
            <View style={styles.tileDiamondOffset} />
            <View style={styles.tileDiamond} />
            <View style={styles.tileDiamondOffset} />
          </View>
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
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingLeft: 15,
    paddingRight: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  searchText: {
    flex: 1,
    color: theme.colors.secondary,
    fontSize: 12,
  },
  searchAction: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 14,
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
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.055,
    shadowRadius: 15,
    elevation: 2,
  },
  editorialArt: {
    height: 194,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E9D8C4",
  },
  sun: {
    position: "absolute",
    width: 78,
    height: 78,
    top: 23,
    right: 34,
    borderRadius: 39,
    backgroundColor: theme.colors.gold,
    opacity: 0.92,
  },
  archOuter: {
    position: "absolute",
    width: 166,
    height: 238,
    left: "33%",
    bottom: -100,
    alignItems: "center",
    paddingTop: 15,
    borderTopLeftRadius: 85,
    borderTopRightRadius: 85,
    backgroundColor: theme.colors.terracotta,
  },
  archInner: {
    width: 136,
    height: 215,
    alignItems: "center",
    paddingTop: 18,
    borderTopLeftRadius: 70,
    borderTopRightRadius: 70,
    backgroundColor: "#F4E9D9",
  },
  archDoor: {
    width: 78,
    height: 145,
    alignItems: "center",
    paddingTop: 21,
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    backgroundColor: theme.colors.primaryDark,
  },
  archDoorGlow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(230,197,143,0.6)",
    backgroundColor: "rgba(230,197,143,0.12)",
  },
  tileMotif: {
    position: "absolute",
    top: 62,
    left: 24,
    width: 68,
    height: 68,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    opacity: 0.8,
  },
  tileDiamond: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "rgba(20,62,55,0.45)",
    borderRadius: 3,
    transform: [{ rotate: "45deg" }],
  },
  tileDiamondOffset: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "rgba(182,109,80,0.72)",
    borderRadius: 3,
    transform: [{ rotate: "45deg" }],
  },
  editorialTag: {
    position: "absolute",
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.92)",
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
    borderRadius: 21,
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
  mapLink: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2, minHeight: 40 },
  mapLinkText: { color: theme.colors.primary, fontSize: 11, fontWeight: "900" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});
