# IRIFE Security Review — 2026-11-28

**Status:** Engineering review in progress; not a penetration-test report or security certification.  
**Scope:** Current repository API and the authentication/session changes in PR #49.  
**Reviewed areas:** Identity controller and DTOs, access-token validation, session and refresh-token lifecycle, password reset/change, rate limiting, Prisma schema and migrations, public catalogue endpoints, enquiry ownership, saved experiences, API bootstrap/CORS, and CI configuration.

## Executive assessment

The reviewed foundation has useful security controls: opaque 256-bit credentials stored as SHA-256 verifiers, 15-minute access credentials, single-use refresh credentials, server-side session validation, platform secure storage, password hashing with scrypt, account-row serialization for password changes and reset flows, DTO validation, explicit CORS origins, and ownership-scoped traveler queries.

This is not enough to declare the entire project secure. Provider/admin authorization is not implemented, production deployment configuration has not been reviewed, the rate limiter depends on the network topology, and the API still needs broader adversarial integration testing. PR #49 remains Draft and must not be merged solely because CI is green.

## Findings and disposition

### SEC-001 — Inconsistent database lock ordering could deadlock refresh and revocation

**Severity:** High reliability/security-control risk  
**Status:** Fixed in PR #49; PostgreSQL concurrency verification pending.

The refresh flow originally locked a `SessionCredential` row before updating its parent `Session`. Password change, password reset, logout, and session revocation lock the session before updating credentials. Under concurrency, the refresh transaction could hold a credential lock while waiting for the session, while a revocation transaction held the session and waited for the credential. PostgreSQL could abort one transaction as a deadlock victim.

**Change:** Refresh now locks `Session` first and `SessionCredential` second, matching the session-to-credential order used by logout/revocation. The transaction then reloads the credential and checks its current state.

**Verification:** Added PostgreSQL-backed concurrency tests for simultaneous same-ID retries, different-ID replay, and refresh racing with password change. Await the CI result; mocked unit tests alone are not sufficient evidence.

### SEC-002 — Encrypted refresh responses could remain recoverable after the retry window

**Severity:** High  
**Status:** Mitigated in PR #49; operational behavior pending CI/runtime verification.

The idempotent retry response contains live bearer credentials. Encrypting it at rest is necessary but not sufficient if the ciphertext remains indefinitely after the 10-minute retry window.

**Change:** AES-256-GCM additional authenticated data binds the ciphertext to the credential ID and request ID. A lifecycle-managed cleanup worker clears the ciphertext, request ID, and expiry metadata at startup and every 60 seconds while the API process is running.

**Residual limitation:** If all API instances remain stopped, cleanup is delayed until the next startup. Production key custody, backup retention, and key-rotation procedures still require deployment review.

### SEC-003 — Password change did not invalidate outstanding password-reset tokens

**Severity:** Medium  
**Status:** Fixed in PR #49; test/CI verification pending.

An outstanding password-reset token could remain usable after a user changed their password through an authenticated session.

**Change:** Password change now consumes all outstanding password-reset tokens in the same transaction that updates the password and revokes active sessions.

### SEC-004 — Password-reset expiry was checked before waiting for the account lock

**Severity:** Medium  
**Status:** Fixed in PR #49; test/CI verification pending.

A reset token could pass the initial expiry check, wait for the account-row lock, and then be consumed using a timestamp captured before the wait.

**Change:** The expiry predicate and consumed timestamp are now evaluated after acquiring the account lock.

### SEC-005 — Unit tests did not exercise PostgreSQL lock semantics

**Severity:** High verification gap  
**Status:** PostgreSQL integration tests added; CI result pending.

The earlier refresh tests mocked Prisma transactions and therefore could not establish real row-lock ordering, concurrent transaction behavior, or database constraint behavior.

**Change:** Added an API E2E test suite using the PostgreSQL service already provisioned by CI. The root test command now includes it.

**Acceptance:** The new E2E job must pass on the latest PR head. Review its logs, not only the aggregate green status.

### SEC-011 — Authentication rate-limit route variants

**Severity:** Medium  
**Status:** Fixed in PR #49; regression test added, CI verification pending.

