# ADR-0001: Native development builds for Android and iOS

- **Status:** Accepted
- **Date:** 2026-11-28
- **Decision owners:** IRIFE project

## Context

IRIFE is a production-oriented mobile application. Development and verification must run against an application binary built from IRIFE's own native project configuration, so native dependencies, application identity, permissions, deep links, and platform behavior are controlled by this repository.

## Decision

- Keep React Native, the Expo SDK modules already used by the application, and Expo Router.
- Use native Android and iOS development builds for device testing.
- Start Metro with the explicit development-build target: `expo start --dev-client`.
- Build and install Android with `expo run:android`; build and install iOS with `expo run:ios` on macOS.
- Generate native project files with `expo prebuild` when needed. Do not run clean prebuilds over unreviewed native changes.
- Do not use the shared Expo Go runtime as a development, QA, or release target.
- Keep SDK-compatible dependency versions aligned with the selected Expo SDK and verify them with the project's compatibility checks.

## Consequences

- Device testing uses IRIFE's own native application binary and configuration.
- Android builds require a configured Android SDK/JDK toolchain. iOS builds require macOS and Xcode.
- The JavaScript development server does not replace the native build; a compatible IRIFE development binary must be installed first.
- Changes to native dependencies or native configuration require a new native build.
- This decision does not remove Expo SDK modules that IRIFE uses for routing, secure storage, fonts, or native configuration.

## References

- [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo CLI launch targets](https://docs.expo.dev/more/expo-cli/)
- [Expo SDK reference](https://docs.expo.dev/versions/57.0.0/)
