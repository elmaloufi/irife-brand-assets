# IRIFE — Product Requirements Document

**Document ID:** IRIFE-PRD-001  
**Version:** 1.0  
**Status:** Phase-one baseline  
**Product:** IRIFE  
**Platform:** Mobile (Expo / React Native)  
**Date:** 2026-11-19

## 1. Product summary

IRIFE is a mobile-first travel discovery and enquiry platform focused on Morocco. It helps travelers discover places and experiences, understand the offer, contact relevant providers through a structured request, and track the request lifecycle.

The first release must prove a reliable end-to-end journey. It is not a complete travel marketplace and must not imply instant booking, guaranteed availability, or payment processing.

## 2. Problem statement

Travelers often discover places, activities, and local experiences across disconnected channels. Information can be inconsistent, provider contact can be difficult, and it may be unclear whether a request was received or answered.

IRIFE aims to provide one structured discovery and enquiry journey with transparent request status and clear ownership of information.

## 3. Goals and measurable outcomes

### Phase-one goals

1. Let a traveler browse published destinations and experiences.
2. Present enough detail for an informed enquiry.
3. Let a traveler submit an enquiry with validated details.
4. Let the traveler securely see only their own enquiries and current statuses.
5. Give the platform a maintainable mobile foundation and testable API/data boundaries.

### Initial success measures

- Discovery-to-detail engagement: percentage of destination/experience views relative to list views.
- Detail-to-enquiry conversion: percentage of eligible detail views followed by a submitted enquiry.
- Enquiry submission reliability: successful submissions divided by valid submission attempts.
- Request visibility: percentage of submitted enquiries visible in the user's own request list.
- Authorization correctness: all cross-user and unauthorized access tests denied.

Targets should be set after baseline usage or controlled product testing; do not invent numeric targets before evidence exists.

## 4. Personas

### Traveler
Wants to discover places and experiences, understand what is offered, send a request, and track the response.

### Experience provider
Wants to receive relevant requests and respond to enquiries associated with their provider profile. Provider onboarding and permissions require separate acceptance criteria before provider tools are released.

### Administrator / moderator
Needs to review content, handle reports, and manage provider trust status with auditable and restricted privileges. Admin workflows are not part of the first traveler vertical slice.

## 5. Scope

### P0 — Foundation release

- Mobile application shell and navigation.
- Destination discovery list and destination details.
- Experience discovery list and experience details.
- Basic search and filtering over published content.
- Traveler account/session capability sufficient to associate and protect enquiries.
- Submit an enquiry / booking request.
- List and view the authenticated traveler's own requests.
- Request status and safe cancellation behavior where permitted.
- Empty, loading, offline/error, and retry states.
- Basic accessibility and localization readiness.
- Backend authorization, validation, audit events, database migrations, automated tests, and CI.

### Explicitly out of scope

- Payments, deposits, refunds, payouts, or financial settlement.
- Guaranteed real-time availability or inventory synchronization.
- Flight, hotel, or transport booking.
- Public provider marketplace onboarding automation.
- In-app chat or voice/video calls.
- Loyalty, subscriptions, promotional campaigns, and paid placement.
- AI itinerary generation or automated recommendations.
- Production deployment or external paid integrations without separate approval.

## 6. Primary user journeys

### Journey A — Discover an experience

1. Traveler opens IRIFE.
2. Traveler views published destinations and experiences.
3. Traveler searches or filters the catalogue.
4. Traveler opens an item.
5. App displays description, location, provider attribution where approved, relevant media, and enquiry guidance.

**Acceptance criteria**
- Only published and eligible content is returned.
- Lists are paginated and have deterministic loading/error/empty states.
- Detail screens handle unavailable or removed content safely.
- No UI claims live availability unless backed by an approved live integration.

### Journey B — Submit an enquiry

1. Traveler opens an eligible experience detail.
2. Traveler chooses the request action.
3. App collects only required request details (for example, requested date/time window, party size, and a short message when applicable).
4. Server validates the input and current content/provider eligibility.
5. Server creates the request and initial status atomically.
6. App displays a confirmation based on the server response.