The API router accepts case-insensitive paths and trailing slashes, while the rate-limit guard originally matched exact lowercase paths. A request using a case or trailing-slash variant could therefore reach an authentication route without matching its configured rate-limit policy.

**Change:** Normalize the path to lowercase, strip the API prefix case-insensitively, and remove trailing slashes before policy lookup. A regression test covers an uppercase path with a trailing slash.

## Open risks before public release

### SEC-006 — Rate limiting depends on the effective client IP

**Severity:** Medium  
**Status:** Open; deployment topology required.

Authentication limits are keyed by `request.ip`. The API does not currently configure Express `trust proxy`. Behind a reverse proxy, requests may all appear to originate from the proxy address, causing unrelated users to share one bucket. Enabling trust proxy without a strict trusted-proxy configuration would allow client-IP spoofing.

**Required action:** Before deployment, define the actual proxy chain and configure only the trusted proxy addresses/hops. Verify that spoofed `X-Forwarded-For` values cannot change the rate-limit identity.

### SEC-007 — Authentication throttling is IP-based, not account-aware

**Severity:** Medium  
**Status:** Open.

The current login, registration, refresh, and password-reset throttles use IP-based buckets. Distributed sources can evade per-IP limits. Account-aware throttling must be designed carefully because hard account lockouts can themselves be abused to deny service to legitimate users.

**Required action:** Add a risk-based account/email dimension or edge abuse controls, with privacy-preserving identifiers and explicit anti-lockout behavior.

### SEC-008 — Provider and administrator authorization are not implemented

**Severity:** High release blocker for provider/admin features  
**Status:** Not implemented; no provider/admin API controllers were found in the reviewed surface.

The schema contains provider memberships and user roles, but the current API does not yet provide provider/admin workflows or a complete server-side role/resource policy layer. Traveler-owned enquiry and saved-experience queries are scoped by the authenticated user, but this does not establish provider tenant isolation.

**Required action:** Do not expose provider dashboards, administrative mutations, or tenant data until server-side role checks, provider membership checks, resource-level ownership rules, audit events, and negative cross-tenant tests are implemented.

### SEC-009 — Broader authorization and abuse testing is incomplete

**Severity:** Medium  
**Status:** Open.

The new PostgreSQL tests focus on refresh rotation and a password-change race. They do not constitute a complete API security suite or verify every BOLA/IDOR scenario, malformed payload, concurrent enquiry transition, or abuse pattern.

**Required action:** Add HTTP-level negative tests for unauthenticated access, Traveler A versus Traveler B, role escalation, unpublished content, concurrent state changes, and rate-limit behavior. Run DAST against a non-production environment before public launch.

### SEC-010 — Production key and infrastructure controls are not verified

**Severity:** High release blocker  
**Status:** Open.

The application now requires `REFRESH_TOKEN_ENCRYPTION_KEY` in production, but no production secret store, proxy configuration, TLS termination, database least-privilege role, backup retention, or incident-response configuration has been reviewed in this change.

**Required action:** Configure a stable, secret-managed 32-byte base64 key; verify TLS, database access boundaries, backups, monitoring, and key rotation before any production deployment.

## CI evidence and limitations

The standard CI workflow runs dependency installation, Expo SDK peer checks, Prisma validation, migrations against a clean PostgreSQL service, unit tests, and TypeScript/build checks. This PR extends the root test command to include the new PostgreSQL-backed identity E2E suite.

A green CI run establishes only that those configured checks passed. It does not prove the absence of vulnerabilities, test every trust boundary, validate production secrets/infrastructure, or replace independent code review and penetration testing. Optional third-party scanner workflows may fail because their external credentials or project configuration are not present; those failures must not be reported as successful scans.

## Release decision

- Keep PR #49 in Draft until the latest CI run, including PostgreSQL E2E tests, completes successfully and its logs are reviewed.
- Do not merge to `main` without explicit approval.
- Do not enable provider/admin functionality until SEC-008 is closed.
- Do not deploy publicly until SEC-006, SEC-007, and SEC-010 have documented mitigations or explicit risk acceptance.
- Do not describe IRIFE as penetration-tested, certified, or fully secure based on CI results.
