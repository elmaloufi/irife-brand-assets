# ADR-0001: Expo SDK choice for the first Android preview

- **Status:** Accepted for the foundation scaffold; review at the next SDK upgrade
- **Date:** 2026-11-19
- **Decision owners:** IRIFE project

## Context

IRIFE is being developed with Expo and React Native. Initial development must be testable on the project's available physical Android device without requiring a desktop-native toolchain.

Expo's current documentation lists SDK 58 as the latest SDK. During the documented SDK 58 transition period, Expo advises projects that need Expo Go on a physical device to use SDK 57. A development build can be considered later when native capabilities require it.

## Decision

Use the Expo SDK 57-compatible dependency set for the initial mobile foundation. Use Expo Router and TypeScript. Revisit the SDK version when Expo Go supports the next SDK on the physical device or when the team adopts a development build.

## Consequences

- The initial preview can target the physical Android device through Expo Go.
- Package versions must remain aligned with the selected SDK; use Expo's install/compatibility checks when adding SDK packages.
- This is a development compatibility decision, not a permanent commitment to SDK 57.
- Node.js must meet the selected SDK's supported minimum; use a currently supported Node LTS release.

## References

- [Expo SDK reference](https://docs.expo.dev/versions/latest/)
- [Expo Router installation](https://docs.expo.dev/router/installation/)
- [Create an Expo project](https://docs.expo.dev/more/create-expo/)
