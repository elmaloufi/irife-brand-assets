import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useState } from "react";
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from '../../src/components/AppText';
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { theme } from "../../src/theme";

const categories = [
  { id: "all", label: "All", icon: "apps-outline" as const },
  { id: "experiences", label: "Experiences", icon: "sparkles-outline" as const },
  { id: "food", label: "Food", icon: "restaurant-outline" as const },
  { id: "heritage", label: "Heritage", icon: "business-outline" as const },
  { id: "nature", label: "Nature", icon: "leaf-outline" as const },
  { id: "essentials", label: "Essentials", icon: "medkit-outline" as const },
];

export default function MapScreen() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>EXPLORE MOROCCO</Text>
          <Text style={styles.title}>Smart Map</Text>
          <Text style={styles.subtitle}>
            Places, local experiences and routes — brought together by IRIFE.
          </Text>
        </View>
        <View style={styles.mapIcon}>
          <Ionicons name="map" size={22} color={theme.colors.primary} />
        </View>
      </View>

      <View style={styles.search}>
        <Ionicons name="search-outline" size={19} color={theme.colors.secondary} />
        <Text style={styles.searchText}>Search destinations and places</Text>
        <Ionicons name="options-outline" size={19} color={theme.colors.primary} />
      </View>

      <View style={styles.categoryList}>
        {categories.map((category) => {
          const selected = activeCategory === category.id;
          return (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setActiveCategory(category.id)}
              style={[styles.categoryChip, selected && styles.categoryChipSelected]}
            >
              <Ionicons
                name={category.icon}
                size={15}
                color={selected ? theme.colors.white : theme.colors.secondary}
              />
              <Text style={[styles.categoryText, selected && styles.categoryTextSelected]}>
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.mapPreview}>
        <View style={styles.roadOne} />
        <View style={styles.roadTwo} />
        <View style={styles.roadThree} />
        <View style={styles.parkOne} />
        <View style={styles.parkTwo} />
        <View style={styles.water} />
        <View style={styles.previewLabel}>
          <Ionicons name="layers-outline" size={13} color={theme.colors.primaryDark} />
          <Text style={styles.previewLabelText}>MAP PREVIEW</Text>
        </View>
        <View style={[styles.pin, styles.pinOne]}>
          <Ionicons name="location" size={27} color={theme.colors.primary} />
        </View>
        <View style={[styles.pin, styles.pinTwo]}>
          <Ionicons name="location" size={25} color="#B57A43" />
        </View>
        <View style={[styles.pin, styles.pinThree]}>
          <Ionicons name="location" size={25} color="#4F7894" />
        </View>
        <View style={styles.mapNotice}>
          <Ionicons name="information-circle-outline" size={17} color={theme.colors.primaryDark} />
          <Text style={styles.mapNoticeText}>
            Google Maps will appear here after secure API setup.
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionEyebrow}>DISCOVER WITH IRIFE</Text>
          <Text style={styles.sectionTitle}>Explore by category</Text>
        </View>
        <Text style={styles.selectedCount}>
          {categories.find((item) => item.id === activeCategory)?.label}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <Ionicons name="compass-outline" size={22} color={theme.colors.primary} />
        </View>
        <View style={styles.infoCopy}>
          <Text style={styles.infoTitle}>Your map is being prepared</Text>
          <Text style={styles.infoDescription}>
            IRIFE will combine Google public places with our own verified experiences. No location access is requested on this screen.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerCopy: { flex: 1, gap: 7 },
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
    lineHeight: 19,
  },
  mapIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: theme.colors.softMint,
  },
  search: {
    minHeight: 52,
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
  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    minHeight: 37,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  categoryText: {
    color: theme.colors.secondary,
    fontSize: 10,
    fontWeight: "800",
  },
  categoryTextSelected: { color: theme.colors.white },
  mapPreview: {
    height: 280,
    overflow: "hidden",
    position: "relative",
    borderRadius: 24,
    backgroundColor: "#E8E9DD",
  },
  roadOne: {
    position: "absolute",
    width: "130%",
    height: 24,
    top: 90,
    left: -25,
    borderRadius: 30,
    backgroundColor: "#FAF8F2",
    transform: [{ rotate: "-17deg" }],
  },
  roadTwo: {
    position: "absolute",
    width: "120%",
    height: 18,
    top: 175,
    left: -15,
    borderRadius: 30,
    backgroundColor: "#FAF8F2",
    transform: [{ rotate: "24deg" }],
  },
  roadThree: {
    position: "absolute",
    width: 19,
    height: "130%",
    top: -25,
    left: "57%",
    borderRadius: 30,
    backgroundColor: "#FAF8F2",
    transform: [{ rotate: "21deg" }],
  },
  parkOne: {
    position: "absolute",
    width: 110,
    height: 75,
    top: 20,
    left: 22,
    borderRadius: 28,
    backgroundColor: "#D1E2CB",
    transform: [{ rotate: "-13deg" }],
  },
  parkTwo: {
    position: "absolute",
    width: 120,
    height: 82,
    right: 5,
    bottom: 25,
    borderRadius: 28,
    backgroundColor: "#D3E4CD",
    transform: [{ rotate: "17deg" }],
  },
  water: {
    position: "absolute",
    width: 95,
    height: 40,
    top: 130,
    right: -20,
    borderRadius: 40,
    backgroundColor: "#D0E4E8",
    transform: [{ rotate: "-20deg" }],
  },
  previewLabel: {
    position: "absolute",
    top: 13,
    left: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  previewLabelText: {
    color: theme.colors.primaryDark,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  pin: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.9)",
    elevation: 4,
  },
  pinOne: { top: 87, left: "43%" },
  pinTwo: { top: 165, left: "19%" },
  pinThree: { top: 44, right: "18%" },
  mapNotice: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 11,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  mapNoticeText: {
    flex: 1,
    color: theme.colors.primaryDark,
    fontSize: 10,
    fontWeight: "700",
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionEyebrow: {
    color: theme.colors.secondary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  sectionTitle: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "900",
  },
  selectedCount: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: "800",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: theme.colors.softMint,
  },
  infoCopy: { flex: 1, gap: 5 },
  infoTitle: {
    color: theme.colors.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  infoDescription: {
    color: theme.colors.secondary,
    fontSize: 11,
    lineHeight: 17,
  },
});
