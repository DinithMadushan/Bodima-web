import { Router, type IRouter } from "express";
import { eq, and, or } from "drizzle-orm";
import { db, bookingsTable, listingsTable, usersTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

function serializeBooking(
  booking: typeof bookingsTable.$inferSelect,
  listingName?: string | null,
  listingArea?: string | null,
  listingPrice?: number | null,
  listingImg?: string | null,
  studentName?: string | null,
  studentEmail?: string | null
) {
  return {
    id: booking.id,
    listing_id: booking.listingId,
    listing_name: listingName ?? null,
    listing_area: listingArea ?? null,
    listing_price: listingPrice ?? null,
    listing_img: listingImg ?? null,
    student_id: booking.studentId,
    student_name: studentName ?? null,
    student_email: studentEmail ?? null,
    owner_id: booking.ownerId,
    move_in_date: booking.moveInDate,
    message: booking.message,
    status: booking.status,
    created_at: booking.createdAt,
  };
}

// Get bookings for current user (student sees theirs, owner sees their listing's)
router.get("/bookings", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;
  const role = req.user!.role;

  let bookings: (typeof bookingsTable.$inferSelect)[];
  if (role === "student") {
    bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.studentId, userId));
  } else {
    bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.ownerId, userId));
  }

  const result = await Promise.all(
    bookings.map(async (b) => {
      const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, b.listingId));
      const [student] = await db.select().from(usersTable).where(eq(usersTable.id, b.studentId));
      return serializeBooking(
        b,
        listing?.name,
        listing?.area,
        listing?.price,
        listing?.img,
        student ? `${student.firstName} ${student.lastName}` : null,
        student?.email
      );
    })
  );
  res.json(result);
});

// Create booking
router.post("/bookings", requireRole("student"), async (req, res): Promise<void> => {
  const { listing_id, move_in_date, message } = req.body;
  if (!listing_id) {
    res.status(400).json({ error: "listing_id is required" });
    return;
  }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, Number(listing_id)));
  if (!listing || listing.status !== "approved") {
    res.status(404).json({ error: "Listing not found or not available" });
    return;
  }

  const [booking] = await db
    .insert(bookingsTable)
    .values({
      listingId: Number(listing_id),
      studentId: req.user!.userId,
      ownerId: listing.ownerId,
      moveInDate: move_in_date ?? null,
      message: message ?? null,
      status: "pending",
    })
    .returning();

  res.status(201).json(
    serializeBooking(booking, listing.name, listing.area, listing.price, listing.img)
  );
});

// Get single booking
router.get("/bookings/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  if (booking.studentId !== req.user!.userId && booking.ownerId !== req.user!.userId && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, booking.listingId));
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, booking.studentId));
  res.json(serializeBooking(booking, listing?.name, listing?.area, listing?.price, listing?.img, student ? `${student.firstName} ${student.lastName}` : null, student?.email));
});

// Update booking status
router.patch("/bookings/:id/status", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const { status } = req.body;
  if (!["confirmed", "rejected", "cancelled"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }

  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const userId = req.user!.userId;
  const role = req.user!.role;

  // Students can only cancel their own bookings
  if (role === "student") {
    if (booking.studentId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (status !== "cancelled") {
      res.status(403).json({ error: "Students can only cancel bookings" });
      return;
    }
  }

  // Owners can confirm or reject bookings for their own listings
  if (role === "owner") {
    if (booking.ownerId !== userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (!["confirmed", "rejected"].includes(status)) {
      res.status(403).json({ error: "Owners can only confirm or reject bookings" });
      return;
    }
  }

  const [updated] = await db
    .update(bookingsTable)
    .set({ status })
    .where(eq(bookingsTable.id, id))
    .returning();

  res.json(serializeBooking(updated));
});

// Owner: get all bookings for their listings
router.get("/owner/bookings", requireRole("owner", "admin"), async (req, res): Promise<void> => {
  const bookings = await db
    .select()
    .from(bookingsTable)
    .where(eq(bookingsTable.ownerId, req.user!.userId));

  const result = await Promise.all(
    bookings.map(async (b) => {
      const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, b.listingId));
      const [student] = await db.select().from(usersTable).where(eq(usersTable.id, b.studentId));
      return serializeBooking(
        b,
        listing?.name,
        listing?.area,
        listing?.price,
        listing?.img,
        student ? `${student.firstName} ${student.lastName}` : null,
        student?.email
      );
    })
  );
  res.json(result);
});

export default router;
