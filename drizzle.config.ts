import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/base-schema.ts",
  out: "./migrations",
  dialect: "sqlite",
});