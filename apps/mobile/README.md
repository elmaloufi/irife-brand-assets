# IRIFE Mobile

Expo + React Native + TypeScript foundation for IRIFE.

## Current status

This is the mobile application shell. It provides the root navigation and initial Home, Discover, Requests, and Profile routes. Catalogue data, authentication, API connectivity, and booking-request operations are not implemented yet.

No sample providers, ratings, prices, or availability are presented as real data.

## Requirements

- Node.js compatible with Expo SDK 57 (Node 22.13+; use the current supported LTS release).
- npm.
- Expo Go on a physical Android device for the initial device preview.

The foundation currently targets Expo SDK 57 because Expo's current documentation identifies SDK 57 as the compatible choice for Expo Go on physical devices during the SDK 58 transition. Revisit this decision when the device runtime supports the newer SDK or when a development build is adopted.

## Commands

From the repository root:

```bash
npm install
npm run build
npm run start --workspace=@irife/mobile
```

Scan the QR code with Expo Go on Android. Keep the development machine and phone on the same network, or use the Expo CLI tunnel option when local network discovery is unavailable.

## Engineering rules

- Do not commit secrets or local environment files.
- Keep API and authentication rules on the server.
- Do not add fabricated catalogue content.
- Add features with typed contracts and tests.
- Do not deploy production builds from this foundation branch.
