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

`/api/products`, `/api/auth`, and all drizzle commands need Postgres running:

1. `docker compose up -d db` — postgres:19 on `:5432`, credentials interpolated from `.env`
2. `bun run migrate:dev` — `drizzle-kit generate`: writes SQL into `drizzle/` only, **does not touch the DB**
3. `bun run migrate:apply` — `drizzle-kit migrate`: applies generated SQL
4. `bun run drizzle:studio`

- `.env` must define `DATABASE_URL`, `APP_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and `JWT_SECRET` (see Authentication). `drizzle.config.ts` and `src/db/index.ts` throw at import time if `DATABASE_URL` is missing — the server won't boot without it, even for DB-less routes.
- drizzle-kit/orm are pinned to a `1.0.0-rc` prerelease — docs for the stable release may not match.
- Migrations are drizzle-kit v1 format: one folder per migration (`migration.sql` + `snapshot.json`); there is no `meta/_journal.json`. Don't hand-edit generated folders.

## Logging

- Logging is [Logixlysia](https://logixlysia.vercel.app). The instance is created once in `src/lib/logging.ts` — `.use(logging)` it where needed, but never call `logixlysia()` again in a module (a second instance only partially runs its hooks).
- `requestId: true` always; the preset follows `NODE_ENV`: `dev` = pretty text + startup banner, `prod` (set by `bun run start`) = one JSON line per record + autoRedact.
- Use the `log` from handler context, not `console`.
- Errors you `catch` yourself never reach Elysia's `onError` — call `log.error(err, ...)` inside the catch block or the failure stays invisible (see products routes).
- SQL query logs: start the server with `DB_LOG=true` (drizzle's built-in logger, plain console output). Caveat: it prints SQL **with parameters**, so a user insert logs the argon2 hash — never the plaintext password, but still don't enable it in prod.
- No file logging — everything goes to stdout/stderr.
- `bun build` **inlines `process.env.NODE_ENV` at build time** — the bundle would freeze on the dev preset (it was unset during build). Read it as `Bun.env.NODE_ENV` instead, as `src/lib/logging.ts` does.
- If log lines seem to be missing, check for a second server: Bun allows two processes to listen on the same port (SO_REUSEPORT) and splits requests between them — `ss -tlnp | grep 3100`.

## Authentication

JWT auth in `src/modules/auth/` — `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`. Clients send `Authorization: Bearer <token>`.

- `JWT_SECRET` in `.env` is **required**: `src/modules/auth/index.ts` throws at import if it's missing, same as `DATABASE_URL`. Generate with `openssl rand -hex 32`. `JWT_EXPIRES_IN` (default `7d`) is passed as `exp` to `@elysiajs/jwt`, which applies it as the default expiry on `sign`.
- Passwords use `Bun.password.hash(password, { algorithm: "argon2id" })` and `Bun.password.verify` — Bun built-in, no bcrypt and no extra dependency. Stored hashes start with `$argon2id$`.
- `users.password_hash` is `NOT NULL`; `users.age` is **nullable** (migration `add_password_hash_and_optional_age`). Register accepts `age` as optional.
- `AuthService.findById` / `findByEmail` select columns explicitly. `passwordHash` is only ever handed to `Bun.password.verify` and must never reach a response body.
- `jwt.verify()` catches everything and returns `false` — it never throws, so a bad/expired token is a `401`, not a `500`.
- `/auth/profile` re-reads the user from Postgres instead of trusting token claims, so a deleted user can't keep using an old token.
- Login returns one generic `Invalid email or password` for both unknown email and wrong password. Don't add distinct messages — that's user enumeration.
- Elysia body-validation failures return **422**, not 400 (app-wide default, not auth-specific).

### Protecting a route

`src/modules/auth/plugin.ts` exports `authGuard`, an Elysia plugin that registers the `isAuth` macro (it also carries the `jwt` decorator and the logging instance).

```ts
import { authGuard } from "@/modules/auth/plugin";
import { AuthModel } from "@/modules/auth/model";

new Elysia({ prefix: "/orders" })
  .use(authGuard) // required before any `isAuth: true` route
  .use(AuthModel) // only if you reference "authError" / "authSuccess"
  .get("/", ({ user }) => ({ message: "ok", data: user }), {
    isAuth: true,
    response: { 200: "successResponse", 401: "authError" },
  });
```

- Without `isAuth: true` the route stays **public** — the guard is opt-in per route.
- `isAuth` verifies the Bearer token, loads the user from Postgres, and puts it on the context as `user` (`{ id, name, email, age }`), so handlers just read `({ user })`.
- Guard failures use `return status(401 | 500, ...)` imported from `elysia`. Never `throw` — Elysia turns a thrown error into a 500 and loses the status.
- 401 messages: `Missing or invalid Authorization header` (absent or non-Bearer header) and `Invalid or expired token` (bad, expired, or deleted user).
- A DB failure inside the guard is caught, logged with `route: auth guard`, and returns 500.
- `authGuard` is named (`"auth-guard"`), so any number of modules may `.use()` it — Elysia dedupes and registers the macro once.
- `GET /api/auth/profile` is the reference implementation.

## Architecture

- Entry: `src/index.ts` — Elysia app, global prefix `/api`, mounts all modules, `onError` maps `NOT_FOUND`.
- Modules live in `src/modules/<name>/`, three files each:
  - `index.ts` — routes (its own Elysia instance with a prefix)
  - `service.ts` — logic, default-exported `abstract class` with static methods
  - `model.ts` — Elysia TypeBox (`t.*`) schemas registered via `.model()`; exports the plugin **and** a matching type via `UnwrapSchema`
- `mahasiswa` module is **in-memory** (hardcoded array in `service.ts`, resets on restart); `products` and `auth` are the ones using Postgres via `src/db`.
- DB client: `src/db/index.ts`; schemas in `src/db/schemas/` (keep `drizzle.config.ts` `schema` path in sync if moved/renamed).
- Response schemas `successResponse` / `notFoundResponse` / `errorResponse` live in `src/modules/general/model.ts` (used by `MahasiswaModel`; `ProductModel` and `AuthModel` define their own).

## Conventions & gotchas

- Route options reference schemas **by string name** (`body: "mahasiswa"`, `response: { 200: "successResponse" }`). The module must `.use(Model)` before its routes are defined — copy the existing chain order.
- Imports use the `@/*` → `./src/*` path alias (works natively under Bun).
- `GET /api/products` returns **404 on an empty table**, not `200 []` — intentional as written.
- PUT and PATCH share one handler with a `t.Partial` body: both do partial merges.
- `src/db/schemas/products.ts` imports `timestamp`/`varchar` from `drizzle-orm/cockroach-core` inside a `pgTable`. It works today, but don't copy it — new columns go in `drizzle-orm/pg-core`.
- Error responses are shaped `{ message, data: null }`; success responses `{ message, data }` — keep new routes consistent.
