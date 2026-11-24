# IRIFE Community and Contributor Operations

## Community model

IRIFE welcomes public contributions through the fork-and-pull-request workflow. Contributors do not need write access to the upstream repository. Maintainers review proposed changes before they enter `main`.

The project uses a mixed contribution model:
- Voluntary community contributions are welcome.
- Paid assignments exist only when agreed separately in writing before work starts, including scope, deliverables, compensation, timing, and payment terms.
- No issue, review, or contribution implies a job, contract, bounty, or guaranteed future payment.

## Contribution tracks

| Track | Typical work | Required evidence |
|---|---|---|
| Mobile | Expo, React Native, navigation, accessibility, performance | Tests, screenshots/video, device and OS details |
| Backend | NestJS, REST, Prisma, PostgreSQL, contracts | Unit/integration tests, API and migration notes |
| Security & quality | Threat model, secure coding, dependency hygiene, CI | Reproducible findings, impact, safe validation evidence |
| Design | UX flows, design system, RTL, motion, visual assets | Figma/specification, states, accessibility notes, asset license |
| AI / ITRI | Retrieval, itinerary logic, multilingual UX, evaluations | Dataset/source provenance, evaluation cases, failure behavior, privacy review |
| Documentation | Setup, architecture, API, Arabic/English docs | Verified commands, version context, links to source of truth |

## Intake and review lifecycle

1. Contributor reads `CONTRIBUTING.md` and checks existing issues/PRs.
2. Contributor opens or comments on an issue with the problem, proposed scope, track, and evidence.
3. A maintainer confirms whether the work is in scope and whether the contributor may proceed.
4. Contributor works in a fork and a focused branch.
5. Contributor opens a PR against `main`, completes the PR template, and links the issue.
6. CI and security checks run. Maintainer reviews correctness, security, architecture, UX, and documentation.
7. Contributor addresses review feedback. Only a maintainer merges after required checks and approvals.
8. Maintainer updates the issue and acknowledges the contribution.

## Labels to use

Create and apply these GitHub labels as needed:
- `good first issue`: small, bounded task suitable for a first contribution.
- `help wanted`: a task where outside help is actively welcome.
- `mobile`, `backend`, `security`, `design`, `ai`, `documentation`: workstream labels.
- `blocked`: work cannot proceed until a dependency or decision is resolved.
- `needs maintainer`: requires project-owner decision.

Do not label a task `good first issue` unless scope, acceptance criteria, and relevant files are clear.

## Access and trust

- Public contributors should use forks; do not grant repository write access as a default onboarding step.
- Start new collaborators with the least privilege needed. Triage is sufficient for issue coordination; Write is reserved for trusted, recurring contributors; Maintain is reserved for proven maintainers; Admin remains with the project owner.
- Never share production credentials, signing keys, payment secrets, customer data, or private environment files with contributors.
- Use synthetic or sanitized data in tests and screenshots.
- Require review for changes to authentication, authorization, cryptography, data access, migrations, CI workflows, release automation, and deployment configuration.
- CODEOWNERS routes review to the project owner; branch protection or repository rules must be configured separately to make approval mandatory.

## Maintainer checklist

- Confirm the issue is not a duplicate and has a clear acceptance criterion.
- Confirm the task does not expose secrets or require unauthorized testing.
- Keep changes small enough to review.
- Check CI, tests, dependency changes, migration safety, and documentation.
- For mobile UI, request real-device evidence when available.
- For ITRI, verify grounding, source provenance, uncertainty handling, privacy, and prompt-injection defenses.
- Do not merge while required checks are failing or security findings remain unexplained.
- Do not publish or deploy to production without explicit project-owner approval.

## Initial onboarding tasks

The first public issues should be small and verifiable. Suggested candidates after maintainer review:
- Improve setup documentation for Android physical-device testing.
- Add accessibility labels and test coverage to a bounded mobile component.
- Add API contract tests for an existing public endpoint.
- Expand RTL/localization documentation with verified examples.
- Add deterministic evaluation cases for ITRI data-grounding behavior.

These are proposals, not claims that the work is currently unassigned or ready to implement.
