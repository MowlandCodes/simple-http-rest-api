import logixlysia from "logixlysia";

// Read via Bun.env: `bun build` inlines process.env.NODE_ENV at build time,
// which would freeze the preset to "dev" in dist/.
const isProd = Bun.env.NODE_ENV === "production";

export const logging = logixlysia({
  preset: isProd ? "prod" : "dev",
  config: {
    service: "http-rest-api",
    requestId: true,
  },
});
