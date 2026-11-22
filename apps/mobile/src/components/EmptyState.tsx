import { StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';
import { theme } from "../theme";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.marker} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "flex-start",
    padding: 22,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: 10,
  },
  marker: {
    width: 38,
    height: 5,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  title: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: "700",
  },
  description: {
    color: theme.colors.secondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
