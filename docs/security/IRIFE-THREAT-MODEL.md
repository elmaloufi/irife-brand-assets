# IRIFE — Initial Threat Model

**Document ID:** IRIFE-SEC-001  
**Version:** 1.0  
**Status:** Initial engineering baseline; review required before authenticated release  
**Date:** 2026-11-19  
**Applies to:** IRIFE mobile client, API, database, administrative operations, and external service adapters

## 1. Purpose and scope

This document identifies the initial assets, trust boundaries, threat scenarios, and security controls for the IRIFE foundation release. It is an engineering baseline, not a completed penetration test or formal security certification.

In scope: destination/experience discovery, traveler identity/session, enquiry creation and retrieval, request lifecycle, provider access boundaries, administrative operations, media references, and audit records.

Out of scope for this phase: payment card data, payouts, financial settlement, and production infrastructure design.

## 2. System assets

| Asset | Security concern |
|---|---|
| User identity and session credentials | Account takeover, impersonation |
| Traveler profile data | Privacy, unauthorized disclosure |
| Enquiry content and status | Cross-user access, tampering |
| Provider profile and access scope | Provider impersonation, privilege escalation |
| Destination and experience content | Unauthorized modification, malicious content |
| Media objects and upload metadata | Malware, unsafe file delivery, data leakage |
| Administrative actions | Abuse of privileged permissions |
| Audit records | Integrity, accountability, sensitive-data leakage |
| Database credentials and service secrets | Unauthorized infrastructure access |

## 3. Trust boundaries

1. **Mobile client → API:** all client input is untrusted. The client may be modified or scripted.
2. **API → database:** use least-privilege credentials, parameterized queries, and controlled migrations.
3. **API → external services:** provider responses and webhook payloads are untrusted until authenticated and validated.
4. **Provider → provider-scoped data:** a provider must not access another provider's data or unrelated travelers' requests.
5. **Administrator → privileged operations:** require explicit authorization, auditable actions, and minimal privilege.

## 4. Threat actors and capabilities

- Unauthenticated internet user able to send crafted requests.
- Authenticated traveler attempting to access another traveler's data.
- Malicious or compromised provider account.
- Compromised or over-privileged administrator account.
- Automated bot attempting credential stuffing, scraping, spam, or denial of service.
- Malicious content contributor attempting unsafe media or link submission.
- Compromised third-party integration or leaked service credential.

## 5. Initial threat scenarios and controls

| ID | Threat scenario | Impact | Required controls and verification |
|---|---|---|---|
| TM-001 | Traveler changes an enquiry ID to read another user's request (IDOR/BOLA) | High | Derive owner from session; enforce ownership in every query; negative API tests |
| TM-002 | Traveler submits a forged user ID or provider ID | High | Ignore client ownership fields; resolve actor/provider access server-side |
| TM-003 | Traveler or provider invokes an unauthorized lifecycle transition | High | Central server-side state machine; transaction-safe transition checks; role tests |
| TM-004 | Attacker brute-forces login or floods enquiry submission | Medium/High | Rate limits, abuse monitoring, safe authentication responses, throttling tests |
| TM-005 | Stolen or replayed session token is used | High | Secure token storage, short-lived access where appropriate, rotation/revocation strategy, logout invalidation tests |
| TM-006 | Malicious input reaches SQL/query or rendered content | High | Schema validation, parameterized queries, output encoding, safe rendering |
| TM-007 | Uploaded media contains malicious or oversized content | Medium/High | Restrict MIME/extension/size, inspect content where supported, non-executable storage, safe delivery headers |
| TM-008 | Secrets or personal data appear in logs or repository | High | Secret scanning, log redaction, safe examples, access review |
| TM-009 | Provider account accesses a request outside its provider scope | High | Server-side provider-to-experience relationship checks; cross-provider negative tests |
| TM-010 | Administrator misuses privileged capability | High | Least privilege, step-up protection for sensitive actions where appropriate, audit events, periodic review |
| TM-011 | API exposes unpublished, removed, or unverified content as trusted | Medium | Publication-state checks, explicit verification metadata, moderation rules |
| TM-012 | External service callback is forged or replayed | Medium/High | Authenticate callbacks, verify signatures/timestamps, replay protection, strict allowlists |

## 6. Security requirements

### Authentication and sessions
- Select and document the authentication/session design before implementing protected routes.
- Store mobile credentials using platform secure storage; never ordinary local storage.
- Define expiry, refresh, logout, revocation, and account recovery behavior.
- Avoid revealing whether a particular account exists in authentication error messages.

### Authorization
- Deny by default.
- Enforce role and resource-level policies on the server.
- Test traveler ownership, provider ownership, and admin privilege boundaries independently.
- Never rely on client route guards or hidden controls as the sole enforcement mechanism.

### Data and infrastructure
- Keep secrets out of Git and mobile bundles.
- Use least-privilege database roles and network access.
- Validate all inputs and use parameterized persistence operations.
- Apply migrations through reviewed, repeatable scripts.
- Minimize personal data and define retention/deletion rules.
- Avoid placing tokens, passwords, full request messages, or unnecessary PII into logs.

### API abuse controls
- Rate-limit authentication and request creation.
- Set request body and upload size limits.
- Apply pagination and bounded query filters.
- Use request IDs and safe error envelopes.
- Consider idempotency for retry-prone request creation.

## 7. Security testing plan

Required before the first authenticated release:

- Unauthenticated requests cannot access protected resources.
- Traveler A cannot list, view, update, or cancel Traveler B's enquiry.
- A provider cannot access requests associated with another provider.
- A traveler cannot invoke provider or administrative operations.
- Invalid lifecycle transitions are rejected, including concurrent/stale updates.
- Oversized and malformed inputs are rejected safely.
- Rate-limit behavior is tested for login and enquiry creation.
- Secrets and personal information are absent from logs and committed files.
- Database migrations can be applied from a clean local database.
- Error responses do not reveal stack traces, credentials, or internal query details.

## 8. Privacy and data classification

Initial classification:

- **Public:** published destination and experience descriptions, public media approved for release.
- **Internal:** operational metadata, unpublished content, moderation queues.
- **Personal:** account identifiers, profile details, enquiry messages, party/date information.
- **Restricted secrets:** passwords, session tokens, API keys, database credentials.

Collect only fields required for an explicit user journey. Define purpose, access roles, retention period, and deletion behavior for every personal-data field before launch.

## 9. Residual risks and open decisions

- Authentication provider and recovery process are not yet selected.
- Provider onboarding, verification evidence, and multi-user provider access are not yet defined.
- Media storage and content scanning capabilities are not yet selected.
- Hosting topology, secret management, backups, and incident response need production-specific design.
- Legal/privacy review for the markets and data collected must happen before public launch.

## 10. Security release gate

The first authenticated vertical slice must not be considered complete until:
1. Threat scenarios TM-001 through TM-005 have implemented controls and passing tests.
2. Provider and administrator boundaries are tested before those capabilities are enabled.
3. Data collection and retention are documented.
4. No known critical/high security finding remains unresolved without explicit risk acceptance.
5. CI and code review provide repeatable evidence.

This document does not authorize production deployment, payment processing, or external paid services.
