# IRIFE integrations selected from public-apis

This document records the provider integrations selected after reviewing the public-apis catalogue. The catalogue is a discovery index, not a unified API or runtime dependency: https://github.com/public-apis/public-apis

## Enabled adapters

| IRIFE capability | Provider | Configuration | Notes |
| --- | --- | --- | --- |
| Weather | Open-Meteo | None for the public forecast endpoint | Review current attribution and fair-use requirements before production. |
| Geocoding | OpenStreetMap Nominatim | Optional `NOMINATIM_BASE_URL`, `NOMINATIM_USER_AGENT` | Respect the Nominatim usage policy, caching requirements, and rate limits. Not intended for high-volume production traffic. |
| Events | Ticketmaster Discovery API | `TICKETMASTER_API_KEY` | Disabled until a key is configured; provider coverage in Morocco must be verified. |
| ITRI chat | OpenAI-compatible chat-completions endpoint | `ITRI_AI_BASE_URL`, `ITRI_AI_API_KEY`, `ITRI_AI_MODEL` | Disabled until explicitly configured. Can target a compatible hosted or local provider; production requires HTTPS. |

## API routes

- `GET /api/v1/integrations/weather?latitude=31.6295&longitude=-7.9811`
- `GET /api/v1/integrations/geocoding?q=Marrakech&language=ar`
- `GET /api/v1/integrations/events?city=Marrakech&countryCode=MA`
- `POST /api/v1/integrations/itri/chat` (Bearer-authenticated)

The AI route accepts only user and assistant messages; system instructions remain server-controlled. Never send secrets or private traveler data to an external model without an approved privacy and retention review.

## Operational safeguards

- Provider calls have an 8-second timeout and return sanitized upstream errors.
- API credentials are read only from server environment variables and are never returned to clients.
- Missing optional provider credentials disable that integration rather than fabricating results.
- Provider responses are live external data, not verified IRIFE catalogue records. They must not be used as proof of price, booking availability, provider legitimacy, or service quality.
- Add provider-specific caching, quotas, monitoring, and contractual review before enabling production traffic.
- Review each provider's current terms, attribution, privacy, and usage limits independently. The public-apis catalogue license does not grant rights to use the listed providers.
