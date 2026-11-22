# ADR-001: Backend and API Architecture

- **Status:** Accepted
- **Date:** 2026-11-22
- **Decision owners:** IRIFE project
- **Scope:** First local backend foundation and initial traveler enquiry vertical slice

## Context

IRIFE needs a backend that can support a mobile-first travel and experiences product without coupling business rules to the Expo client. The first release must be operable locally, testable, and portable to a later cloud environment. The mobile application is an untrusted client and must not own authorization, publication rules, request state, or other authoritative business decisions.

## Decision

1. Build one **NestJS modular monolith** in `services/api/`. Keep domain boundaries explicit and communicate between modules through application/service interfaces. Do not introduce microservices or an event bus in this phase.
2. Expose **REST/JSON** endpoints under the global `/api/v1` prefix. Version shared request/response contracts before implementing each endpoint.
3. Use **PostgreSQL** as the transactional source of truth and **Prisma** for schema access and versioned migrations under `database/prisma/`.
4. Use **Docker Compose** for local PostgreSQL development. Keep persistent local data in a named volume; migrations must be additive and must not silently reset developer data.
5. Publish API documentation through **Swagger/OpenAPI** in local development.
6. Validate all HTTP inputs at the API boundary with DTOs and `class-validator` / `class-transformer`. Use a consistent error envelope and request/correlation ID.
7. Keep `apps/mobile`, `services/api`, and `packages/contracts` as separate npm workspaces. Share only stable, versioned API contracts; do not share server implementation code with the client.
8. Develop and verify locally first. Cloud hosting, public exposure, payments, and paid integrations require separate decisions and explicit approval.

## Consequences

- A modular monolith keeps deployment and local setup simple while preserving domain boundaries.
- PostgreSQL-backed transactions support safe enquiry creation and lifecycle transitions.
- Database-backed authorization and ownership checks are authoritative, even when the mobile UI hides unavailable actions.
- The API must remain stateless at the process level where practical; durable sessions and domain state live in PostgreSQL.
- The initial implementation has operational requirements for a local database, migrations, and environment validation.
- The first vertical slice is limited to public destination/experience discovery and the authenticated traveler enquiry lifecycle. Provider administration, payments, guaranteed availability, and production operations remain outside this decision.

## Alternatives considered

- **Direct mobile-to-database access:** rejected because it exposes persistence and authorization boundaries to an untrusted client.
- **Microservices:** rejected for the initial scope because independent deployment and distributed coordination add complexity without a demonstrated need.
- **Serverless functions as the primary architecture:** deferred because the initial domain needs clear module boundaries and transaction-oriented workflows.
- **GraphQL:** rejected for the first API because the product's current read and enquiry workflows fit versioned REST resources.

## Revisit when

The team has measured scale, independent deployment needs, or integration requirements that justify a change. Any change must preserve the API trust boundary and migration safety.
