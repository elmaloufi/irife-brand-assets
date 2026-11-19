import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { EmptyState } from "../../src/components/EmptyState";
import { ScreenContainer } from "../../src/components/ScreenContainer";
import { theme } from "../../src/theme";

export default function HomeScreen() {
  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>IRIFE · MOROCCO</Text>
        <Text style={styles.title}>Discover Morocco, your way.</Text>
        <Text style={styles.description}>
          Explore destinations, find experiences, and send a clear request to
          the people who provide them.
        </Text>
        <Link href="/discover" asChild>
          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Explore IRIFE</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>THE FOUNDATION</Text>
        <EmptyState
          title="Built around real information"
          description="Destination and experience listings will be connected to the catalogue API. This foundation does not display invented providers, ratings, prices, or availability."
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: theme.colors.ink,
    gap: 16,
  },
  eyebrow: {
    color: "#9DD8CD",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  title: {
    color: theme.colors.white,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
  },
  description: {
    color: "#D7E5E0",
    fontSize: 15,
    lineHeight: 23,
  },
  button: {
    alignSelf: "flex-start",
    backgroundColor: "#9DD8CD",
    borderRadius: theme.radius.button,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: theme.colors.ink,
    fontWeight: "800",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: theme.colors.secondary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
  },
});
