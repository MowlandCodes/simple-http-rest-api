import { openapi } from "@elysia/openapi";

// Harus sama persis dengan nama yang dipakai di isAuth macro (src/modules/auth/plugin.ts)
// supaya requirement security-nya cocok.
export const BEARER_SCHEME = "bearerAuth";

// Spec versi 3.0.3: paling aman buat di-import tools (Bruno, Postman, dll).
// 3.1.2 adalah default plugin kalau nanti mau naikkan.
export const openapiPlugin = openapi({
  // Plugin ini di-mount di dalam instance prefix "/api",
  // jadi jadinya /api/openapi (UI) dan /api/openapi/json (spec).
  path: "/docs",
  specPath: "/docs/openapi.json",
  provider: "scalar",
  openapiVersion: "3.0.3",
  documentation: {
    info: {
      title: "HTTP REST API",
      version: "1.0.0",
      description:
        "Bun + Elysia + Drizzle (PostgreSQL) API. Auth pakai JWT Bearer (argon2id).",
    },
    servers: [
      {
        url: `http://localhost:${Bun.env.APP_PORT ?? 3100}`,
        description: "Local",
      },
    ],
    tags: [
      { name: "Auth", description: "Register, login, current user" },
      { name: "Mahasiswa", description: "Student CRUD (in-memory)" },
      { name: "Products", description: "Product CRUD (PostgreSQL)" },
    ],
    components: {
      securitySchemes: {
        [BEARER_SCHEME]: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // CONNECT bukan method yang valid di OpenAPI
  exclude: { methods: ["connect"] },
});
