import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import assert from "node:assert";

assert(process.env.DATABASE_URL, "DATABASE_URL is required");

export default defineConfig({
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
});
