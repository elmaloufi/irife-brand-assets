# ADR-003: Email Address Verification

- **Status:** Proposed; implementation and security review required
- **Date:** 2026-11-24
- **Decision owners:** IRIFE project
- **Scope:** Traveler email ownership verification; explicitly separate from password recovery

## Context

The current identity service creates a session immediately after registration and permits login for active accounts without an email-ownership check. Password recovery is a separate capability and must not be reused as proof that an address was verified. The current password-recovery pull request explicitly does not implement email verification.

IRIFE needs a reliable way to establish control of an email address before enabling account capabilities that depend on a reachable contact channel. The implementation must preserve non-enumerating public responses, one-time token semantics, server-side enforcement, and the existing opaque-session design.

## Decision

Implement email verification as a distinct identity action with its own token purpose and endpoints. Do not reuse, reinterpret, or accept a password-reset token for verification.

### Data model

- Add `EMAIL_VERIFICATION` to the identity action token purpose enum.
- Reuse the identity action token table only if the final implementation proves purpose isolation in every query; otherwise use a dedicated table.
- Store only a SHA-256 digest of a cryptographically random token with at least 256 bits of entropy.
- Set a short configurable expiry (default 24 hours), record single-use consumption, and index by user, purpose, consumption, and expiry.
- Enforce at most one active verification token per user/purpose through transactional invalidation before issuing a replacement. Handle concurrent requests safely.
- Add a non-null-safe verification timestamp to the user record (for example `emailVerifiedAt DateTime?`); never infer verification from account creation, login, or password reset.

### API contract

- `POST /api/v1/identity/email/verification/request`: authenticated endpoint; derives user identity from the session, invalidates prior outstanding verification tokens transactionally, issues a new token, and sends a verification message. The public response must not expose token values or internal provider errors.
- `POST /api/v1/identity/email/verification/confirm`: accepts the one-time token, verifies purpose, digest, expiry, unused state, and active user status, then atomically consumes the token and sets `emailVerifiedAt`.
- Do not accept a user ID or email address as the authority for the confirmation target; resolve the target from the token record.
- Apply rate limits to request and confirmation endpoints. Resend must have a cooldown and bounded attempts.
- Return stable, non-sensitive error codes for invalid, expired, already-used, and delivery-failure cases. Avoid account enumeration.

### Registration and sign-in policy

- Registration creates an unverified account and must not silently mark its email verified.
- Product/security owners must explicitly approve the release policy for unverified accounts. Recommended initial policy: allow sign-in into a restricted state that can only access profile basics and verification resend; block enquiry submission and provider/admin actions until verified.
- If the product instead chooses to block sign-in entirely, implement a clear verification-pending response without disclosing whether an arbitrary email exists.
- Enforce the chosen policy on the API, not only through mobile route guards.
- Existing accounts require a reviewed backfill policy. Do not bulk-mark existing users verified without evidence.

### Email delivery and privacy

- Use the existing email-delivery abstraction; add a purpose-specific verification message and URL/deep-link contract.
- Never log raw tokens, full verification URLs, email message bodies, or unnecessary personal data.
- Keep provider credentials in server environment configuration only.
- Handle delivery failures without leaving a usable token that was never delivered; allow a safe retry.
- Configure a verified sender and test deep links on Android and iOS before release.

### Security and tests

Required automated tests:
- Password-reset tokens cannot confirm email; verification tokens cannot reset passwords.
- Unknown, expired, consumed, malformed, and wrong-purpose tokens are rejected.
- Concurrent confirmation attempts result in exactly one successful consumption.
- Re-request invalidates earlier tokens and enforces cooldown/rate limits.
- Delivery failure does not leak account existence or leave a usable undelivered token.
- Unverified accounts cannot perform server-protected actions disallowed by policy.
- Verified state is persisted and returned without exposing token material.
- User A cannot request, confirm, or alter User B's verification state.
- Clean-database migration and rollback/recovery procedure are documented.

## Alternatives considered

- **Treat password reset as email verification:** rejected; password recovery and address verification have different security semantics and lifecycle.
- **Trust successful registration or login:** rejected; neither proves mailbox control.
- **Verify only in the mobile client:** rejected; clients are untrusted and can be modified.

## Consequences and release gates

- Email verification remains incomplete until the migration, API, mobile flow, delivery adapter, policy enforcement, and tests are merged and validated together.
- Do not enable production enforcement until the unverified-account policy, sender domain, deep links, rate limits, retention, and support/recovery path are approved.
- This ADR does not authorize production deployment or the activation of paid services.
