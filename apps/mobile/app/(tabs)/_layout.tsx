import { Tabs } from "expo-router";
import { Pressable, Vibration, useColorScheme } from "react-native";
import { AnimatedTabIcon } from "../../src/components/AnimatedTabIcon";
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
          height: 82,
          marginHorizontal: 13,
          marginBottom: 8,
          paddingTop: 7,
          paddingBottom: 7,
          paddingHorizontal: 5,
          backgroundColor: dark ? "#28251F" : theme.colors.surface,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: dark ? "#4A4438" : theme.colors.border,
          borderRadius: 27,
          elevation: 15,
          shadowColor: "#302B25",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.14,
          shadowRadius: 18,
        },
        tabBarActiveTintColor: dark ? "#F3EBDD" : theme.colors.primaryDark,
        tabBarInactiveTintColor: dark ? "#B7AC99" : "#71695E",
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
          backgroundColor: dark ? "#211F19" : theme.colors.background,
        },
      }}
    >
      {tabs.map((tab) => {
        const translationKey =
          tab.route === "index" ? "home" :
          tab.route === "discover" ? "discover" :
          tab.route === "map" ? "map" :
          tab.route === "guide" ? "guide" : "profile";

        return (
          <Tabs.Screen
            key={tab.route}
            name={tab.route}
            options={{
              title: tab.isPortal ? "ITRI" : t(translationKey),
              tabBarLabel: tab.isPortal ? "ITRI" : t(translationKey),
              tabBarIcon: ({ color, focused }) => (
                <AnimatedTabIcon
                  icon={tab.icon}
                  activeIcon={tab.activeIcon}
                  color={color}
                  focused={focused}
                  isPortal={Boolean(tab.isPortal)}
                />
              ),
              tabBarButton: (props) => (
                <Pressable
                  {...props}
                  onPressIn={() => Vibration.vibrate(8)}
                />
              ),
            }}
          />
        );
      })}
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
