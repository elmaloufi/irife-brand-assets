import { Tabs } from "expo-router";
import { theme } from "../../src/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.ink,
        headerTitleStyle: { fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingTop: 7,
          paddingBottom: 7,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.secondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarLabel: "Home" }} />
      <Tabs.Screen name="discover" options={{ title: "Discover", tabBarLabel: "Discover" }} />
      <Tabs.Screen name="requests" options={{ title: "Requests", tabBarLabel: "Requests" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarLabel: "Profile" }} />
    </Tabs>
  );
}
