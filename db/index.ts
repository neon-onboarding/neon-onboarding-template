import { drizzle } from "drizzle-orm/neon-http";
import assert from "node:assert";

assert(process.env.DATABASE_URL, "DATABASE_URL is required");

const db = drizzle(process.env.DATABASE_URL);

export default db;
