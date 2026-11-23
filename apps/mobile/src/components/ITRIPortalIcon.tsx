import { StyleSheet, View } from "react-native";

type ITRIPortalIconProps = {
  color: string;
  focused: boolean;
  size?: number;
};

/**
 * Compact Moroccan arch mark for the ITRI tab.
 * Built from native views so it works in the existing Expo Go runtime
 * without adding another native SVG dependency.
 */
export function ITRIPortalIcon({ color, focused, size = 24 }: ITRIPortalIconProps) {
  const strokeWidth = focused ? 2 : 1.55;

  return (
    <View
      accessible={false}
      style={[styles.root, { width: size, height: size }]}
    >
      <View
        style={[
          styles.outerArch,
          {
            width: size * 0.72,
            height: size * 0.72,
            borderColor: color,
            borderWidth: strokeWidth,
            borderBottomWidth: 0,
            borderTopLeftRadius: size * 0.38,
            borderTopRightRadius: size * 0.38,
          },
        ]}
      >
        <View
          style={[
            styles.innerArch,
            {
              width: size * 0.34,
              height: size * 0.43,
              borderColor: color,
              borderWidth: Math.max(1, strokeWidth - 0.45),
              borderBottomWidth: 0,
              borderTopLeftRadius: size * 0.2,
              borderTopRightRadius: size * 0.2,
            },
          ]}
        />
      </View>
      <View
        style={[
          styles.keystone,
          {
            width: size * 0.16,
            height: size * 0.16,
            backgroundColor: color,
            top: size * 0.035,
          },
        ]}
      />
      <View
        style={[
          styles.base,
          {
            width: size * 0.78,
            height: strokeWidth,
            backgroundColor: color,
            bottom: size * 0.12,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
  },
  outerArch: {
    position: "absolute",
    bottom: 3,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  innerArch: {
    marginBottom: 0,
  },
  keystone: {
    position: "absolute",
    borderRadius: 1,
    transform: [{ rotate: "45deg" }],
  },
  base: {
    position: "absolute",
    borderRadius: 2,
  },
});
