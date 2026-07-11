import { Router, type IRouter } from "express";
import { eq, ilike, or, sql } from "drizzle-orm";
import { db, listingsTable, usersTable, adminActionsTable } from "@workspace/db";
import { requireRole } from "../middlewares/auth";

const router: IRouter = Router();

function serializeListing(listing: typeof listingsTable.$inferSelect) {
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
    amenities: listing.amenities?.split(",").map((a: string) => a.trim()).filter(Boolean) ?? [],
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
    owner_name: null,
    owner_since: null,
    images: [],
    created_at: listing.createdAt,
  };
}

// Admin: get all listings
router.get("/admin/listings", requireRole("admin"), async (req, res): Promise<void> => {
  const { status } = req.query;
  let listings;
  if (status && status !== "all") {
    listings = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.status, String(status)))
      .orderBy(sql`${listingsTable.createdAt} DESC`);
  } else {
    listings = await db
      .select()
      .from(listingsTable)
      .orderBy(sql`${listingsTable.createdAt} DESC`);
  }

  const result = await Promise.all(
    listings.map(async (l) => {
      const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, l.ownerId));
      const s = serializeListing(l);
      return { ...s, owner_name: owner ? `${owner.firstName} ${owner.lastName}` : null };
    })
  );
  res.json(result);
});

// Admin: approve/reject listing
router.patch("/admin/listings/:id/status", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { status, notes } = req.body;
  if (!["approved", "rejected", "inactive"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [listing] = await db
    .update(listingsTable)
    .set({ status })
    .where(eq(listingsTable.id, id))
    .returning();

  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  await db.insert(adminActionsTable).values({
    adminId: req.user!.userId,
    actionType: `listing_${status}`,
    targetTable: "listings",
    targetId: id,
    notes: notes ?? null,
  });

  res.json(serializeListing(listing));
});

// Admin: get all users
router.get("/admin/users", requireRole("admin"), async (req, res): Promise<void> => {
  const { role, q } = req.query;
  let users;
  if (q) {
    users = await db
      .select()
      .from(usersTable)
      .where(
        or(
          ilike(usersTable.email, `%${q}%`),
          ilike(usersTable.firstName, `%${q}%`),
          ilike(usersTable.lastName, `%${q}%`)
        )
      )
      .orderBy(sql`${usersTable.createdAt} DESC`);
  } else if (role && role !== "all") {
    users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, String(role)))
      .orderBy(sql`${usersTable.createdAt} DESC`);
  } else {
    users = await db.select().from(usersTable).orderBy(sql`${usersTable.createdAt} DESC`);
  }

  const result = await Promise.all(
    users.map(async (u) => {
      const listingCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(listingsTable)
        .where(eq(listingsTable.ownerId, u.id));
      return {
        id: u.id,
        email: u.email,
        first_name: u.firstName,
        last_name: u.lastName,
        phone: u.phone,
        role: u.role,
        is_active: u.isActive,
        listing_count: Number(listingCount[0]?.count ?? 0),
        created_at: u.createdAt,
      };
    })
  );
  res.json(result);
});

// Admin: ban/activate user
router.patch("/admin/users/:id/status", requireRole("admin"), async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const { is_active } = req.body;
  if (typeof is_active !== "boolean") {
    res.status(400).json({ error: "is_active must be boolean" });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({ isActive: is_active })
    .where(eq(usersTable.id, id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    phone: user.phone,
    role: user.role,
    is_active: user.isActive,
    listing_count: 0,
    created_at: user.createdAt,
  });
});

export default router;
