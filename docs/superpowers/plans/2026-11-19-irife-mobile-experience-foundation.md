# IRIFE Mobile Experience Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the first coherent mobile experience layer for IRIFE: five-icon navigation, refined visual tokens, and usable Home, Discover, Map, AI Guide, Account, and Settings screens without pretending that unimplemented APIs or paid services are live.

**Architecture:** Keep Expo Router as the navigation source of truth. Add a small shared design system and reusable UI primitives; create explicit Map and AI Guide entry screens that clearly communicate preview/connection status until their backend integrations are implemented. Preserve the Requests screen and make it reachable from Account.

**Tech Stack:** Expo SDK 57, Expo Router, React Native 0.86, TypeScript, `@expo/vector-icons`, existing theme and safe-area components.

**Spec:** `docs/product/IRIFE-SMART-JOURNEY-DESIGN.md`

## Global Constraints

- All changes remain on `feat/irife-mobile-platform-foundation`; do not modify `main`, merge, or deploy.
- Do not add Google Maps keys, AI provider keys, payment credentials, or other secrets to the mobile app.
- Do not imply that live maps, directions, AI responses, bookings, notifications, or account services work before their backend/provider integration exists.
- Keep Requests reachable from Account.
- Support English UI now while keeping layouts and copy structures ready for Arabic RTL and French localization.
- Use accessible labels and touch targets for icon-only actions.
- Use the approved provisional palette from the Smart Journey design document.
- Do not add unapproved paid services or production integrations.

## Review Focus

- A narrow Android screen must not clip the five-tab navigation or key actions.
- The Map screen must not request precise location merely by opening the screen.
- The AI Guide screen must not present static suggestions as live AI responses.
- Settings must not expose nonfunctional toggles as if preferences are persisted.
- Requests must remain reachable after it is removed from the primary tab bar.

---

### Task 1: Shared visual foundation and icon navigation

**Files:**
- Modify: `apps/mobile/src/theme.ts`
- Create: `apps/mobile/src/components/AppButton.tsx`
- Modify: `apps/mobile/app/(tabs)/_layout.tsx`
- Modify: `apps/mobile/package.json`
- Modify: `apps/mobile/src/components/ScreenContainer.tsx`

**Interfaces:**
- Produces shared `theme.colors`, `theme.radius`, `theme.spacing`, reusable `AppButton` variants, and five primary Expo Router tabs.
- Consumes existing Expo Router and React Native navigation structure.

- [ ] Verify the Expo-compatible icon package version and add `@expo/vector-icons` as a direct mobile dependency.
- [ ] Update theme tokens to Deep forest `#123B35`, Emerald `#147D6F`, Soft mint `#DCEFE8`, Warm ivory `#FAF8F2`, Sand `#E9DDC8`, Charcoal `#24312F`, Muted slate `#687873`, White `#FFFFFF`, Alert red `#B5413A`.
- [ ] Add a reusable button with primary, secondary, tertiary, icon-only, and destructive variants; icon-only variant requires an accessibility label.
- [ ] Replace four text-only tabs with Home, Discover, Map, AI Guide, and Account using consistent vector icons, visible labels, selected-state styling, and safe-area-aware sizing.
- [ ] Keep Requests registered as a non-tab route so Account can link to it.
- [ ] Run the mobile TypeScript check and full configured build.

### Task 2: Account, Requests, and Settings navigation

**Files:**
- Modify: `apps/mobile/app/(tabs)/profile.tsx`
- Create: `apps/mobile/app/settings.tsx`
- Modify: `apps/mobile/app/(tabs)/requests.tsx`

**Interfaces:**
- Produces an Account hub linking to Requests, Saved, Settings, Help, and security placeholders.
- Settings screen presents language, appearance, location/privacy, notifications, units, and security sections as clearly marked not-yet-connected preferences where persistence is absent.

- [ ] Build an Account hub with profile summary and clear action rows.
- [ ] Add Settings screen with nonfunctional controls represented as navigation/info rows rather than active persisted toggles.
- [ ] Preserve Requests as an accessible route and provide a link from Account.
- [ ] Add explicit copy that account and preference persistence will be connected with the authentication/preferences API.
- [ ] Run the mobile TypeScript check and full configured build.

### Task 3: Map and AI Guide experience shells

**Files:**
- Create: `apps/mobile/app/(tabs)/map.tsx`
- Create: `apps/mobile/app/(tabs)/guide.tsx`
- Modify: `apps/mobile/app/(tabs)/discover.tsx`
- Modify: `apps/mobile/app/(tabs)/index.tsx`

**Interfaces:**
- Map shell presents search, category filters, map/list switch affordance, and a clear Google Maps integration status; no live map is claimed until SDK and restricted keys are configured.
- Guide shell presents a conversational guide entry, example trip prompts, and a clear backend-connection status; no generated answers are fabricated.
- Discover remains the catalogue entry and distinguishes unavailable catalogue data from empty search results.

- [ ] Build a Map screen shell with categories, search, map/list entry affordance, and a clear preview state pending Google Maps SDK/API setup.
- [ ] Ensure opening Map does not request location; add a user-initiated location action only when location integration exists.
- [ ] Build an AI Guide shell with prompt examples and an unavailable-backend state, not simulated assistant responses.
- [ ] Improve Discover's catalogue state with clear search/filter affordances and loading/empty/unavailable distinctions.
- [ ] Refine Home hierarchy to align with the approved palette and navigation.
- [ ] Run the mobile TypeScript check and full configured build.

### Task 4: Review and evidence

**Files:**
- Review all files changed in Tasks 1–3.

- [ ] Inspect all navigation destinations and route names for consistency.
- [ ] Check accessibility labels and touch targets on icon-only controls.
- [ ] Check narrow-screen sizing, safe areas, and scroll behavior.
- [ ] Confirm no API keys, fabricated live data, fake AI responses, or false persisted settings were introduced.
- [ ] Run GitHub Actions and report the exact result; if no runtime/device preview is available, state that limitation.
