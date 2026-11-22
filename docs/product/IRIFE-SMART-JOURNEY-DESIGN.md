# IRIFE Smart Journey — Product & Technical Design

**Document ID:** IRIFE-SJ-DESIGN-001  
**Version:** 1.0  
**Status:** Proposed for user approval  
**Date:** 2026-11-19  
**Repository:** `elmaloufi/irife-brand-assets`  
**Branch:** `feat/irife-mobile-platform-foundation`

## 1. Purpose

Evolve IRIFE from a basic travel-app shell into a distinctive travel companion for international visitors to Morocco and Moroccan domestic travelers. The experience combines a redesigned mobile interface, an IRIFE-branded discovery map powered by Google Maps, and an AI tourist guide that helps users explore and organize trips.

This document defines the product and technical boundaries. It does not claim that maps, AI, backend APIs, provider data, or paid Google services are already connected.

## 2. Product intent and outcomes

A traveler should be able to:
1. Discover destinations and experiences from IRIFE's own published catalogue.
2. Explore nearby public places and IRIFE experiences on one map while understanding which source provides each item.
3. Ask the IRIFE guide for ideas and a proposed itinerary based on destination, time, interests, mobility preferences, and budget range.
4. See proposed stops on the map, adjust the order, and request directions.
5. Save places and trips, manage preferences, privacy, language, and notification settings.
6. Submit and track booking enquiries through the existing request journey; the app must not imply instant booking or confirmed availability.

## 3. Audience

- International travelers visiting Morocco.
- Moroccan residents exploring destinations inside Morocco.
- Later: experience providers and platform administrators through separately scoped interfaces.

The mobile experience must be prepared for Arabic (including right-to-left layout), French, and English. Browsing must remain usable when the user declines location permission.

## 4. Approved direction and design approaches

### Selected: hybrid Google Maps + IRIFE catalogue + AI guide

- Google Maps SDK renders the map.
- Google Places provides public place discovery and place details where licensed and enabled.
- Google Routes provides route and travel-time calculations.
- IRIFE's own backend catalogue remains the source of truth for IRIFE experiences, provider profiles, editorial collections, and IRIFE verification status.
- The AI guide orchestrates recommendations and itinerary proposals using approved catalogue and map tools. It must not become the source of truth for business facts.

### Alternatives considered

1. Google-only discovery: simpler initial content acquisition, but weakens IRIFE's differentiated catalogue, provider relationships, and verification model.
2. Fully independent map stack: gives greater data and rendering control, but substantially increases data licensing, operations, and maintenance work.

The hybrid approach is selected because it preserves Google's map and routing capabilities while keeping IRIFE's marketplace content and trust decisions under IRIFE control.

## 5. Navigation and information architecture

Replace the current four text-only tabs with five clear primary destinations:

1. **Home** — personalized entry point, search shortcut, curated discovery entry points, and the main path into the catalogue.
2. **Discover** — searchable and filterable destinations, experiences, and editorial collections.
3. **Map** — full-screen map, category controls, nearby discovery, selected-place sheet, and trip route preview.
4. **AI Guide** — conversational tourist assistant and itinerary workspace.
5. **Account** — profile, requests, saved places/trips, preferences, settings, help, and account security.

The existing Requests destination remains reachable from Account and from relevant confirmation/detail flows. It is not removed.

### Navigation and visual controls

- Use a consistent icon family with a selected state, readable labels, and generous touch targets.
- Prefer a floating or softly elevated bottom bar with clear active-state contrast, safe-area handling, and no overlap with map controls.
- Use reusable button variants: primary, secondary, tertiary, icon-only, and destructive.
- Every icon-only action must have an accessibility label and adequate touch target.
- Avoid decorative controls that do not perform an action.

## 6. Visual design system

Proposed visual direction: refined Moroccan travel editorial, modern and welcoming rather than a generic maps clone.

### Provisional palette

| Token | Proposed value | Use |
|---|---|---|
| Deep forest | `#123B35` | Primary navigation, strong headings, hero surfaces |
| Emerald | `#147D6F` | Primary actions and selected states |
| Soft mint | `#DCEFE8` | Selected chips and supporting surfaces |
| Warm ivory | `#FAF8F2` | Main app background |
| Sand | `#E9DDC8` | Secondary highlights |
| Charcoal | `#24312F` | Body text |
| Muted slate | `#687873` | Secondary text |
| White | `#FFFFFF` | Cards and sheets |
| Alert red | `#B5413A` | Destructive/error states only |

These are proposed tokens, not yet approved brand standards. Final colors must pass contrast checks for text, icons, and controls.

### Layout principles

- Establish a consistent spacing, radius, typography, elevation, and icon-size scale.
- Use strong editorial hierarchy and concise copy.
- Keep map controls visually distinct from Google map attribution and Google-provided content.
- Use cards and bottom sheets with clear grouping and predictable dismissal behavior.
- Support dynamic text sizes, Arabic RTL layout, screen readers, and reduced-motion preferences.

