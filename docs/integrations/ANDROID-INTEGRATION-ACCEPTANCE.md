# Android integration acceptance — public API phase 2

Status: pending physical-device execution.

The Expo API service layer now exposes typed calls for weather, explicit geocoding, city events, and authenticated ITRI chat. These adapters are ready for screen-level integration; the existing app screens have not yet been wired to them.

## Preconditions
- API and PostgreSQL are running in a non-production environment.
- Android build points to the reachable API host (not localhost on the handset).
- Server-only provider credentials are configured in the API environment; none are bundled into Expo.
- Nominatim attribution and Open-Meteo attribution are visible wherever their data is presented.

## Test matrix
- [ ] Weather: load Marrakech coordinates; confirm current and 3-day forecast; repeat request and verify server cache hit through request logs/metrics.
- [ ] Geocoding: explicitly search for Marrakech; confirm Arabic and English language headers; verify no keystroke autocomplete behavior.
- [ ] Events: with Ticketmaster key absent and OpenAgenda key present, confirm fallback provider and upcoming event records; verify empty coverage is shown as empty, not fabricated.
- [ ] ITRI: authenticate, ask about a published destination/experience, verify answers are grounded in database context; test an unknown destination and confirm ITRI says verified data is unavailable.
- [ ] Security: verify 401 for unauthenticated ITRI, 429 after provider route quota, and no API keys in mobile bundle/network responses.
- [ ] UX: test offline/timeout/provider error states, Arabic RTL, and Android back navigation.
- [ ] Regression: existing destination, experience, enquiry, saved-experience, and auth flows remain functional.

Record device model, Android version, app build, API commit, test date, and pass/fail evidence before approving the branch.
