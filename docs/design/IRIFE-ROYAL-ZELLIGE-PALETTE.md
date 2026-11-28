# IRIFE Royal Zellige Visual Update

**Status:** Implemented on `feat/irife-royal-zellige-palette`; awaiting CI and Expo Go validation.  
**Design direction:** Desert Earth × Moroccan Royal Zellige.

## Palette strategy

Desert Earth remains the editorial foundation: warm ivory, sand, terracotta, soft mint and charcoal-green typography are retained. The royal layer adds:

| Token | Hex | Intended use |
|---|---|---|
| Teal | #0F4C5C | Primary actions, selected controls and brand accents |
| Deep forest | #062F25 | Hero surfaces and high-emphasis brand areas |
| Peach | #F7D7B8 | Warm highlights and hero labels |
| Peach soft | #FBE9D9 | Quiet highlighted surfaces |
| Champagne | #D9B66F | Fine borders, icon highlights and ornament |
| Zellige muted | rgba(217,182,111,0.22) | Restrained decorative geometry |

Existing Desert Earth tokens such as warm ivory, sand, terracotta and soft mint remain available to avoid breaking screens that already consume them.

## Motif rules

- Use Moroccan zellige geometry as a small ornamental accent, not as a full-screen texture.
- Keep ornaments behind content and outside interactive hit areas.
- The shared `ZelligeOrnament` component is decorative and hidden from accessibility traversal.
- Keep motion restrained; no continuous animation or additional native dependency is introduced.

## Current implementation scope

- Shared mobile theme tokens updated in `apps/mobile/src/theme.ts`.
- Lightweight reusable zellige ornament added at `apps/mobile/src/components/ZelligeOrnament.tsx`.
- Home hero updated to deep forest with teal/champagne accents and a zellige detail.
- Existing routes, API calls, tab navigation, and data-loading behavior are unchanged.

## Validation still required

- Run workspace tests and mobile TypeScript typecheck on the feature branch.
- Confirm installed Expo SDK compatibility in the working checkout; this visual change intentionally does not alter Expo dependencies.
- Open the app in Expo Go on a physical Android device and inspect layout, text contrast, RTL/LTR behavior, and touch targets.
- Do not merge to `main` until CI and device validation pass.

## Accessibility

Color contrast must be measured on actual foreground/background pairs before release. Target WCAG 2.2 AA: at least 4.5:1 for normal text and 3:1 for large text and essential UI boundaries where applicable. Gold and peach are accent colors, not default body-text colors.
