# IRIFE Mobile

Native Android/iOS application built with React Native, Expo SDK modules, Expo Router, and TypeScript. The app is developed and run as its own native application; the shared Expo Go runtime is not part of the development or release workflow.

## Current status

The mobile shell includes the root navigation and Home, Discover, Requests, and Profile routes. A typed API client is available for the local NestJS API, including a health adapter. Destination and experience catalogue screens are not yet connected to live API data.

No sample providers, ratings, prices, or availability are presented as real data.

## Requirements

- Node.js 24 (or Node.js 22.22.3+).
- npm 10.9.0 or newer.
- Android development: Android Studio, Android SDK and a compatible JDK configured in the build environment.
- iOS development: macOS with Xcode and CocoaPods.
- A physical Android device with USB debugging enabled, or an Android emulator.

## Native development workflow

From the repository root:

```bash
npm ci
npm run build
npm run android --workspace=@irife/mobile
```

The Android command generates the native Android project when it is absent, builds the native application, and installs it on the selected device/emulator. For a physical Android device, enable USB debugging and authorize the computer.

To run the JavaScript development server against the installed native application:

```bash
npm run start --workspace=@irife/mobile
```

The start command explicitly targets a native development build. It does not launch the shared Expo Go application. A native application binary must already be installed on the device.

For iOS, run `npm run ios --workspace=@irife/mobile` from macOS with Xcode installed.

To generate native project files without starting a build:

```bash
npm run prebuild --workspace=@irife/mobile
```

Do not use a destructive clean-prebuild option on a working native project without reviewing and backing up native changes first.

## Connect a physical Android device to the local API

Set `EXPO_PUBLIC_API_URL` in the local environment before starting the development server. Use the development computer's LAN address, not `localhost` or `127.0.0.1`, for a physical phone. Example only:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.20:3000 npm run start --workspace=@irife/mobile
```

Replace the example address with the computer's actual trusted-LAN address. Keep the phone and computer on the same Wi-Fi network and allow inbound TCP port 3000 on the computer firewall. Android emulator users can use `http://10.0.2.2:3000`. Do not commit a developer-specific address or expose the development API publicly.

## API client

- `getApiBaseUrl()` validates the public API base URL and rejects credentials, query strings, fragments, and non-HTTP protocols.
- `apiRequest<T>()` enforces relative API paths, applies a 10-second default timeout, parses JSON, and normalizes HTTP/network failures.
- `getApiHealth()` reads the shared `HealthResponse` contract from `GET /api/v1/health`.

## Engineering rules

- Do not commit secrets or local environment files.
- Keep API and authentication rules on the server.
- Do not add fabricated catalogue content.
- Add features with typed contracts and tests.
- Native Android/iOS builds must be tested on their target platform before release.
- Do not deploy production builds from this foundation branch.
