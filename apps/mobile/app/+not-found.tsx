import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "../src/theme";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Page not found</Text>
      <Link href="/" style={styles.link}>
        Return to IRIFE
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  code: {
    color: theme.colors.primary,
    fontSize: 42,
    fontWeight: "800",
  },
  title: {
    color: theme.colors.ink,
    fontSize: 20,
    fontWeight: "700",
  },
  link: {
    color: theme.colors.primaryDark,
    fontWeight: "700",
    marginTop: 8,
  },
});
