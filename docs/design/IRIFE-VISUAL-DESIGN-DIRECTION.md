# IRIFE Visual Design Direction

**Status:** Proposed visual direction for the mobile experience  
**Date:** 19 November 2026  
**Working name:** Moroccan Boutique Travel

## Design intent

IRIFE should feel like a welcoming, premium travel companion: culturally rooted in Morocco, contemporary in its interface, and easy to understand for an international visitor using the app for the first time.

The experience should create curiosity without making the interface noisy. Visual personality comes from warm surfaces, deep green, restrained terracotta and saffron accents, distinctive destination storytelling, and purposeful interaction feedback.

## Research synthesis

- Google's Material 3 Expressive research describes color, shape, size, motion, and containment as tools for communicating hierarchy and directing attention. Expressive treatment should reinforce the task rather than decorate every control.
- A tourism-interface study published in *Information Systems Frontiers* on 15 July 2026 interviewed 27 travel-app users. It highlights intuitive navigation, visual consistency, simplicity, interactivity, clarity, and reduced cognitive load as important contributors to expected service quality and enjoyment.
- Apple's tab-bar guidance recommends clear labels, a limited set of primary destinations, and using the tab bar for navigation rather than actions.
- WCAG 2.2 AA specifies at least 4.5:1 contrast for normal text and a 24 by 24 CSS-pixel minimum pointer target, subject to its stated exceptions. IRIFE should aim beyond the minimum for primary mobile controls.

## Visual language

### Palette

| Token | Value | Role |
|---|---|---|
| Warm ivory | #F8F6F0 | Main canvas |
| White | #FFFFFF | Cards and elevated surfaces |
| Deep forest | #143E37 | Brand anchor and hero surfaces |
| Emerald | #177767 | Primary actions and selected states |
| Soft mint | #E2EFE8 | Quiet highlights and active navigation |
| Sand | #E8D7BD | Warm neutral |
| Terracotta | #B66D50 | Selective cultural accent |
| Saffron gold | #D7AF6E | Small highlights and decorative details |
| Charcoal green | #213531 | Main text |
| Muted green-grey | #657670 | Secondary text |

Use gold and terracotta as accents, not as competing primary colors. Keep body text on light surfaces and use white text only on sufficiently dark hero surfaces.

### Shape and depth

- Use rounded cards with a consistent 20–25 px visual radius.
- Use a soft elevation and thin warm border rather than heavy black shadows.
- Keep the bottom tab bar floating visually above the app canvas, with a clear selected state and visible text labels.
- Use Moroccan geometric motifs sparingly as small ornamental details, never as backgrounds behind important text.

### Typography and layout

- Use a clear hierarchy: one main screen heading, concise supporting copy, then task-focused sections.
- Keep labels short and descriptive; do not rely on icons alone.
- Use consistent spacing tokens and preserve comfortable scrolling on smaller Android devices.
- Keep layouts ready for Arabic RTL and French localization; verify mirrored direction before releasing either localized interface.

## Screen principles

- **Home:** one clear invitation to discover Morocco, a prominent search entry, one featured guide action, and a compact set of interest categories.
- **Discover:** editorial storytelling and categories; destination photographs will become the primary visual asset once a licensed catalogue is connected.
- **Map:** map controls and location actions must remain distinct from decorative map preview artwork. Do not request location until the user explicitly activates a location feature.
- **AI Guide:** make the guide feel conversational and welcoming, but clearly distinguish sample prompts from real AI responses until the secure service is connected.
- **Account and Settings:** calm, predictable rows with clear destinations and no decorative treatment that looks like a persisted setting when it is not.

## Motion and interaction

- Use short press feedback and restrained transitions only where they clarify state changes.
- Give the selected tab an obvious but quiet visual treatment.
- Avoid continuous background animation, flashing effects, or motion that delays access to key actions.
- Respect reduced-motion preferences when motion is added.
- Do not add haptics or animation packages until there is a tested use case and a clear performance benefit.

## Photography and content integrity

The current illustrated shapes are placeholders for the visual language, not real destination imagery. Before launch, use a reviewed media library with documented usage rights, accurate place captions, useful alt text, and optimized image sizes. Do not invent review scores, live availability, prices, routes, or nearby-place claims.

## Acceptance criteria

- The five main destinations remain visible and labelled.
- The selected tab is distinguishable without relying on color alone.
- Primary actions have comfortable touch areas and accessible labels.
- Normal text aims for at least 4.5:1 contrast.
- Decorative motifs do not reduce text legibility or conceal controls.
- No new paid SDK, remote image dependency, API key, backend claim, or production integration is introduced by this visual pass.

## References

- Google Design, *Expressive Design: Google's UX Research*: https://design.google/library/expressive-material-design-google-research
- Apple Human Interface Guidelines, *Tab bars*: https://developer.apple.com/design/human-interface-guidelines/tab-bars
- W3C, *Web Content Accessibility Guidelines (WCAG) 2.2*: https://www.w3.org/TR/WCAG22/
- Selem, K. M. (15 July 2026), *Shaping the Journey: How GenAI-enabled Mobile Interfaces Transform Visitor Experiences in Tourism Contexts*, Information Systems Frontiers: https://link.springer.com/article/10.1007/s10796-026-10786-4
- Visual mood references (conceptual inspiration only): https://dribbble.com/shots/14242736-Visit-Morocco-Travel-Mobile-App and https://dribbble.com/shots/11895432-Discover-Morocco-UI-App
