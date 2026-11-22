# IRIFE NestJS API Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a locally runnable NestJS API foundation for IRIFE, connected to PostgreSQL, documented with OpenAPI, and reachable from the existing Expo mobile app.

**Architecture:** Use a single NestJS modular monolith in `services/api/`, PostgreSQL through Docker Compose, and Prisma migrations under `database/prisma/`. Keep mobile and API as separate npm workspaces and share only versioned API contracts through `packages/contracts/`. Cloud deployment is deliberately excluded.

**Tech Stack:** NestJS, TypeScript, PostgreSQL, Docker Compose, Prisma, Swagger/OpenAPI, class-validator, Jest, Supertest, Expo, npm workspaces.

**Spec:** `docs/architecture/IRIFE-BACKEND-API-DESIGN.md`

## Global Constraints

- Preserve the existing Expo + React Native + TypeScript application and its current navigation behavior.
- Use NestJS + TypeScript and the Modular Monolith architecture.
- Use REST/JSON under `/api/v1`.
- Use PostgreSQL and Docker Compose for local development.
- Use Prisma for database access and versioned migrations.
- Use Swagger/OpenAPI for API documentation.
- Use DTO validation at every HTTP trust boundary.
- Keep secrets out of source control and out of the mobile bundle.
- Work only on a feature branch; never commit directly to `main`.
- Do not merge, deploy, expose a public API, activate payments, or enable paid services.
- Do not claim live inventory or confirmed bookings without authoritative provider confirmation.
- Keep existing brand assets and attribution files unchanged.
- Commit a verified npm lockfile and use `npm ci` in CI.
- Do not implement features outside the approved foundation and first enquiry vertical slice.

## Review Focus

1. **Missing or malformed server configuration:** startup must fail with a clear safe error, not run with an undefined database URL. Test in Task 2.
2. **Database unavailable or migration drift:** readiness must report unhealthy and must not claim database readiness. Test in Task 3.
3. **Invalid or oversized request input:** reject invalid DTOs and bounded-pagination violations with a stable error response. Test in Task 4 and Task 6.
4. **Wrong device network address / CORS origin:** physical-device connection instructions and allowed origins must be explicit; test mobile connectivity in Task 5.
5. **Cross-user or cross-provider access and invalid enquiry transitions:** protected resources must deny unauthorized access and reject invalid state changes. Test in Task 7.

---

## Repository File Map

### New files

- `services/api/package.json` — API workspace scripts and dependencies.
- `services/api/tsconfig.json`, `services/api/tsconfig.build.json` — API TypeScript configuration.
- `services/api/nest-cli.json` — Nest CLI configuration.
- `services/api/src/main.ts` — bootstrap, global prefix, validation, CORS, and OpenAPI setup.
- `services/api/src/app.module.ts` — root module composition.
- `services/api/src/config/*` — validated environment configuration.
- `services/api/src/health/*` — process and database health endpoints.
- `services/api/test/*` — API integration tests.
- `docker-compose.yml` — local PostgreSQL service and persistent named volume.
- `database/prisma/schema.prisma` — initial relational schema.
- `database/prisma/migrations/*` — generated, committed migration history.
- `database/prisma/seed.ts` — deterministic development-only seed data.
- `packages/contracts/package.json` — shared contract workspace.
- `packages/contracts/src/*` — stable request/response and error contract types.
- `apps/mobile/src/services/api/client.ts` — typed API client.
- `apps/mobile/src/services/api/config.ts` — API base URL configuration.
- `apps/mobile/src/services/api/health.ts` — health endpoint adapter.
- `docs/engineering/LOCAL-API-SETUP.md` — local setup and physical-device guide.
- `docs/decisions/ADR-001-backend-and-api.md` — backend/API decision record.
- `docs/decisions/ADR-002-authentication-and-authorization.md` — authentication and access-control decision.
- `docs/security/IRIFE-API-THREAT-MODEL.md` — scoped threat model for the first vertical slice.

