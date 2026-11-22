# IRIFE API — local development

## Requirements

- Node.js 24 (or Node.js 22.22.3+)
- npm 10.9+
- Docker Engine with the Compose plugin

## Install dependencies and start PostgreSQL

From the repository root:

```sh
npm ci
cp .env.example .env
npm run db:up
npm run db:status
```

The local database uses a named Docker volume. `npm run db:down` stops the container but preserves data. Do not use `docker compose down -v` unless you intentionally want to delete the local database.

## Apply migrations and start the API

```sh
npm run db:validate
npm run db:migrate
npm run api:dev
```

The API listens on port 3000. Health is available at `http://localhost:3000/api/v1/health`; local OpenAPI documentation is at `http://localhost:3000/api/docs`.

A healthy response reports `status: "ok"` and `database: "up"`. If PostgreSQL is unreachable, the endpoint returns HTTP 503 with `status: "degraded"` and `database: "down"`; internal connection details are not exposed.

## Physical Android device

A physical phone cannot reach the development host through its own `localhost`. Put the phone and development host on the same trusted Wi-Fi network, allow inbound TCP port 3000 on the host firewall, and configure the Expo public API URL to the host's reachable LAN address. Do not commit a developer-specific LAN address. Keep the API bound to the local development network and do not expose it publicly.

## Database safety

- The committed local credentials are development-only and must never be reused outside a local machine.
- Migrations are additive and are applied with `prisma migrate deploy`.
- Use `prisma migrate dev` only against a disposable/local development database.
- Never reset or drop a database to resolve a migration error without reviewing the data impact first.