**Acceptance criteria**
- Invalid, oversized, or malformed input is rejected with safe actionable feedback.
- The authenticated identity is derived from the server-validated session, not from client-supplied ownership fields.
- Duplicate retries do not create unintended duplicate requests when an idempotency strategy is required.
- A request is not shown as submitted until the server confirms persistence.
- Sensitive details are not exposed to unrelated users.

### Journey C — Track a request

1. Traveler opens “My Requests”.
2. App requests the authenticated user's request list.
3. Traveler opens one request.
4. App shows status and relevant timestamps.
5. Traveler may request cancellation only when the server allows the transition.

**Acceptance criteria**
- The server filters by the authenticated user.
- Guessing another request identifier never reveals its content.
- Status labels are derived from server state.
- Cancellation is validated against the current state and recorded in history.

## 7. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | Browse published destinations | P0 |
| FR-002 | View destination details | P0 |
| FR-003 | Browse and filter published experiences | P0 |
| FR-004 | View experience details | P0 |
| FR-005 | Authenticate a traveler using the approved auth design | P0 |
| FR-006 | Submit a validated enquiry | P0 |
| FR-007 | List the current user's enquiries | P0 |
| FR-008 | View one of the current user's enquiries | P0 |
| FR-009 | Enforce request lifecycle transitions on the server | P0 |
| FR-010 | Record security-relevant and lifecycle audit events | P0 |
| FR-011 | Save and remove favorites | P1 |
| FR-012 | Provider response interface | P1 |
| FR-013 | Reviews and moderation | P2 |
| FR-014 | Notification delivery | P2 |

Priority indicates intended sequencing and may change only through documented scope review.

## 8. Content and trust requirements

- Each destination and experience must have a defined publication status.
- Displayed provider identity and verification state must reflect authoritative stored records.
- Do not fabricate ratings, reviews, availability, prices, or provider verification.
- Define who can create, edit, publish, archive, and moderate each content type.
- Media must be validated and served from an approved storage path.
- Reported or disputed content needs a moderation path before public launch.

## 9. User experience requirements

- Support consistent loading, empty, success, and error states.
- Use clear request status names and explain what action is expected next.
- Do not rely on color alone to communicate status.
- Provide accessible labels, adequate contrast, scalable text, and screen-reader support.
- Keep UI copy localizable; prepare for Arabic, French, and English.
- Request device permissions only at the moment the relevant feature needs them.
- Location access must not be mandatory for browsing.

## 10. Security and privacy requirements

- Server-side authentication and authorization on all protected endpoints.
- Resource ownership checks for every user-owned request.
- Rate limits and abuse controls for authentication and enquiry submission.
- Input validation and safe error responses.
- No secrets in the app bundle, source control, or logs.
- Data minimization and documented retention.
- Audit records for privileged and lifecycle actions without logging credentials or unnecessary personal data.
- Security tests must include negative authorization cases.

## 11. Non-functional requirements

- **Reliability:** robust API error handling and safe retry behavior.
- **Performance:** paginated catalogue endpoints and efficient media loading.
- **Maintainability:** feature-oriented mobile structure, explicit API contracts, modular backend boundaries.
- **Testability:** domain rules separated from UI and infrastructure.
- **Accessibility:** accessible navigation, labels, text sizing, and contrast.
- **Localization:** translated UI strings separated from presentation.
- **Privacy:** minimal data collection and privacy-aware telemetry.

## 12. Definition of done for P0

P0 is ready for review only when:

1. The three primary journeys work end to end in a development environment.
2. API contracts and database migrations are versioned.
3. Unit, integration, migration, and mobile critical-path tests pass.
4. Cross-user access and privilege escalation tests pass.
5. Empty/error/loading states and accessibility basics are reviewed.
6. CI validates the actual project workspace and lockfile.
7. Documentation, known limitations, and security implications are reviewed.
8. Changes are delivered through a feature-branch pull request.

No production deployment, payments, or merge to `main` is authorized by this PRD.

## 13. Open product decisions

- Exact minimum fields required for an enquiry.
- Provider response workflow and service-level expectations.
- Provider verification requirements and evidence.
- Cancellation rules and permitted transitions.
- Content ownership and moderation workflow.
- Supported currencies and language launch order.
- Location and media providers.
- Authentication method and account recovery policy.

These decisions must be recorded before the corresponding functionality is implemented.
