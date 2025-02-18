import { sql } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

export const todosTable = pgTable("todos", {
  id: uuid()
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text().notNull(),
  created_at: text()
    .notNull()
    .default(sql`now()`),
});
