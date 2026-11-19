import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { theme } from "../theme";

type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
}>;

export function ScreenContainer({
  children,
  scroll = true,
  padded = true,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, !padded && styles.unpadded]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, !padded && styles.unpadded]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.page,
    gap: theme.spacing.section,
  },
  unpadded: {
    padding: 0,
  },
});
