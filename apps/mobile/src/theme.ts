export const theme = {
  colors: {
    // Desert Earth remains the warm editorial foundation.
    background: "#F8F6F0",
    surface: "#FFFFFF",
    surfaceMuted: "#E9F1EB",
    softMint: "#E2EFE8",
    sand: "#E8D7BD",
    ink: "#213531",
    secondary: "#5E7069",

    // Royal Moroccan layer: teal, deep forest, peach and champagne.
    primary: "#0F4C5C",
    primaryDark: "#062F25",
    forest: "#062F25",
    teal: "#0F4C5C",
    deepForest: "#062F25",
    peach: "#F7D7B8",
    peachSoft: "#FBE9D9",
    champagne: "#D9B66F",
    zelligeLine: "#D9B66F",
    zelligeMuted: "rgba(217,182,111,0.22)",

    border: "#E8E3D8",
    white: "#FFFFFF",
    danger: "#B5413A",
    dangerSoft: "#F8E9E6",
    hero: "#062F25",
    heroAccent: "#F7D7B8",

    // Existing Desert Earth accents are intentionally retained.
    terracotta: "#B66D50",
    terracottaSoft: "#F3E5DC",
    gold: "#D9B66F",
    ocean: "#5E8990",
  },
  radius: {
    small: 13,
    button: 17,
    card: 24,
    large: 30,
    pill: 999,
  },
  spacing: {
    page: 20,
    section: 24,
    card: 16,
    compact: 8,
  },
  typography: {
    eyebrow: 10,
    body: 14,
    title: 30,
    sectionTitle: 21,
  },
} as const;