### Existing files to modify

- `package.json` — add API/contracts workspaces and root scripts without removing current mobile scripts.
- `.github/workflows/blank.yml` — convert placeholder workflow into validation CI for all workspaces; do not add deployment.
- `apps/mobile/package.json` — add only required API-client dependencies if any; preserve Expo-compatible versions.
- `apps/mobile/app.json` or Expo app config — expose the public API base URL through the chosen Expo configuration mechanism, never secrets.
- Existing architecture and engineering documents — update only where implementation facts have changed.

## Task 1: Record implementation decisions and API contract boundaries

**Files:**
- Create: `docs/decisions/ADR-001-backend-and-api.md`
- Create: `docs/decisions/ADR-002-authentication-and-authorization.md`
- Create: `packages/contracts/package.json`
- Create: `packages/contracts/src/index.ts`
- Create: `packages/contracts/src/common/api-error.ts`
- Create: `packages/contracts/src/health/health-response.ts`

**Interfaces:**
- Produces a shared health response type `HealthResponse` with `status: "ok" | "degraded"`, `service: "irife-api"`, `timestamp: string`, and a database status field with explicit `"up" | "down"` values.
- Produces a common error envelope with `statusCode`, `code`, `message`, and `requestId`.
- ADR-002 must decide authentication/session mechanism, token lifecycle, role representation, provider membership, and ownership policy before protected endpoints are implemented.

- [ ] **Step 1: Write contract tests** for the exact health response shape and error envelope using Node's built-in test runner or the contracts workspace's selected test runner.
- [ ] **Step 2: Run the contract tests** and verify they fail because the types/contract exports do not yet exist.
- [ ] **Step 3: Record ADR-001** confirming NestJS, REST/JSON, `/api/v1`, PostgreSQL, Prisma, Swagger, and local-first execution.
- [ ] **Step 4: Record ADR-002** after evaluating a small set of maintained NestJS-compatible authentication approaches; explicitly document why the chosen session/token approach fits mobile clients and how refresh/revocation and provider roles work.
- [ ] **Step 5: Implement the shared contract types** and export them from `packages/contracts/src/index.ts`.
- [ ] **Step 6: Run contract tests** and verify all response/error shape assertions pass.
- [ ] **Step 7: Review the ADRs** for unresolved security decisions; do not proceed to protected enquiry routes while ADR-002 remains open.

## Task 2: Add the NestJS API workspace

**Files:**
- Create: `services/api/package.json`
- Create: `services/api/nest-cli.json`
- Create: `services/api/tsconfig.json`
- Create: `services/api/tsconfig.build.json`
- Create: `services/api/src/main.ts`
- Create: `services/api/src/app.module.ts`
- Create: `services/api/src/config/config.module.ts`
- Create: `services/api/src/config/env.validation.ts`
- Modify: root `package.json`

**Interfaces:**
- API workspace package name: `@irife/api`.
- API bootstrap listens on `PORT`, defaulting to `3000` for local development.
- Global route prefix: `api/v1`.
- Server configuration consumes `NODE_ENV`, `PORT`, `DATABASE_URL`, and `CORS_ORIGINS`.
- Root workspace list includes `apps/mobile`, `services/api`, and `packages/contracts`.

- [ ] **Step 1: Add failing workspace checks** that assert root npm workspaces include the API and contracts packages and preserve existing mobile scripts.
- [ ] **Step 2: Run the checks** and verify they fail on the current root package manifest.
- [ ] **Step 3: Create the NestJS workspace** with the minimal required Nest packages, TypeScript configuration, and scripts: `start`, `start:dev`, `build`, `typecheck`, `test`, and `test:e2e`.
- [ ] **Step 4: Add validated configuration** so missing required values fail startup with a safe, actionable message; never print secret values.
- [ ] **Step 5: Extend root npm workspaces and scripts** while retaining the current mobile test and build behavior.
- [ ] **Step 6: Generate and commit `package-lock.json`** using the repository's npm version; verify a clean `npm ci` install.
- [ ] **Step 7: Run workspace checks, API build, and existing mobile tests**; verify no mobile route or tab behavior changed.

