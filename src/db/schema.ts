import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const productTable = pgTable("products", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nama: varchar({ length: 200 }).notNull(),
  stok: integer().default(0).notNull(),
  harga: integer().default(0).notNull(),
  created_at: timestamp().defaultNow().notNull(),
});
