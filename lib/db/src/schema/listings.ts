import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  real,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  area: text("area").notNull(),
  location: text("location").notNull(),
  price: integer("price").notNull(),
  type: text("type").notNull().default("room"), // room | annex | house
  gender: text("gender").notNull().default("any"), // male | female | any
  desc: text("desc"),
  depositMonths: integer("deposit_months").notNull().default(2),
  mealsIncluded: boolean("meals_included").notNull().default(false),
  wifiIncluded: boolean("wifi_included").notNull().default(false),
  availableFrom: text("available_from"),
  amenities: text("amenities"), // comma-separated
  img: text("img"),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  badge: text("badge"), // Featured | New | Hot Deal
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const listingImagesTable = pgTable("listing_images", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id")
    .notNull()
    .references(() => listingsTable.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  isPrimary: boolean("is_primary").notNull().default(false),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({
  id: true,
  createdAt: true,
  rating: true,
  reviewCount: true,
});
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
export type ListingImage = typeof listingImagesTable.$inferSelect;
