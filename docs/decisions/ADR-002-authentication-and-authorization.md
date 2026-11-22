# ADR-002: Authentication, Sessions, and Authorization

- **Status:** Accepted for the first authenticated vertical slice
- **Date:** 2026-11-22
- **Decision owners:** IRIFE project
- **Scope:** Traveler sessions, provider membership boundaries, and server-side authorization

## Context

IRIFE is a native mobile application. The first protected journey associates enquiries with the authenticated traveler and prevents cross-user access. Provider access must be scoped to explicit provider memberships. A mobile client needs a credential lifecycle that supports secure storage, logout, rotation, and revocation.

## Decision

### Authentication mechanism

Use **opaque, random bearer tokens backed by server-side sessions in PostgreSQL** for the first release.

- Generate tokens from a cryptographically secure random source with at least 256 bits of entropy; encode them using base64url.
- Store only a one-way SHA-256 digest of each token in the database. Never persist or log raw access or refresh tokens.
- Issue short-lived access tokens with a default lifetime of **15 minutes** and rotating refresh tokens with a default lifetime of **30 days**. Keep lifetimes configurable and review them before public launch.
- On refresh, atomically invalidate the presented refresh token and issue a replacement pair. Reuse of an already-rotated refresh token revokes the affected session family.
- Logout revokes the current session immediately. Administrative revocation and password-change revocation must invalidate affected sessions.
- Validate access tokens against active, unexpired session records. This intentionally uses a database lookup for protected requests so revocation is effective without waiting for a JWT denylist to expire.
- Use HTTPS in any non-local environment. Do not put credentials in URLs.

### Mobile credential storage

- Keep access tokens in memory where practical.
- Store refresh tokens only in platform-protected storage (Expo SecureStore / Android Keystore-backed storage), never AsyncStorage or ordinary preferences.
- Clear local credentials on logout and when the server reports a revoked or invalid session.
- Do not expose tokens through logs, crash reports, analytics, deep links, or screenshots.

### Password handling

- Passwords are never stored in plaintext or reversibly encrypted.
- The initial backend slice uses Node.js built-in **scrypt** with a random 128-bit salt, cost N=32768, r=8, p=1, a 64-byte derived key, and a 64 MiB memory ceiling. Verification uses constant-time comparison.
- This implementation choice avoids introducing an unverified native addon into the mobile-adjacent monorepo. Before public launch, benchmark scrypt on the intended API host and reassess Argon2id; any algorithm change must support versioned hashes and a safe rehash-on-login migration.
- Apply conservative per-source rate limits to registration (3/hour), login (5/15 minutes), and refresh (20/minute), with `Retry-After` and rate-limit headers.
- The current guard is process-local and is only a development/staging safety layer. Before any multi-instance or public deployment, replace its in-memory buckets with a shared Redis-backed limiter and configure trusted proxy boundaries. Do not expose the API publicly until this release gate is met.
- Authentication responses must not disclose whether an account exists. Account recovery, email/SMS verification, social sign-in, and multi-factor authentication are not part of this foundation and require separate product/security decisions before implementation.

### Roles and provider membership

- A user has a platform role of `TRAVELER` by default. `ADMIN` is a privileged platform role assigned only through a controlled administrative process; it is never accepted from public registration input.
- Provider access is represented by a separate provider-membership relation with scoped roles: `OWNER`, `MANAGER`, and `STAFF`. A user may be a traveler and also belong to one or more providers.
- Provider membership is checked on every provider-scoped operation. A provider role never grants access to another provider's resources.
- Do not trust role, provider ID, owner ID, or user ID supplied by the mobile client as proof of authority.

### Ownership and authorization policy

- Deny access by default for protected routes.
- Derive the acting user exclusively from the validated server session.
- Enforce ownership in the database query or application policy for every user-owned resource, including list, detail, update, and cancellation operations.
- Enquiry creation uses the session user; client-supplied identity fields are rejected or ignored according to the DTO contract.
- Provider operations require an active membership for the resource's provider. Platform administration requires an explicit admin policy.
- Return a non-enumerating not-found response when a caller is not allowed to know whether another user's resource exists.

## Alternatives considered

- **Cookie-backed server sessions:** rejected as the primary mobile mechanism because native clients need a token storage and bearer-auth flow; cookies remain appropriate for a future browser administration client.
- **Self-contained JWT access and refresh tokens:** deferred because immediate revocation and refresh-token reuse detection require additional denylist/session state, reducing the simplicity advantage for this first slice.
- **Hosted OAuth/OIDC provider:** deferred until account recovery, identity verification, and provider onboarding requirements are defined. No external identity provider or paid service is introduced now.

## Security and operational consequences

- Session validation adds a bounded database lookup to protected requests; use indexed token-digest columns and measure before optimizing.
- Refresh rotation must be transactional and concurrency-safe. A replay must revoke the affected session rather than silently mint another token.
- Audit events for sensitive session actions and distributed rate limiting are release gates before public exposure.
- Provider onboarding, verification evidence, admin workflow, retention, and account recovery remain open before those capabilities are exposed.
