# IRIFE — Backend API Design

**Document ID:** IRIFE-ARCH-002  
**Version:** 1.1  
**Status:** Approved design baseline  
**Approved:** 2026-11-21  
**Repository:** `elmaloufi/irife-brand-assets`  
**Design branch:** `feat/irife-nestjs-api-plan`

## 1. Purpose

Establish the technical design for the first IRIFE backend. The initial goal is a locally runnable API that can later be deployed to a cloud environment without changing the mobile application's feature logic.

This document defines architecture and implementation boundaries. It does not claim that the backend, database, or integrations already exist.

## 2. Approved technology decisions

| Area | Decision |
|---|---|
| Mobile client | Expo + React Native + TypeScript |
| Backend framework | NestJS + TypeScript |
| Backend architecture | Modular Monolith |
| API style | REST / JSON |
| API prefix | `/api/v1` |
| Database | PostgreSQL |
| Database access | Prisma ORM |
| Local database runtime | Docker Compose |
| API documentation | Swagger / OpenAPI |
| Request validation | DTOs + class-validator / class-transformer |
| Automated API tests | Jest + Supertest |
| Initial execution environment | Local development |
| Later execution environment | Cloud, after separate deployment approval |

Dependency versions must be selected from mutually compatible stable releases at implementation time, pinned in package manifests, and captured in the npm lockfile. No floating production dependency ranges.

## 3. Architecture

The first backend is one NestJS deployment unit with explicit module boundaries:

`IRIFE Mobile → NestJS API → Domain Modules → Prisma → PostgreSQL`

The API is the trust boundary. The mobile client is untrusted: identity, authorization, validation, ownership checks, enquiry state transitions, and any authoritative business rules must be enforced by the server.

Modules communicate through explicit service/application interfaces. Avoid circular module dependencies and avoid allowing one module to write directly to another module's persistence tables.

## 4. Repository placement

The backend will live alongside the existing mobile application:

```text
apps/
  mobile/
services/
  api/
packages/
  contracts/
database/
  prisma/
docs/
  architecture/
  decisions/
  superpowers/plans/
```

Existing brand assets and attribution information must remain intact. Root npm workspaces and scripts may be extended, but existing mobile commands and tests must continue to work.

## 5. Backend modules and delivery order

Initial module boundaries:

- **Health:** process readiness and database connectivity checks.
- **Config:** typed environment configuration and startup validation.
- **Identity:** authentication, sessions, and token lifecycle; strategy must be recorded in an ADR before implementation.
- **Authorization:** role, permission, provider membership, and resource ownership checks.
- **Destinations:** published city and destination data.
- **Experiences:** published experience content and destination relationships.
- **Providers:** provider profile and access boundaries.
- **Enquiries:** request submission, ownership, provider response, and lifecycle.
- **Audit:** security-sensitive and administrative event records.

Delivery order: API shell and health → database → public discovery read APIs → authentication and authorization → enquiry workflow → hardening.

## 6. API conventions

All application endpoints use the `/api/v1` prefix.

Initial health endpoint:
- `GET /api/v1/health`

Initial product API candidates:
- `GET /api/v1/destinations`
- `GET /api/v1/destinations/:id`
- `GET /api/v1/experiences`
- `GET /api/v1/experiences/:id`
- `POST /api/v1/enquiries`
- `GET /api/v1/me/enquiries`
- `GET /api/v1/me/enquiries/:id`

Exact DTOs, pagination fields, error codes, and response schemas must be versioned in shared contracts before each endpoint is implemented. Protected endpoints derive the acting user from the validated server session, never from a caller-supplied user ID.

Use a consistent error envelope, request/correlation ID, bounded pagination, explicit filtering rules, and safe error messages. Swagger/OpenAPI documents the public contract.

## 7. Database and migrations

PostgreSQL is the transactional source of truth. Local development uses Docker Compose. Prisma schema and migrations are stored under `database/prisma/` and run through documented npm scripts.

The first schema is deliberately minimal and grows with the vertical slice. Candidate domain entities include users, profiles, providers, destinations, experiences, experience media, enquiries, enquiry status history, favorites, reviews, notifications, and audit events.

Every relationship must have appropriate foreign keys and deletion behavior. Add unique constraints and indexes for actual access patterns. Do not store large image binaries in ordinary relational rows. Migrations must be repeatable against an empty local database and must never silently destroy developer data.

## 8. Local configuration and mobile connectivity

The API reads server-only settings from environment variables, including:
- `NODE_ENV`
- `PORT`
- `DATABASE_URL`
- `CORS_ORIGINS`

Commit a safe `.env.example`, never real credentials. Validate required configuration at startup.

The mobile app reads a public API base URL from Expo configuration (for example, `EXPO_PUBLIC_API_URL`). This value is not a secret. Do not hard-code a developer's LAN address in source files.

The connection guide must distinguish:
- API and mobile running on the same development host.
- Android emulator connecting to the host machine.
- Physical Android device connecting over the same LAN.

The physical device must use a reachable LAN address, not its own `localhost`. Production uses HTTPS and a separately configured base URL.

## 9. Security baseline

- Validate all request bodies, route parameters, and query parameters.
- Enforce authentication, role checks, and resource ownership server-side.
- Deny access by default on protected routes.
- Rate-limit login and enquiry submission.
- Keep secrets out of Git, mobile bundles, API responses, and logs.
- Redact tokens and sensitive personal data from logs.
- Use parameterized ORM access and safe file/media handling.
- Enforce legal enquiry state transitions on the server.
- Never describe an enquiry as confirmed or an experience as live-available without authoritative confirmation.
- Define retention and deletion behavior before collecting unnecessary personal data.

Authentication/session choice, role model, and provider multi-user access require an Architecture Decision Record before protected endpoints are built.

## 10. Local-first operating model

The first release is developed and tested locally:
1. Install workspace dependencies from the committed lockfile.
2. Start PostgreSQL with Docker Compose.
3. Apply Prisma migrations.
4. Start the NestJS API.
5. Verify health and database readiness.
6. Configure the mobile app API URL and test from a physical Android device.

Cloud deployment is a later, separately approved phase. The design should remain portable: configuration through environment variables, stateless API instances where practical, managed PostgreSQL compatibility, health checks, and no dependence on local filesystem persistence for user uploads.

## 11. Out of scope for this foundation

- Payment processing, payouts, or wallet features.
- Guaranteed real-time experience inventory.
- Microservices or event-bus infrastructure.
- Selecting or purchasing a cloud provider.
- Production deployment or public exposure of the API.
- Paid third-party integrations without a separate decision.

## 12. Acceptance criteria

The backend foundation is accepted when:
1. NestJS starts locally using documented commands.
2. `GET /api/v1/health` returns a documented success response.
3. PostgreSQL starts through Docker Compose and the API can verify database connectivity.
4. Prisma migrations apply to a clean local database.
5. Automated unit and API integration tests pass.
6. Existing mobile tests and type-check remain passing.
7. The mobile app can call the local health endpoint on a physical Android device.
8. No secrets are committed and local setup is documented.
9. CI validates the mobile and API workspaces without triggering deployment.

## 13. Change control

Implementation work must use feature branches and pull requests. Do not commit directly to `main`. No merge to `main`, production deployment, payment activation, public API exposure, or paid service activation is authorized by this design. Each requires separate explicit approval.
