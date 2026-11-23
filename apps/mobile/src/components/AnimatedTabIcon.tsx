import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import type { ComponentProps } from "react";
import { ITRIPortalIcon } from "./ITRIPortalIcon";
import { theme } from "../theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

type AnimatedTabIconProps = {
  icon: IconName;
  activeIcon: IconName;
  focused: boolean;
  color: string;
  isPortal?: boolean;
};

export function AnimatedTabIcon({
  icon,
  activeIcon,
  focused,
  color,
  isPortal = false,
}: AnimatedTabIconProps) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    const animation = Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      damping: 16,
      stiffness: 190,
      mass: 0.72,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [focused, progress]);

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, isPortal ? 1.12 : 1.08],
  });
  const lift = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  const iconColor = color;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: lift }, { scale }] },
      ]}
    >
      <View
        style={[
          styles.iconShell,
          focused && styles.iconShellFocused,
          {
            backgroundColor: focused
              ? "rgba(197, 163, 107, 0.18)"
              : "transparent",
          },
        ]}
      >
        {isPortal ? (
          <ITRIPortalIcon color={focused ? theme.colors.gold : iconColor} focused={focused} size={25} />
        ) : (
          <Ionicons
            name={focused ? activeIcon : icon}
            size={22}
            color={iconColor}
          />
        )}
      </View>
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            opacity: progress,
            transform: [{ scaleX: progress }],
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  iconShell: {
    width: 43,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
  },
  iconShellFocused: {
    shadowColor: theme.colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.24,
    shadowRadius: 6,
    elevation: 2,
  },
  activeIndicator: {
    width: 12,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.gold,
  },
});