## Task 3: Add local PostgreSQL and Prisma

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `database/prisma/schema.prisma`
- Create: `database/prisma/seed.ts`
- Create: `services/api/src/database/database.module.ts`
- Create: `services/api/src/database/prisma.service.ts`
- Modify: `services/api/package.json`
- Modify: root `package.json`

**Interfaces:**
- Local database service name: `postgres`.
- Local database port: `5432`; credentials are development-only and configurable.
- Prisma service exposes a lifecycle-managed `PrismaService` to Nest modules.
- Root scripts: `db:up`, `db:down`, `db:migrate`, `db:deploy`, and `db:seed`.

- [ ] **Step 1: Write database integration tests** for Prisma connection, clean migration application, and deterministic seed behavior.
- [ ] **Step 2: Run the tests** and verify they fail before the database module and schema exist.
- [ ] **Step 3: Add Docker Compose PostgreSQL** with a named data volume and health check; do not expose database credentials as committed production secrets.
- [ ] **Step 4: Define the initial Prisma schema** for the minimum health and first vertical-slice needs. Include users, profiles/roles as determined by ADR-002, destinations, providers, experiences, enquiries, and enquiry status history only where required by approved behavior.
- [ ] **Step 5: Implement PrismaService** with safe connect/disconnect lifecycle handling and inject it through DatabaseModule.
- [ ] **Step 6: Generate the initial migration** from the schema and commit the generated migration files.
- [ ] **Step 7: Run migration tests against an empty database** and verify the schema is created without destructive reset commands.
- [ ] **Step 8: Run seed twice** and verify deterministic, non-duplicating development records.
- [ ] **Step 9: Document local database commands** and confirm all secrets are absent from tracked files.

## Task 4: Implement API health, validation, and OpenAPI

**Files:**
- Create: `services/api/src/health/health.module.ts`
- Create: `services/api/src/health/health.controller.ts`
- Create: `services/api/src/health/health.service.ts`
- Create: `services/api/src/common/filters/api-exception.filter.ts`
- Create: `services/api/src/common/interceptors/request-id.interceptor.ts`
- Modify: `services/api/src/main.ts`
- Modify: `services/api/src/app.module.ts`

**Interfaces:**
- `GET /api/v1/health` returns the shared `HealthResponse`.
- Database status is determined by a real bounded database probe, not a hard-coded success value.
- Swagger UI is exposed at `/api/docs` in local development.
- Global validation rejects unknown fields and invalid DTO values.
- Every response carries or exposes a request identifier suitable for support diagnostics.

- [ ] **Step 1: Write e2e tests** for healthy database response, database unavailable response, API prefix, Swagger document availability, validation rejection, and stable error envelope.
- [ ] **Step 2: Run the e2e tests** and verify the health route and middleware behavior are not implemented yet.
- [ ] **Step 3: Implement HealthModule** and a bounded Prisma connectivity probe.
- [ ] **Step 4: Configure global prefix, ValidationPipe, CORS allowlist, request ID, and safe exception mapping** in the Nest bootstrap.
- [ ] **Step 5: Add Swagger/OpenAPI setup** with version and endpoint descriptions.
- [ ] **Step 6: Run e2e tests** with PostgreSQL healthy and unavailable; verify the API never reports database readiness when the probe fails.
- [ ] **Step 7: Inspect generated OpenAPI** and verify the documented health response and error envelope match the shared contracts.

## Task 5: Connect the Expo app to the local API

