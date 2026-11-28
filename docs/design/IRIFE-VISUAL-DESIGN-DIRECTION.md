# IRIFE Visual Design Direction

**Status:** Approved implementation direction  
**Updated:** 23 November 2026  
**Design system:** Moroccan Luxury × Desert Earth

## Product expression

IRIFE should feel like a premium Moroccan travel companion: contemporary, calm, culturally grounded, and clear for international visitors. The interface should use Moroccan architectural geometry as a restrained signature rather than decorative wallpaper.

## Approved brand decisions

- Navigation: **Moroccan Luxury** floating tab bar.
- Palette: **Desert Earth**.
- Destination presentation: **Luxury Destination Cards**.
- Motion: cinematic, expressive transitions with reduced-motion support.
- Iconography: **Hybrid Royal + Moroccan** — professional Ionicons for familiar actions and custom geometric marks for brand-specific actions.
- ITRI mark: custom Moroccan portal/arch symbol.
- Five primary destinations remain available: Home, Discover, ITRI, Smart Map, and Account. Requests remain an account destination and not a sixth primary tab.

## Desert Earth color tokens

| Token | Value | Usage |
|---|---|---|
| Sand background | #F3EBDD | Main light canvas |
| Warm ivory | #FFFCF6 | Cards and elevated surfaces |
| Surface muted | #E9E0D0 | Quiet panels |
| Soft olive | #E8E7D9 | Secondary controls |
| Olive | #727653 | Brand accents and icon surfaces |
| Primary olive | #656B49 | Accessible text and primary actions |
| Dark earth | #454633 | Hero surfaces and strong emphasis |
| Terracotta | #B96D50 | Selective cultural accent |
| Desert gold | #C5A36B | Small highlights and active indicators |
| Main text | #302B25 | Primary text |
| Secondary text | #6F675B | Supporting text |
| Warm border | #DED4C3 | Card and control borders |

Gold and terracotta are accents, not body-text colors. Keep normal text contrast at or above 4.5:1 where WCAG applies. Use the darker olive token for text rather than the decorative olive token when needed.

## Navigation and iconography

- Keep exactly five primary tabs and preserve every existing route.
- Place ITRI in the central tab position.
- Use a custom Moroccan portal mark for ITRI, built with native React Native primitives to avoid adding an unverified native dependency.
- Use Ionicons for familiar navigation symbols: home, compass, map, and account.
- Animate focused icons with a restrained spring, lift, and active indicator.
- Keep visible labels; never rely on icon shape or color alone.
- Provide accessible tab labels and state.
- Use a short, low-intensity touch vibration where supported.
- Respect reduced-motion preferences in the full motion pass; avoid continuous pulsing or flashing.

## Destination cards

- Use a clear editorial hierarchy: destination name, region, and verified summary.
- Keep large touch targets, warm surfaces, soft borders, and restrained elevation.
- Do not invent destination photos, ratings, reviews, or availability.
- The current DestinationSummary contract does not contain destination media. Use a restrained architectural treatment until a reviewed, licensed destination-media field and verified assets are available.
- Experience cards may display only media returned by the existing API, with alt text where provided.

## Motion and performance

- Use React Native Animated for tab focus feedback in this first pass.
- Keep animations short and state-driven.
- Avoid continuous background animation.
- Do not add a native animation or image dependency without checking the Expo SDK compatibility matrix.
- Add full shared-element transitions only after a compatible implementation is validated on the physical Expo Go runtime.

## Accessibility and localization

- Keep all five tab labels visible.
- Preserve the Requests route under the account flow.
- Keep touch targets comfortable and labels descriptive.
- Preserve Arabic RTL and LTR layout behavior.
- Test screen-reader labels, focus order, contrast, and system reduced-motion preferences before release.

## Implementation boundaries

This visual pass changes shared theme tokens, tab presentation, the custom ITRI portal icon, and Home destination-card styling. It does not claim that ITRI AI, live map tiles, shared-element transitions, destination photography, or full dynamic dark-theme coverage are complete. Those require separate service, content, dependency, and device validation.

## Acceptance criteria

- The five existing tab routes remain functional.
- ITRI occupies the central tab without removing Smart Map.
- Requests remains reachable from the account flow.
- The custom portal icon renders without an additional native SVG package.
- The active tab is distinguishable by shape, position, indicator, and label—not color alone.
- Home destination cards display only API-provided destination names, regions, and summaries.
- Existing authentication and API flows remain unchanged.
- CI passes and Android/iOS device validation is recorded before merge.
