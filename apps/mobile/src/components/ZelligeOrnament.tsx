import { StyleSheet, View } from "react-native";
import { theme } from "../theme";

type ZelligeOrnamentProps = {
  size?: number;
  opacity?: number;
};

export function ZelligeOrnament({ size = 112, opacity = 0.42 }: ZelligeOrnamentProps) {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.frame, { width: size, height: size, opacity }]}
    >
      <View style={[styles.outer, { borderColor: theme.colors.zelligeLine }]} />
      <View style={[styles.inner, { borderColor: theme.colors.zelligeLine }]} />
      <View style={[styles.center, { backgroundColor: theme.colors.peach }]} />
      <View style={[styles.axis, { backgroundColor: theme.colors.zelligeLine }]} />
      <View style={[styles.axisVertical, { backgroundColor: theme.colors.zelligeLine }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  outer: {
    position: "absolute",
    width: "72%",
    height: "72%",
    borderWidth: 1.5,
    transform: [{ rotate: "45deg" }],
  },
  inner: {
    position: "absolute",
    width: "48%",
    height: "48%",
    borderWidth: 1,
    transform: [{ rotate: "0deg" }],
  },
  center: {
    width: "13%",
    height: "13%",
    transform: [{ rotate: "45deg" }],
  },
  axis: {
    position: "absolute",
    width: "86%",
    height: 1,
  },
  axisVertical: {
    position: "absolute",
    width: 1,
    height: "86%",
  },
});
