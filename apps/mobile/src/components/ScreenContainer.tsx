import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePreferences } from "../services/preferences/PreferencesProvider";
import { theme } from "../theme";

type ScreenContainerProps = PropsWithChildren<{ scroll?: boolean; padded?: boolean }>;

export function ScreenContainer({ children, scroll = true, padded = true }: ScreenContainerProps) {
  const { preferences } = usePreferences();
  const systemScheme = useColorScheme();
  const dark = (preferences.appearance === "system" ? systemScheme : preferences.appearance) === "dark";
  const direction: "rtl" | "ltr" = preferences.language === "ar" ? "rtl" : "ltr";
  const surface = dark ? "#101B19" : theme.colors.background;
  const contentStyle = [styles.content, { direction, backgroundColor: surface }, !padded && styles.unpadded];
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: surface }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={contentStyle}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flexGrow: 1, padding: theme.spacing.page, gap: theme.spacing.section },
  unpadded: { padding: 0 },
});
