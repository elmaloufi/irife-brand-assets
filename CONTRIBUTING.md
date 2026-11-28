# Contributing to IRIFE

Thank you for considering a contribution to IRIFE. We welcome respectful, practical contributions from developers, designers, security researchers, AI engineers, and documentation contributors around the world.

IRIFE is a Morocco-focused travel and experiences platform. **ITRI** is its planned AI engine. The project is under active development; a screen, route, API, or document is not proof that a complete production-ready feature exists.

## Before you start

1. Read the [README](README.md), [product requirements](docs/product/IRIFE-PRD.md), and the relevant architecture or security documents.
2. Search existing issues and pull requests to avoid duplicate work.
3. For a substantial change, open an issue or comment on an existing one and wait for maintainer alignment before investing significant effort.
4. Do not start work on an issue explicitly assigned to someone else without asking.
5. Keep contributions focused. One pull request should solve one coherent problem.

## Contribution areas

- **Mobile:** Expo, React Native, TypeScript, navigation, accessibility, performance, Android/iOS behavior.
- **Backend:** NestJS, REST APIs, PostgreSQL, Prisma, authorization, migrations, shared contracts.
- **Security and quality:** threat modeling, dependency review, secure defaults, tests, CI reliability. Only test systems and data you are authorized to test.
- **Design:** user flows, UI/UX, design system, accessibility, motion, and licensed visual assets. Include source files or inspectable specifications where practical.
- **AI / ITRI:** grounded retrieval, itinerary logic, multilingual behavior, evaluation, privacy, prompt-injection resistance, and transparent failure handling.
- **Documentation:** architecture, setup guides, API references, Arabic/English language improvements, and contributor onboarding.

## Development setup

Use the versions documented by the repository. The current CI baseline uses Node.js 24; install dependencies with:

```bash
npm ci
```

For local PostgreSQL and database checks:

```bash
docker compose up -d postgres
npm run db:validate
npm run db:migrate
```

Run the project checks relevant to your change:

```bash
npm test
npm run build
```

If your contribution changes database behavior, run the database checks. If it changes mobile UI, also validate the affected flow on a physical Android or iOS device when possible and state exactly what you tested. Do not report a device test you did not perform.

## Branch and commit rules

- Never push directly to `main`.
- Use a branch such as `feat/short-description`, `fix/short-description`, `docs/short-description`, or `security/short-description`.
- Keep commits small and descriptive, for example: `fix(mobile): handle empty destination results`.
- Rebase or update your branch from the latest `main` when needed; do not force-push shared branches.
- Open a pull request against `main` and allow maintainer review.

## Pull request requirements

A pull request should explain:
- The problem and why the change is needed.
- The implementation and any trade-offs.
- Related issue(s).
- Tests and commands actually run, including results.
- Screenshots or a short recording for visible UI changes.
- Migration, compatibility, accessibility, localization, and security impact where relevant.

All applicable CI checks must pass. A maintainer may request changes, additional tests, or a smaller scope. Passing CI is necessary but does not replace code review or physical-device validation for mobile behavior.

## Product and data integrity

- Never invent prices, ratings, provider verification, booking status, or live availability.
- User-facing travel facts must come from verified project data or a clearly identified trusted source.
- Treat server-side authorization as authoritative; client-side checks are not security boundaries.
- Do not commit secrets, access tokens, private keys, production data, personal data, or real customer records.
- Do not weaken security checks, skip failing tests, or add broad dependency overrides merely to make CI green.
- AI features must handle uncertainty explicitly, protect user data, and be evaluated for unsafe or misleading outputs.

## Design and asset licensing

Only submit images, fonts, icons, illustrations, audio, and other assets that you created or are licensed to use. Include the source and license/attribution requirements in the pull request. Do not copy assets from commercial travel sites or other apps.

## Security reports

Do not disclose exploitable vulnerabilities in public issues or pull requests. Follow [SECURITY.md](SECURITY.md) and use GitHub's private vulnerability reporting flow where it is available.

## Community and conduct

Participation is subject to the [Code of Conduct](CODE_OF_CONDUCT.md). Be constructive, explain disagreements with evidence, and respect contributors across languages, backgrounds, and experience levels.

## Volunteer and paid contributions

IRIFE currently uses a **mixed contribution model**:
- Community contributions are voluntary by default.
- A contribution is paid only when a maintainer and contributor agree to the scope, compensation, deliverables, and payment terms in writing before the paid work begins.
- Opening an issue, submitting a pull request, or receiving a review does not create an employment, contractor, or payment agreement.
- Do not assume that a future paid opportunity is guaranteed.

## First contributions

Look for issues labeled `good first issue` or `help wanted`. If no suitable issue exists, introduce yourself in an issue and describe the area you can help with. Maintainers will confirm scope and ownership before work begins.

Thank you for helping build IRIFE.
