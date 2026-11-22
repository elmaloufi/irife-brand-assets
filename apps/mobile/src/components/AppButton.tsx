import { Ionicons } from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText as Text } from './AppText';
import { theme } from "../theme";

type IconName = ComponentProps<typeof Ionicons>["name"];
type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive" | "icon";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  accessibilityLabel?: string;
  disabled?: boolean;
};

export function AppButton({
  label,
  onPress,
  variant = "primary",
  icon,
  accessibilityLabel,
  disabled = false,
}: AppButtonProps) {
  const iconOnly = variant === "icon";
  const accessibleName = accessibilityLabel ?? label;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibleName}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        iconOnly && styles.iconOnly,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={iconOnly ? 21 : 17}
          color={variant === "primary" ? theme.colors.white : variant === "destructive" ? theme.colors.danger : theme.colors.primaryDark}
        />
      ) : null}
      {iconOnly ? (
        <View style={styles.iconLabel}>
          <Text style={styles.iconLabelText}>{accessibleName}</Text>
        </View>
      ) : (
        <Text style={[styles.label, variant === "primary" && styles.primaryLabel, variant === "destructive" && styles.destructiveLabel]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: theme.radius.button,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.softMint,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tertiary: {
    backgroundColor: "transparent",
  },
  destructive: {
    backgroundColor: theme.colors.dangerSoft,
  },
  icon: {
    width: 46,
    height: 46,
    minHeight: 46,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  iconOnly: {
    width: 46,
    paddingHorizontal: 0,
  },
  label: {
    color: theme.colors.primaryDark,
    fontSize: 13,
    fontWeight: "800",
  },
  primaryLabel: {
    color: theme.colors.white,
  },
  destructiveLabel: {
    color: theme.colors.danger,
  },
  iconLabel: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  iconLabelText: {
    fontSize: 1,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
});