**Files:**
- Create: `apps/mobile/src/services/api/config.ts`
- Create: `apps/mobile/src/services/api/client.ts`
- Create: `apps/mobile/src/services/api/health.ts`
- Create: `apps/mobile/src/services/api/api-error.ts`
- Create: `docs/engineering/LOCAL-API-SETUP.md`
- Modify: Expo app configuration only if needed to expose `EXPO_PUBLIC_API_URL`.
- Modify: `apps/mobile/package.json` only if a compatible dependency is required.

**Interfaces:**
- `getApiBaseUrl(): string` returns a validated base URL from Expo public configuration.
- `apiRequest<T>(path: string, init?: RequestInit): Promise<T>` provides timeout, JSON parsing, and normalized API errors.
- `getApiHealth(): Promise<HealthResponse>` calls `GET /api/v1/health`.
- No access tokens, database credentials, or private secrets are included in Expo public variables.

- [ ] **Step 1: Write mobile unit tests** for base URL validation, URL joining, successful JSON response parsing, non-2xx error mapping, malformed JSON, and request timeout.
- [ ] **Step 2: Run tests** and verify they fail because the API client does not exist.
- [ ] **Step 3: Implement config and API client** with a bounded timeout and consistent error mapping.
- [ ] **Step 4: Implement the health adapter** using the shared `HealthResponse` contract.
- [ ] **Step 5: Document connection addresses** for same-host development, Android emulator, and a physical Android device on the same LAN; explain that the device must use the host's reachable LAN address rather than `localhost`.
- [ ] **Step 6: Run mobile tests and type-check** and verify existing navigation tests remain unchanged and passing.
- [ ] **Step 7: Perform a manual physical-device smoke test**: open the app, call health, confirm the returned service/database status, and record the tested network configuration without committing a personal LAN address.

## Task 6: Implement public destination and experience read APIs

**Files:**
- Create: `services/api/src/destinations/destinations.module.ts`
- Create: `services/api/src/destinations/destinations.controller.ts`
- Create: `services/api/src/destinations/destinations.service.ts`
- Create: `services/api/src/experiences/experiences.module.ts`
- Create: `services/api/src/experiences/experiences.controller.ts`
- Create: `services/api/src/experiences/experiences.service.ts`
- Create: destination and experience DTOs under each module.
- Create: corresponding contract types under `packages/contracts/src/`.
- Modify: `services/api/src/app.module.ts`

**Interfaces:**
- `GET /api/v1/destinations` returns published destinations only, with bounded pagination.
- `GET /api/v1/destinations/:id` returns one published destination or a non-enumerating not-found response.
- `GET /api/v1/experiences` supports documented destination/category filters and bounded pagination.
- `GET /api/v1/experiences/:id` returns one published experience or not found.
- Response fields must be approved and defined in shared contracts before controller implementation.

- [ ] **Step 1: Define DTO and contract tests** for pagination bounds, unknown query parameters, filters, unpublished records, and not-found behavior.
- [ ] **Step 2: Run tests** and verify the endpoints/contracts are not implemented.
- [ ] **Step 3: Add only the indexes needed** for the selected filters and ordering; avoid speculative search infrastructure.
- [ ] **Step 4: Implement services** using Prisma and explicit published-record filters.
- [ ] **Step 5: Implement controllers and DTO validation** using the shared contracts.
- [ ] **Step 6: Add database-backed e2e tests** for list/detail, pagination, filtering, and unpublished-record exclusion.
- [ ] **Step 7: Verify generated OpenAPI** and ensure no provider-private fields or internal moderation fields leak into public responses.

## Task 7: Add authentication, authorization, and enquiry vertical slice

**Files:**
- Create: `services/api/src/identity/*`
- Create: `services/api/src/authorization/*`
- Create: `services/api/src/providers/*`
- Create: `services/api/src/enquiries/*`
- Create: `services/api/src/audit/*`
- Create: protected endpoint contracts and DTOs under `packages/contracts/src/`.
- Create: `docs/security/IRIFE-API-THREAT-MODEL.md`
- Modify: Prisma schema and migrations only through additive reviewed migrations.

