# IRIFE integrations selected from public-apis

The public-apis repository is a discovery catalogue, not a unified runtime API. Each provider has independent authentication, usage limits, attribution, and licensing requirements.

## Integrations

| Capability | Provider | Configuration | Notes |
| --- | --- | --- | --- |
| Weather | Open-Meteo | None for eligible non-commercial use | 10-minute server cache; coordinate precision is normalized to 3 decimals. Attribute weather data to Open-Meteo. |
| Geocoding | OpenStreetMap Nominatim | `NOMINATIM_BASE_URL`, `NOMINATIM_USER_AGENT` | 30-day cache and serialized 1.1-second request spacing per API process. Not autocomplete; use only explicit user-triggered searches. |
| Events primary | Ticketmaster Discovery API | `TICKETMASTER_API_KEY` | Preferred when configured. |
| Events fallback | OpenAgenda API v2 | `OPENAGENDA_API_KEY` | Free API with required authentication; searches public agendas by city, then fetches current/upcoming events. Event coverage depends on published agendas in the target city. |
| ITRI chat | OpenAI-compatible chat completions | `ITRI_AI_BASE_URL`, `ITRI_AI_API_KEY`, `ITRI_AI_MODEL` | Disabled until configured. |

## API routes

- `GET /api/v1/integrations/weather?latitude=31.6295&longitude=-7.9811`
- `GET /api/v1/integrations/geocoding?q=Marrakech&language=ar`
- `GET /api/v1/integrations/events?city=Marrakech&countryCode=MA`
- `POST /api/v1/integrations/itri/chat` (Bearer-authenticated)

## Caching and rate limits

- Provider cache is in-process, bounded to 500 keys, coalesces concurrent identical requests, and caches successful responses only.
- Weather TTL: 10 minutes. Geocoding TTL: 30 days. Events TTL: 5 minutes.
- API caller limits per process/IP: weather 30/minute, geocoding 10/minute, events 10/minute, ITRI 12/minute.
- Nominatim requests are spaced by at least 1.1 seconds within one API process. Do not run multiple API replicas against the public Nominatim endpoint; this in-memory gate is not a distributed global limiter. Use a shared limiter or a self-hosted geocoder before horizontal scaling.
- Cache and request limits are process-local. For multi-replica production, replace them with a shared Redis/PostgreSQL implementation before increasing traffic.

## ITRI grounding

Each authenticated chat request loads only published destinations and experiences from PostgreSQL. Experiences are included only when their provider is active and their destination is published. The model receives a bounded context (up to 8 destinations and 10 experiences) and explicit instructions not to invent price, availability, opening hours, ratings, or bookings. A stored `priceFrom` is described as a catalogue starting price, never as a live quote.

## Live provider smoke tests

Run `npm run test:providers:live --workspace=@irife/api` from a network-enabled environment. It makes one low-volume request to Open-Meteo and one explicit, non-autocomplete Nominatim query. A manually dispatched GitHub Actions workflow runs the same check. These checks are separate from mocked unit tests.

## Android acceptance

The backend adapters do not yet have a mobile screen integration. Before Android acceptance, configure a reachable API base URL and credentials in a non-production environment, start the API and PostgreSQL, then validate weather, explicit geocoding, event fallback, and authenticated ITRI chat from the Android app. Confirm that provider errors render safely, no secrets are present in the mobile bundle, and Arabic/RTL text remains correct. Physical-device verification is still required; CI build success is not a substitute.

## Provider policies

- Nominatim: maximum one request/second across the application, identifying User-Agent, attribution, caching, no autocomplete, and no systematic bulk queries. Public endpoint terms: https://operations.osmfoundation.org/policies/nominatim/
- Open-Meteo: free endpoint is for eligible non-commercial use; review commercial licensing and current quotas before monetizing. Attribution: https://open-meteo.com/
- OpenAgenda: API access is free but requires an API key; published agenda/event reuse is subject to each event's `rights` field and the applicable license. Docs: https://developers.openagenda.com/en/
- Ticketmaster: configure credentials only server-side and review its current developer terms.

Never commit provider credentials. Missing credentials disable the relevant adapter rather than returning fabricated data.
