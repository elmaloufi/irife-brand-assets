import type { ComponentProps } from "react";
import { Ionicons } from "@react-native-vector-icons/ionicons";

export type PrimaryTab = {
  route: "index" | "discover" | "map" | "guide" | "profile";
  title: string;
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  activeIcon: ComponentProps<typeof Ionicons>["name"];
};

export const tabs: readonly PrimaryTab[];
