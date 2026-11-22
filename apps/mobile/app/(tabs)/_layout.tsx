import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Tabs } from "expo-router";
import { StyleSheet, View, useColorScheme } from "react-native";
import { usePreferences } from "../../src/services/preferences/PreferencesProvider";
import { translate } from "../../src/services/preferences/locale.mjs";
import { tabs } from "../../src/navigation/tabs.mjs";
import { theme } from "../../src/theme";

export default function TabLayout() {
  const { preferences } = usePreferences();
  const systemScheme = useColorScheme();
  const dark = (preferences.appearance === "system" ? systemScheme : preferences.appearance) === "dark";
  const t = (key: string) => translate(preferences.language, key);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 78,
          marginHorizontal: 13,
          marginBottom: 8,
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 5,
          backgroundColor: dark ? "#182724" : theme.colors.surface,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: dark ? "#2B3D38" : theme.colors.border,
          borderRadius: 26,
          elevation: 15,
          shadowColor: theme.colors.primaryDark,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 18,
        },
        tabBarActiveTintColor: dark ? "#D6E8DF" : theme.colors.primaryDark,
        tabBarInactiveTintColor: "#89948F",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: 2,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          borderRadius: 18,
          paddingTop: 1,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
        tabBarHideOnKeyboard: true,
        sceneStyle: {
          backgroundColor: dark ? "#101B19" : theme.colors.background,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.route}
          name={tab.route}
          options={{
            title: t(tab.route === "index" ? "home" : tab.route === "discover" ? "discover" : tab.route === "map" ? "map" : tab.route === "guide" ? "guide" : "profile"),
            tabBarLabel: t(tab.route === "index" ? "home" : tab.route === "discover" ? "discover" : tab.route === "map" ? "map" : tab.route === "guide" ? "guide" : "profile"),
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.iconShell, focused && styles.iconShellActive, { backgroundColor: dark ? "#29433B" : theme.colors.softMint }]}>
                <Ionicons
                  name={focused ? tab.activeIcon : tab.icon}
                  size={21}
                  color={color}
                />
                {focused ? <View style={styles.activeSpark} /> : null}
              </View>
            ),
          }}
        />
      ))}
      <Tabs.Screen
        name="requests"
        options={{
          href: null,
          title: "Requests",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconShell: {
    width: 46,
    height: 33,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  iconShellActive: {
    backgroundColor: theme.colors.softMint,
  },
  activeSpark: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.gold,
  },
});