## 7. IRIFE Smart Map

### 7.1 Map experience

The Map tab should include:
- A Google map centered on a user-selected or permitted current location.
- Search entry with debounced requests and clear empty/error/loading states.
- Category chips for destinations, experiences, restaurants, cafés, museums/heritage, beaches/nature, family activities, and essential services.
- Distinct marker styles for Google public places and IRIFE-owned experiences.
- Marker clustering at low zoom levels.
- A selected-place bottom sheet with source attribution, available details, and actions.
- A recenter control, map/list switch, filter access, and a route-planning entry point.
- A clear manual location/search fallback when location permission is denied.

### 7.2 Source separation and trust

- IRIFE experiences and providers are loaded from IRIFE's own API and database.
- Google Places results are requested from Google services and displayed with required Google Maps attribution.
- Never label a Google listing as an IRIFE-verified provider.
- An IRIFE verification badge may appear only when the IRIFE backend confirms the relevant provider or experience verification status.
- Clearly distinguish editorial IRIFE content from Google-sourced public place content.

### 7.3 Place details

Display fields only when available and permitted: name, category, address, photos, opening hours, rating/review summary, phone, website, and directions. Clearly identify the source of each field. Do not invent missing values.

Google Maps Platform content must be handled according to its current service terms. Do not scrape, bulk export, or independently index Google Places content. Store Google Place IDs where appropriate; do not persist restricted Google content as IRIFE catalogue data. Use field masks and fetch current details when needed. Preserve attribution and required links. Review the official Places policies before each integration release:
https://developers.google.com/maps/documentation/places/web-service/policies

### 7.4 Route and trip planning

- Allow users to select multiple stops and reorder or remove them.
- Request route calculations from Google Routes for supported travel modes.
- Show travel time and distance with a clear indication that estimates may change.
- Let the user choose walking or driving where supported; add cycling/transit only after coverage and product behavior are verified for the target region.
- The AI may propose stop order, but the user must be able to inspect and edit it before using directions.
- Do not claim a reservation or live availability based on a route result.
- Advanced live traffic, multi-day route optimization, and offline map downloads are later enhancements, not implied in the first map release.

## 8. AI Tourist Guide

### 8.1 Main jobs

The guide should:
- Answer practical travel questions about Morocco using approved sources.
- Suggest destinations and experiences from the IRIFE catalogue.
- Build draft day plans and multi-stop itineraries from user preferences.
- Display proposed stops on the Smart Map.
- Explain why an option fits the user's stated interests and constraints.
- Revise a plan when the user changes time, budget range, interests, or mobility needs.
- Hand off to experience details and the existing enquiry flow when the user chooses to contact a provider.

### 8.2 Conversation experience

- A dedicated Guide tab with a welcoming introduction, suggested prompts, conversation history, and a message composer.
- Structured itinerary cards with stop order, estimated journey segments, and actions to view on map, edit, save, or discard.
- Distinguish generated suggestions from verified catalogue facts.
- Ask for missing essential constraints only when they materially change the proposal.
- Support Arabic, French, and English; respond in the selected conversation language.

### 8.3 Trust and safety rules

- Do not invent prices, operating hours, ratings, provider verification, availability, or booking confirmations.
- Use IRIFE catalogue data for IRIFE experiences and approved Google services for Google place data and routing.
- State when information is unavailable, stale, or estimated.
- Ask before using device location; do not require background location for discovery.
- Do not send identity, precise location, or conversation data to analytics by default.
- Do not create, submit, cancel, or confirm a booking without an explicit user action and a server-confirmed response.
- Provide an easy way to clear conversation history and explain data handling in Settings.

### 8.4 AI architecture boundary

The mobile app must call an authenticated IRIFE backend endpoint. Provider API keys, system prompts, tool credentials, and privileged access must never be embedded in the mobile bundle.

Use a provider-neutral AI adapter so the model/provider can be selected separately. The model provider, model, per-user limits, budget controls, retention policy, and allowed tools remain open decisions and must be approved before live AI activation.

The guide's allowed tools should initially be limited to:
- Search published IRIFE destinations and experiences.
- Fetch IRIFE experience details.
- Search Google Places through the backend integration.
- Calculate routes through the backend integration.
- Create or revise a draft itinerary.
- Save a user-approved itinerary.
- Hand off to the enquiry flow; actual enquiry submission remains a separate user-confirmed operation.

## 9. Account and Settings

Account should contain:
- Profile overview and edit entry.
- My requests and their server-provided statuses.
- Saved places and saved itineraries.
- Settings and preferences.
- Help, contact, legal, and app information.

Settings should include:
- Language: Arabic, French, English.
- Appearance: system, light, dark.
- Location permission status and a shortcut to device settings.
- Notification preferences, once push delivery is implemented.
- Privacy controls, conversation history controls, and data export/deletion entry points when supported by backend policy.
- Units and travel preferences.
- Accessibility preferences where applicable.
- Account security and sign-out.

