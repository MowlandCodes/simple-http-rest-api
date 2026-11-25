import { timestamp, varchar } from "drizzle-orm/cockroach-core";
import { integer, pgTable } from "drizzle-orm/pg-core";

export const productTable = pgTable("products", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	nama: varchar({ length: 200 }).notNull(),
	stok: integer().default(0).notNull(),
	harga: integer().default(0).notNull(),
	created_at: timestamp().defaultNow().notNull(),
});