**Interfaces:**
- Authentication/session behavior must match ADR-002.
- `POST /api/v1/enquiries` creates a request for the authenticated user; client-supplied user identity is ignored/rejected.
- `GET /api/v1/me/enquiries` lists only the authenticated user's requests.
- `GET /api/v1/me/enquiries/:id` returns only an owned request.
- Enquiry transitions are explicit server-side operations with actor, timestamp, prior state, next state, and safe reason/reference.
- Provider access is restricted to the provider account and requests assigned to it.

- [ ] **Step 1: Write authorization negative tests** for anonymous access, cross-user request reads, cross-provider access, role escalation, and invalid state transitions.
- [ ] **Step 2: Run tests** and verify unauthorized cases fail before implementation.
- [ ] **Step 3: Implement identity/session handling** according to ADR-002, including expiry, refresh/revocation behavior, secure password handling if passwords are used, and safe token storage guidance for mobile.
- [ ] **Step 4: Implement centralized authorization policies** for traveler, provider, and administrator roles; deny by default.
- [ ] **Step 5: Implement enquiry service state transitions** with transaction-safe updates and status history.
- [ ] **Step 6: Implement enquiry controllers** and derive the acting user only from the validated server session.
- [ ] **Step 7: Add rate limiting** to authentication and enquiry submission, with configurable local defaults.
- [ ] **Step 8: Run full authorization and lifecycle e2e tests** including cross-user and cross-provider denial.
- [ ] **Step 9: Complete the scoped threat model** and verify logging redacts credentials and personal data.

## Task 8: CI, documentation, and branch acceptance

**Files:**
- Modify: `.github/workflows/blank.yml`
- Modify: root `package.json`
- Modify: `README.md` or engineering setup docs as needed.
- Create/update: `docs/engineering/LOCAL-API-SETUP.md`

**Interfaces:**
- CI validates install, mobile tests/type-check, API tests/type-check/build, and contracts tests.
- CI uses `npm ci` from the committed lockfile.
- CI does not deploy or publish artifacts to production.

- [ ] **Step 1: Add CI validation checks** for the root workspace and each workspace's test/build commands.
- [ ] **Step 2: Run the workflow locally where supported** and verify the exact CI commands pass from a clean checkout.
- [ ] **Step 3: Verify CI does not contain automatic deployment triggers** or production credentials.
- [ ] **Step 4: Run full acceptance commands**: clean install, database up, migrations, API tests, mobile tests, type-check, and builds.
- [ ] **Step 5: Review changed files** to confirm brand assets are untouched, no secrets are tracked, and no unrelated files changed.
- [ ] **Step 6: Prepare a pull request** with architecture summary, test evidence, migration notes, security review, and known limitations. Do not merge it without explicit approval.

## Follow-on cloud phase (not part of this implementation branch)

After the local foundation is accepted and separately approved:
1. Select a hosting provider and managed PostgreSQL based on cost, region, backups, data residency, and operational requirements.
2. Define staging and production environments with separate credentials and databases.
3. Configure HTTPS, secret management, health probes, backups, restore testing, and monitoring.
4. Deploy to staging first and run smoke, migration, and security checks.
5. Obtain explicit approval before production deployment or public API exposure.

## Definition of Done

- Local API and PostgreSQL start from documented commands.
- Prisma migrations apply to a clean database and seed data is deterministic.
- Health endpoint accurately reports database connectivity.
- OpenAPI matches the implemented API and shared contracts.
- Mobile app reaches local health endpoint from a physical Android device.
- Destination and experience read APIs expose only published content.
- Enquiry endpoints enforce identity, ownership, provider boundaries, and valid state transitions.
- Existing mobile tests and type-check continue passing.
- CI validates all workspaces with `npm ci` and does not deploy.
- No secrets, personal LAN addresses, or unrelated brand-asset changes are committed.
