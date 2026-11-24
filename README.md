# IRIFE

**Discover Morocco. Experience it differently.**

IRIFE is a mobile-first travel discovery and experience platform focused on Morocco. It is being built to help domestic and international travelers discover destinations and experiences, contact providers through structured enquiries, and track the status of their requests.

> **Development status:** active foundation work. This repository is the current engineering source of truth while the planned repository-name consolidation is pending. Do not interpret the presence of a screen, route, or document as proof that its end-to-end backend integration is complete.

## Product scope

The current foundation is focused on a secure, testable traveler journey:

- Explore destinations and experiences.
- View destination and experience details.
- Register and authenticate traveler accounts.
- Submit structured enquiries and booking requests.
- View and manage the authenticated traveler's own requests.
- Save experiences and manage basic traveler profile and preferences.

The initial Morocco launch cities are Marrakesh, Casablanca, Chefchaouen, Agadir, Tangier, and Fez. Catalogue coverage and provider onboarding remain subject to content verification and supplier acceptance.

Payments, payouts, guaranteed live availability, flight and hotel booking, and production deployment are outside the current foundation scope.

## Technology

| Area | Stack |
|---|---|
| Mobile | Expo, React Native, TypeScript, Expo Router |
| API | NestJS, TypeScript, REST |
| Database | PostgreSQL, Prisma |
| Shared contracts | TypeScript workspace package |
| Quality | Node.js test runner, Jest, TypeScript checks, GitHub Actions |
| Local database | Docker Compose |

## Repository layout

```text
apps/mobile/       Expo mobile application
services/api/      NestJS API
packages/contracts Shared API contracts
database/prisma/   Prisma schema and migrations
docs/              Product, architecture, design, and security documentation
scripts/           Workspace and repository checks
```

## Getting started

### Requirements

- Node.js 22.22.3 or newer (CI currently runs Node.js 24).
- npm 10.9.0 or newer.
- Docker with Docker Compose for local PostgreSQL.

### Install dependencies

```bash
npm ci
```

### Configure the local API

Copy `.env.example` to `.env` and adjust values only for your local environment. The checked-in example uses local development-only credentials; never reuse them outside a local machine.

### Start PostgreSQL and prepare the database

PostgreSQL 18 stores its cluster under the versioned path and the Compose file mounts the parent data directory. The current configuration uses a new named volume, irife_postgres_data_v18. Any older irife_postgres_data volume is deliberately left untouched; back it up and migrate it separately before removing it.

```bash
docker compose up -d postgres
npm run db:validate
npm run db:migrate
```

### Run quality checks

```bash
npm test
npm run build
```

### Start the API

```bash
npm run api:dev
```

### Start the mobile app

In a second terminal:

```bash
npm run start --workspace=@irife/mobile
```

For physical Android devices, configure `EXPO_PUBLIC_API_URL` to use the development machine's trusted LAN address. Do not use `localhost` from a physical phone and do not expose the development API publicly.

See [Mobile setup](apps/mobile/README.md) for device-specific instructions.

## Engineering and security

- Work on feature branches and submit pull requests; do not commit directly to `main`.
- Server-side authorization is authoritative. Client-side route guards are not security controls.
- Keep secrets, local environment files, and personal data out of Git.
- Do not fabricate prices, ratings, provider verification, or live availability.
- Every change should include relevant tests and documentation.
- Production deployment and payment integrations require separate design review and explicit approval.

## Project documentation

- [Product requirements](docs/product/IRIFE-PRD.md)
- [System architecture](docs/architecture/IRIFE-SYSTEM-ARCHITECTURE.md)
- [Backend and API design](docs/architecture/IRIFE-BACKEND-API-DESIGN.md)
- [Visual design direction](docs/design/IRIFE-VISUAL-DESIGN-DIRECTION.md)
- [Threat model](docs/security/IRIFE-THREAT-MODEL.md)
- [Engineering foundation](docs/engineering/FOUNDATION.md)

## Brand and AI

IRIFE is the traveler-facing product. **ITRI** is the planned AI engine name; AI itinerary generation and personalized recommendations are not part of the current foundation release until their service, privacy, and quality requirements are approved.

---

IRIFE — Discover More. Experience Better.
