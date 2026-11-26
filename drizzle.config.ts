import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!Bun.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schemas",
  dialect: "postgresql",
  dbCredentials: {
    url: Bun.env.DATABASE_URL,
  },
});