Do not show a toggle as active unless the underlying system or backend setting is actually implemented and read back successfully.

## 10. Proposed service boundaries and API contracts

These are proposed contract areas, not implemented endpoints:

| Area | Proposed responsibility |
|---|---|
| `/api/v1/discovery` | Published IRIFE destinations and experiences, filters, pagination |
| `/api/v1/maps/places` | Backend-mediated Google Places search/details with field masks and policy controls |
| `/api/v1/maps/routes` | Route calculation and supported travel-mode validation |
| `/api/v1/me/itineraries` | Save, list, read, update, and delete user-owned itineraries |
| `/api/v1/guide/conversations` | Authenticated AI conversation and tool orchestration |
| `/api/v1/guide/itineraries` | Create and revise itinerary proposals |
| `/api/v1/me/preferences` | Account preferences and privacy settings |

All protected operations require server-side authentication, authorization, ownership validation, input limits, rate limits, and audit events where appropriate. Exact request/response schemas must be written and reviewed before backend coding.

## 11. Privacy, security, and cost controls

- Request foreground location only after the user selects a location-dependent feature.
- Provide manual search when location is denied or unavailable.
- Restrict Google API keys by platform, package/bundle identifier, signing certificate where applicable, and allowed APIs. Use separate keys for mobile SDK and server-side web services.
- Keep server-side Google web-service keys in server secret storage.
- Configure billing budgets, quota alerts, API allowlists, field masks, debounce, caching only where terms allow, and request limits before enabling live traffic.
- Never use Places results to seed or enrich the independent IRIFE catalogue unless a separate license explicitly allows the use.
- Add AI per-user rate limits, token/cost budgets, timeouts, safe error handling, and abuse controls.
- Minimize retention of precise location and conversations; document retention and deletion behavior.
- Do not activate paid services or production integrations as part of this design approval.

## 12. Delivery phases

### Phase A — Experience foundation
- Approve visual tokens and information architecture.
- Build reusable buttons, icon system, tab bar, cards, bottom sheets, and layout primitives.
- Redesign Home, Discover, Account, and Settings navigation.
- Preserve access to Requests.

### Phase B — Smart Map foundation
- Add and configure `react-native-maps` for the Expo app.
- Implement map screen shell, categories, map/list state, markers, clustering, and selected-place sheet.
- Add the IRIFE map data adapter and Google Maps attribution boundary.
- Enable Google API calls only after restricted keys, billing, quotas, and backend proxy boundaries are prepared.

### Phase C — Routes and trip workspace
- Add route calculation contracts and supported travel modes.
- Build editable stop lists and map route previews.
- Add saved itinerary contracts and ownership tests.

### Phase D — AI Guide
- Build guide UI and typed provider-neutral contracts.
- Add IRIFE catalogue and map tools through the backend.
- Run quality, safety, privacy, and cost evaluations.
- Activate a live model only after provider/model and budget approval.

### Phase E — Integration and hardening
- End-to-end tests for discovery, map, guide, itinerary, account, and enquiry handoff.
- Location-denied, network-failure, API-quota, empty-data, unauthorized, and rate-limit scenarios.
- Accessibility, Arabic RTL, French, English, performance, and privacy review.

## 13. Acceptance criteria

The design is accepted for implementation when:
1. Five primary navigation destinations are defined and Requests remains accessible.
2. The design system includes documented colors, typography, spacing, button variants, icon behavior, and accessibility requirements.
3. The map distinguishes Google public places from IRIFE catalogue experiences.
4. Location denial does not block discovery or manual search.
5. Route proposals are editable and clearly marked as estimates.
6. The AI guide can produce only draft suggestions from approved tools and cannot silently submit or confirm bookings.
7. Settings expose only implemented controls and explain permissions/data handling.
8. Google attribution, data storage restrictions, API-key restrictions, quota and billing controls are included in implementation checks.
9. API contracts and provider/model decisions are reviewed before backend/live integration.
10. The feature is delivered on the feature branch with tests and evidence; no production deployment or merge to `main` occurs without separate approval.

## 14. Explicit non-goals for this phase

- Payments, deposits, payouts, or subscription activation.
- Guaranteed inventory or instant booking.
- Background location tracking.
- Offline Google map tile downloads.
- Unreviewed provider onboarding or automatic verification.
- A proprietary navigation engine replacing Google Maps.
- Live AI or Google API usage before keys, billing, provider configuration, privacy controls, and user approval are in place.

## 15. Open decisions after this design

- AI model/provider, budget, retention, and supported tools.
- Final app languages at launch and translation workflow.
- Google APIs and quota/billing settings for each environment.
- Exact place categories and whether any category needs separate IRIFE editorial curation.
- Whether Google Maps should be enabled on iOS in the first device build or use Apple Maps there initially.
- Push notification provider and delivery rules.
- Backend framework and final API schemas.
