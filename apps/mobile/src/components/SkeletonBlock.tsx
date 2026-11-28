import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, StyleSheet, type DimensionValue, type ViewStyle } from "react-native";
import { theme } from "../theme";

type SkeletonBlockProps = {
  width: DimensionValue;
  height: number;
  radius?: number;
  style?: ViewStyle;
};

export function SkeletonBlock({ width, height, radius = 14, style }: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.72)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(0.72);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 760, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.58, duration: 760, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View
      accessible={false}
      style={[
        styles.block,
        { width, height, borderRadius: radius, opacity },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: theme.colors.surfaceMuted,
  },
});
