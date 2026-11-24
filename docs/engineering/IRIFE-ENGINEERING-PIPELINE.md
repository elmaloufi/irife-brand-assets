# IRIFE Engineering Pipeline

## Scope

This repository uses GitHub Actions to validate the Expo mobile workspace, shared contracts, NestJS API, Prisma schema and PostgreSQL migrations. The pipeline is a quality and security gate; it is not a production deployment system.

## Workflows

| Workflow | Responsibility | Trigger |
|---|---|---|
| ci.yml | Node.js 24, locked npm install, Expo peer dependency validation, Prisma validation and migrations, workspace tests, API/contracts build and mobile type-check | Push to development branches, pull requests to main, manual |
| codeql.yml | Static analysis for GitHub Actions and JavaScript/TypeScript | Main push, pull requests, weekly schedule |
| dependency-review.yml | Reject dependency changes introducing high or critical known vulnerabilities | Pull requests to main |
| security.yml | Gitleaks history scan and npm lockfile audit | Push, pull requests, weekly schedule, manual |
| docker-image.yml | Validate Docker Compose and start PostgreSQL with a health check | Push, pull requests, manual |

## Runtime and database

- CI uses Node.js 24, consistent with the repository's supported Node.js engine range.
- npm installs from the committed root package-lock.json.
- CI uses an ephemeral PostgreSQL 18 service and local-only test credentials.
- Prisma migrations are applied to a clean database before tests.
- The Docker Compose workflow validates the checked-in PostgreSQL service. It does not build an application image because this repository currently has no root Dockerfile.

## Security model

- Workflows receive read-only repository permissions by default.
- Dependency review blocks high and critical severity dependency changes.
- Gitleaks scans the checked-out Git history for exposed credentials.
- CodeQL analyzes JavaScript/TypeScript and GitHub Actions.
- Dependabot proposes updates for npm dependencies, GitHub Actions and Docker images.
- Never commit production credentials, local .env files, access tokens or customer data.

## Release and deployment policy

Production deployment is intentionally not configured. There is no automatic deployment on pushes, pull requests, tags or successful CI runs. The former automatic GHCR publishing workflow has been removed. Container publishing, deployment credentials, production environments and release automation must be designed separately and require explicit manual approval.

## Required GitHub branch protection

Configure repository rules for main in GitHub Settings:

1. Require pull requests before merging.
2. Require the quality check from IRIFE CI.
3. Require the postgres-compose check from IRIFE Docker Compose CI.
4. Require the secret-scan and dependency-audit checks from IRIFE Security Checks.
5. Require CodeQL analysis and dependency review.
6. Require branches to be up to date before merging.
7. Block force pushes and deletion of main.

Branch protection is a repository setting and must be verified in GitHub Settings; adding workflow files alone does not enforce it.

## Known security gate findings

The first lockfile audit reported six high-severity vulnerability instances, including decode-uri-component through Expo Router and effect through Prisma configuration. The audit intentionally remains blocking. Do not run npm audit fix --force: npm reports that doing so would downgrade core Expo Router, Prisma and Jest packages. Resolve these through compatible upstream releases or a separately tested, narrowly scoped dependency override, then rerun the complete mobile/API test and build suite.

## Validation boundaries

A green GitHub CI run proves the checks executed in GitHub's Linux runner. It does not replace physical Android/iOS runtime testing, review of real production configuration, external penetration testing or explicit release approval.
