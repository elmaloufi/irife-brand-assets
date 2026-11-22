# IRIFE Mobile

Expo + React Native + TypeScript foundation for IRIFE.

## Current status

The mobile shell includes the root navigation and Home, Discover, Requests, and Profile routes. A typed API client is available for the local NestJS API, including a health adapter. Destination and experience catalogue screens are not yet connected to live API data.

No sample providers, ratings, prices, or availability are presented as real data.

## Requirements

- Node.js 24 (or Node.js 22.22.3+).
- npm.
- Expo Go on a physical Android device for the initial device preview.

The foundation currently targets Expo SDK 57 for the supported Expo Go device preview. Revisit this decision when the device runtime supports the newer SDK or when a development build is adopted.

## Commands

From the repository root:

```bash
npm ci
npm run build
npm run start --workspace=@irife/mobile
```

## Connect a physical Android device to the local API

Set `EXPO_PUBLIC_API_URL` in the local environment before starting Expo. Use the development computer's LAN address, not `localhost` or `127.0.0.1`, for a physical phone. Example only:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000 npm run start --workspace=@irife/mobile
```

Replace the example address with the computer's actual trusted-LAN address. Keep the phone and computer on the same Wi-Fi network and allow inbound TCP port 3000 on the computer firewall. Android emulator users can use `http://10.0.2.2:3000`. Do not commit a developer-specific address or expose the development API to the public internet.

## API client

- `getApiBaseUrl()` validates the public Expo API URL and rejects credentials, query strings, fragments, and non-HTTP protocols.
- `apiRequest<T>()` enforces relative API paths, applies a 10-second default timeout, parses JSON, and normalizes HTTP/network failures.
- `getApiHealth()` reads the shared `HealthResponse` contract from `GET /api/v1/health`.

## Engineering rules

- Do not commit secrets or local environment files.
- Keep API and authentication rules on the server.
- Do not add fabricated catalogue content.
- Add features with typed contracts and tests.
- Do not deploy production builds from this foundation branch.
