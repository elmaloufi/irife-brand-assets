# IRIFE dependency remediation policy

## Scope

IRIFE uses a guarded remediation workflow for npm workspaces and the Expo mobile app. The workflow is intentionally branch-only: it never writes to `main`, creates a pull request, or merges a change.

## Remediation sequence

1. Resolve the lockfile from the checked-in manifests and reviewed npm overrides.
2. Run `npm audit fix` without `--force`.
3. Run `npx expo install --fix` against the Expo SDK already declared by the app.
4. Reinstall with `npm ci` and re-run the audit.
5. Require Expo compatibility checks, Expo Doctor, the complete test suite, workspace build, Android prebuild/export, and iOS prebuild/export.
6. Publish a dedicated `security/*` branch only if every final gate passes.
7. Re-run the security regression workflow against the published branch.

## Explicitly prohibited

- `npm audit fix --force`
- `--legacy-peer-deps` as a way to bypass dependency conflicts
- automatic major-version upgrades of Expo, React Native, NestJS, or Prisma
- automatic downgrades of Prisma or changes to Prisma migration history
- automatic commits to `main`, pull requests, or merges

## Current reviewed override

The root manifest pins the transitive `effect` package to `3.22.1`, the first patched release for GHSA-7589-6fvf-x4pw. The override is deliberately treated as a candidate, not as a verified fix: the remediation pipeline must still validate Prisma configuration, API tests, and workspace builds before publishing a branch.

The Expo compatibility drift is resolved against the current SDK 57 release line, not by upgrading to SDK 58. Expo's SDK 57 documentation recommends Expo Router `~57.0.32`; the automated Expo installer is responsible for aligning the rest of the SDK-managed packages.

## Failure behavior

If a vulnerability remains, a package cannot be aligned, or any validation fails, the workflow stops without publishing a remediation branch. The failure is evidence that the dependency graph needs a deliberate engineering change, not permission to force an upgrade.
