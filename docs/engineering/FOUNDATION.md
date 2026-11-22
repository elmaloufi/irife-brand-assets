# IRIFE — Engineering Foundation

## Project direction
IRIFE is a mobile-first platform for discovering destinations and experiences in Morocco, connecting travelers with experience providers, and managing enquiry/booking requests.

## Approved technical decisions
- Mobile: Expo + React Native + TypeScript.
- Navigation: Expo Router.
- Database: PostgreSQL, run locally through Docker for development.
- Payments: explicitly out of scope for the foundation phase.
- Repository: existing repository, `elmaloufi/irife-brand-assets`.
- Production deployment: prohibited until separately approved.
- Git workflow: work on feature branches; do not commit directly to `main`.

## Foundation sequence
1. Audit the existing repository and CI workflows before changing or deleting files.
2. Establish product requirements, system architecture, threat model, and architecture decision records.
3. Create the Expo application shell with strict TypeScript and Expo Router.
4. Define versioned API contracts before implementing backend behavior.
5. Add local PostgreSQL via Docker Compose and repeatable database migrations.
6. Deliver one tested vertical slice: browse destinations/experiences, view details, submit an enquiry, and view the user's own requests.
7. Add security, accessibility, automated tests, and CI gates; review changes through a pull request.

## Initial domain boundaries
- Identity and profiles
- Destinations and places
- Experiences and providers
- Search and discovery
- Enquiries and booking lifecycle (no payment processing)
- Reviews and trust signals
- Notifications and preferences

## Security requirements
- Enforce authorization on the server for every user-owned resource.
- Prevent users from reading or changing another user's enquiries.
- Validate inputs at trust boundaries and rate-limit sensitive endpoints.
- Keep secrets out of source control; commit only safe placeholders in example environment files.
- Minimize personal data and define retention before collecting it.
- Do not claim live availability or provider verification without authoritative evidence.

## Definition of done
A change is complete only when its acceptance criteria, automated tests, security implications, and documentation have been reviewed. CI must pass before merge. No production deployment, payment activation, or merge to `main` without explicit approval.
