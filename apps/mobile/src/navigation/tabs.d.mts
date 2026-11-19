import { Ionicons } from "@react-native-vector-icons/ionicons";

export type PrimaryTab = {
  route: "index" | "discover" | "map" | "guide" | "profile";
  title: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  activeIcon: React.ComponentProps<typeof Ionicons>["name"];
};

export const tabs: readonly PrimaryTab[];
