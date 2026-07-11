import { Router, type IRouter } from "express";
import { eq, and, gte, lte, ilike, or, sql } from "drizzle-orm";
import { db, listingsTable, listingImagesTable, usersTable } from "@workspace/db";
import { requireAuth, requireRole, optionalAuth } from "../middlewares/auth";

const router: IRouter = Router();

function parseAmenities(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw.split(",").map((a) => a.trim()).filter(Boolean);
}

function serializeListing(
  listing: typeof listingsTable.$inferSelect,
  ownerName?: string | null,
  ownerSince?: string | null,
  images?: Array<{ id: number; url: string; caption: string | null; is_primary: boolean }>
) {
  return {
    id: listing.id,
    name: listing.name,
    area: listing.area,
    location: listing.location,
    price: listing.price,
    type: listing.type,
    gender: listing.gender,
    rating: listing.rating,
    review_count: listing.reviewCount,
    img: listing.img ?? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
    amenities: parseAmenities(listing.amenities),
    badge: listing.badge,
    status: listing.status,
    desc: listing.desc,
    deposit_months: listing.depositMonths,
    meals_included: listing.mealsIncluded,
    wifi_included: listing.wifiIncluded,
    available_from: listing.availableFrom,
    latitude: listing.latitude,
    longitude: listing.longitude,
    owner_id: listing.ownerId,
    owner_name: ownerName ?? null,
    owner_since: ownerSince ?? null,
    images: images ?? [],
    created_at: listing.createdAt,
  };
}

// Public: get featured listings
router.get("/listings/featured", async (_req, res): Promise<void> => {
  const listings = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.status, "approved"))
    .orderBy(sql`${listingsTable.rating} DESC NULLS LAST`)
    .limit(6);
  res.json(listings.map((l) => serializeListing(l)));
});

// Public: search listings
router.get("/listings/search", optionalAuth, async (req, res): Promise<void> => {
  const { q, location, type, gender, min_price, max_price, amenities, sort, min_rating } = req.query;

  let conditions = [eq(listingsTable.status, "approved")];

  if (q) {
    conditions.push(
      or(
        ilike(listingsTable.name, `%${q}%`),
        ilike(listingsTable.area, `%${q}%`),
        ilike(listingsTable.location, `%${q}%`)
      )!
    );
  }
  if (location) conditions.push(ilike(listingsTable.area, `%${location}%`));
  if (type && type !== "all") conditions.push(eq(listingsTable.type, String(type)));
  if (gender && gender !== "any") conditions.push(eq(listingsTable.gender, String(gender)));
  if (min_price) conditions.push(gte(listingsTable.price, Number(min_price)));
  if (max_price) conditions.push(lte(listingsTable.price, Number(max_price)));
  if (min_rating) conditions.push(gte(listingsTable.rating, Number(min_rating)));

  let query = db.select().from(listingsTable).where(and(...conditions));

  const listings = await query;

  let filtered = listings;
  if (amenities) {
    const requested = String(amenities).split(",").map((a) => a.trim().toLowerCase());
    filtered = listings.filter((l) => {
      const la = parseAmenities(l.amenities).map((a) => a.toLowerCase());
      return requested.every((r) => la.includes(r));
    });
  }

  if (sort === "price_asc") filtered.sort((a, b) => a.price - b.price);
  else if (sort === "price_desc") filtered.sort((a, b) => b.price - a.price);
  else if (sort === "rating") filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  else filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ listings: filtered.map((l) => serializeListing(l)), total: filtered.length });
});

// Public: get single listing detail
router.get("/listings/:id", optionalAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  // Non-approved listings are only visible to their owner and admins
  const isOwner = req.user?.userId === listing.ownerId;
  const isAdmin = req.user?.role === "admin";
  if (listing.status !== "approved" && !isOwner && !isAdmin) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, listing.ownerId));
  const images = await db
    .select()
    .from(listingImagesTable)
    .where(eq(listingImagesTable.listingId, id))
    .orderBy(listingImagesTable.isPrimary);

  res.json(
    serializeListing(
      listing,
      owner ? `${owner.firstName} ${owner.lastName}` : null,
      owner?.createdAt?.toISOString() ?? null,
      images.map((i) => ({
        id: i.id,
        url: i.imageUrl,
        caption: i.caption,
        is_primary: i.isPrimary,
      }))
    )
  );
});

// Owner: get own listings
router.get("/owner/listings", requireRole("owner", "admin"), async (req, res): Promise<void> => {
  const listings = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.ownerId, req.user!.userId))
    .orderBy(sql`${listingsTable.createdAt} DESC`);

  res.json(listings.map((l) => serializeListing(l)));
});

// Owner: create listing
router.post("/owner/listings", requireRole("owner", "admin"), async (req, res): Promise<void> => {
  const { name, area, location, price, type, gender, desc, amenities, deposit_months, meals_included, wifi_included, available_from, img, badge } = req.body;
  if (!name || !area || !location || !price) {
    res.status(400).json({ error: "name, area, location, price are required" });
    return;
  }

  const [listing] = await db
    .insert(listingsTable)
    .values({
      ownerId: req.user!.userId,
      name,
      area,
      location,
      price: Number(price),
      type: type ?? "room",
      gender: gender ?? "any",
      desc,
      amenities: Array.isArray(amenities) ? amenities.join(",") : amenities,
      depositMonths: deposit_months ?? 2,
      mealsIncluded: meals_included ?? false,
      wifiIncluded: wifi_included ?? false,
      availableFrom: available_from,
      img,
      badge,
      status: "pending",
    })
    .returning();

  res.status(201).json(serializeListing(listing));
});

// Owner: update listing
router.patch("/owner/listings/:id", requireRole("owner", "admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [existing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  if (existing.ownerId !== req.user!.userId && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { name, area, location, price, type, gender, desc, amenities, deposit_months, meals_included, wifi_included, available_from, img, badge } = req.body;
  const updates: Partial<typeof listingsTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (area !== undefined) updates.area = area;
  if (location !== undefined) updates.location = location;
  if (price !== undefined) updates.price = Number(price);
  if (type !== undefined) updates.type = type;
  if (gender !== undefined) updates.gender = gender;
  if (desc !== undefined) updates.desc = desc;
  if (amenities !== undefined) updates.amenities = Array.isArray(amenities) ? amenities.join(",") : amenities;
  if (deposit_months !== undefined) updates.depositMonths = deposit_months;
  if (meals_included !== undefined) updates.mealsIncluded = meals_included;
  if (wifi_included !== undefined) updates.wifiIncluded = wifi_included;
  if (available_from !== undefined) updates.availableFrom = available_from;
  if (img !== undefined) updates.img = img;
  if (badge !== undefined) updates.badge = badge;

  const [updated] = await db.update(listingsTable).set(updates).where(eq(listingsTable.id, id)).returning();
  res.json(serializeListing(updated));
});

// Owner: delete listing
router.delete("/owner/listings/:id", requireRole("owner", "admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const [existing] = await db.select().from(listingsTable).where(eq(listingsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }
  if (existing.ownerId !== req.user!.userId && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(listingsTable).where(eq(listingsTable.id, id));
  res.json({ success: true, message: "Listing deleted" });
});

export default router;
