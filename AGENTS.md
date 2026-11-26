# AGENTS.md

Course project: REST API on **Bun + Elysia + Drizzle ORM (PostgreSQL)**. Single package, no monorepo.

## Commands

- `bun install` — deps (bun.lock only; don't use npm/pnpm/yarn)
- `bun run dev` — dev server with reload, `http://localhost:3100` (port from `APP_PORT`, default 3100 — not 3000)
- `bunx tsc --noEmit` — typecheck; **there is no typecheck/lint/format script or config** — this is the only verification step
- `bun test` — currently zero test files (prints an error, exits 0)
- `bun run build` then `bun run start` — production bundle

`README.md` is stale bun-init boilerplate (`bun run index.ts` doesn't exist) — trust `package.json` scripts.

## Database

`/api/products` and all drizzle commands need Postgres running:

1. `docker compose up -d db` — postgres:19 on `:5432`, credentials interpolated from `.env`
2. `bun run migrate:dev` — `drizzle-kit generate`: writes SQL into `drizzle/` only, **does not touch the DB**
3. `bun run migrate:apply` — `drizzle-kit migrate`: applies generated SQL
4. `bun run drizzle:studio`

- `.env` must define `DATABASE_URL`, `APP_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`. `drizzle.config.ts` and `src/db/index.ts` throw at import time if `DATABASE_URL` is missing — the server won't boot without it, even for DB-less routes.
- drizzle-kit/orm are pinned to a `1.0.0-rc` prerelease — docs for the stable release may not match.
- Migrations are drizzle-kit v1 format: one folder per migration (`migration.sql` + `snapshot.json`); there is no `meta/_journal.json`. Don't hand-edit generated folders.

## Logging

- Logging is [Logixlysia](https://logixlysia.vercel.app). The instance is created once in `src/lib/logging.ts` — `.use(logging)` it where needed, but never call `logixlysia()` again in a module (a second instance only partially runs its hooks).
- `requestId: true` always; the preset follows `NODE_ENV`: `dev` = pretty text + startup banner, `prod` (set by `bun run start`) = one JSON line per record + autoRedact.
- Use the `log` from handler context, not `console`.
- Errors you `catch` yourself never reach Elysia's `onError` — call `log.error(err, ...)` inside the catch block or the failure stays invisible (see products routes).
- SQL query logs: start the server with `DB_LOG=true` (drizzle's built-in logger, plain console output).
- No file logging — everything goes to stdout/stderr.
- `bun build` **inlines `process.env.NODE_ENV` at build time** — the bundle would freeze on the dev preset (it was unset during build). Read it as `Bun.env.NODE_ENV` instead, as `src/lib/logging.ts` does.
- If log lines seem to be missing, check for a second server: Bun allows two processes to listen on the same port (SO_REUSEPORT) and splits requests between them — `ss -tlnp | grep 3100`.

## Architecture

- Entry: `src/index.ts` — Elysia app, global prefix `/api`, mounts all modules, `onError` maps `NOT_FOUND`.
- Modules live in `src/modules/<name>/`, three files each:
  - `index.ts` — routes (its own Elysia instance with a prefix)
  - `service.ts` — logic, default-exported `abstract class` with static methods
  - `model.ts` — Elysia TypeBox (`t.*`) schemas registered via `.model()`; exports the plugin **and** a matching type via `UnwrapSchema`
- `mahasiswa` module is **in-memory** (hardcoded array in `service.ts`, resets on restart); `products` module is the only one using Postgres via `src/db`.
- DB client: `src/db/index.ts`; schemas in `src/db/schemas/` (keep `drizzle.config.ts` `schema` path in sync if moved/renamed).
- Response schemas `successResponse` / `notFoundResponse` / `errorResponse` live in `src/modules/general/model.ts` (used by `MahasiswaModel`; `ProductModel` defines its own).

## Conventions & gotchas

- Route options reference schemas **by string name** (`body: "mahasiswa"`, `response: { 200: "successResponse" }`). The module must `.use(Model)` before its routes are defined — copy the existing chain order.
- Imports use the `@/*` → `./src/*` path alias (works natively under Bun).
- `GET /api/products` returns **404 on an empty table**, not `200 []` — intentional as written.
- PUT and PATCH share one handler with a `t.Partial` body: both do partial merges.
- `src/db/schemas/products.ts` imports `timestamp`/`varchar` from `drizzle-orm/cockroach-core` inside a `pgTable`. It works today, but don't copy it — new columns go in `drizzle-orm/pg-core`.
- Error responses are shaped `{ message, data: null }`; success responses `{ message, data }` — keep new routes consistent.
