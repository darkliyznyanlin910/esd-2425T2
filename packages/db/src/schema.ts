import { pgTable } from "drizzle-orm/pg-core";

export const User = pgTable("user", (t) => ({
  id: t.uuid().notNull().primaryKey().defaultRandom(),
  name: t.varchar({ length: 255 }),
  email: t.varchar({ length: 255 }).notNull(),
  emailVerified: t.timestamp({ mode: "date", withTimezone: true }),
  image: t.varchar({ length: 255 }),
}));
