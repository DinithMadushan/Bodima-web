import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const adminActionsTable = pgTable("admin_actions", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id")
    .notNull()
    .references(() => usersTable.id),
  actionType: text("action_type").notNull(),
  targetTable: text("target_table"),
  targetId: integer("target_id"),
  notes: text("notes"),
  actedAt: timestamp("acted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const passwordResetsTable = pgTable("password_resets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: integer("used").notNull().default(0),
});
