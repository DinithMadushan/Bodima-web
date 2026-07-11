import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import {
  db,
  listingsTable,
  usersTable,
  bookingsTable,
  reviewsTable,
  conversationsTable,
  messagesTable,
} from "@workspace/db";
import { requireRole, requireAuth } from "../middlewares/auth";
import { or } from "drizzle-orm";

const router: IRouter = Router();

// Public: platform stats
router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [listingCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(listingsTable)
    .where(eq(listingsTable.status, "approved"));

  const [studentCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(usersTable)
    .where(eq(usersTable.role, "student"));

  const [reviewStats] = await db
    .select({
      count: sql<number>`count(*)`,
      avg: sql<number>`avg(rating)`,
    })
    .from(reviewsTable);

  const avgRating = Number(reviewStats?.avg ?? 0);
  const satisfactionRate = avgRating > 0 ? Math.round((avgRating / 5) * 100) : 98;

  res.json({
    total_listings: Number(listingCount?.count ?? 0),
    total_students: Number(studentCount?.count ?? 0),
    satisfaction_rate: satisfactionRate,
    total_reviews: Number(reviewStats?.count ?? 0),
  });
});

// Owner: summary dashboard
router.get("/dashboard/owner-summary", requireRole("owner", "admin"), async (req, res): Promise<void> => {
  const userId = req.user!.userId;

  const [totalListings] = await db
    .select({ count: sql<number>`count(*)` })
    .from(listingsTable)
    .where(eq(listingsTable.ownerId, userId));

  const [activeListings] = await db
    .select({ count: sql<number>`count(*)` })
    .from(listingsTable)
    .where(eq(listingsTable.ownerId, userId));

  const [pendingBookings] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookingsTable)
    .where(eq(bookingsTable.ownerId, userId));

  const [confirmedBookings] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bookingsTable)
    .where(eq(bookingsTable.ownerId, userId));

  // Get listing IDs for owner
  const ownerListings = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(eq(listingsTable.ownerId, userId));
  const listingIds = ownerListings.map((l) => l.id);

  let totalReviews = 0;
  let avgRating = 0;
  if (listingIds.length > 0) {
    const [reviewStats] = await db
      .select({
        count: sql<number>`count(*)`,
        avg: sql<number>`avg(rating)`,
      })
      .from(reviewsTable)
      .where(sql`${reviewsTable.listingId} = ANY(${sql.raw(`ARRAY[${listingIds.join(",")}]::int[]`)})`);
    totalReviews = Number(reviewStats?.count ?? 0);
    avgRating = Number(reviewStats?.avg ?? 0);
  }

  // Unread messages
  const convs = await db
    .select({ id: conversationsTable.id })
    .from(conversationsTable)
    .where(eq(conversationsTable.ownerId, userId));
  const convIds = convs.map((c) => c.id);
  let unreadCount = 0;
  if (convIds.length > 0) {
    const [unread] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messagesTable)
      .where(
        sql`${messagesTable.conversationId} = ANY(${sql.raw(`ARRAY[${convIds.join(",")}]::int[]`)}) AND ${messagesTable.isRead} = false AND ${messagesTable.senderId} != ${userId}`
      );
    unreadCount = Number(unread?.count ?? 0);
  }

  res.json({
    total_listings: Number(totalListings?.count ?? 0),
    active_listings: Number(activeListings?.count ?? 0),
    pending_bookings: Number(pendingBookings?.count ?? 0),
    total_bookings: Number(totalListings?.count ?? 0),
    confirmed_bookings: Number(confirmedBookings?.count ?? 0),
    unread_messages: unreadCount,
    average_rating: Math.round(avgRating * 10) / 10,
    total_reviews: totalReviews,
  });
});

// Admin: summary dashboard
router.get("/dashboard/admin-summary", requireRole("admin"), async (req, res): Promise<void> => {
  const [totalUsers] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
  const [students] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "student"));
  const [owners] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "owner"));
  const [totalListings] = await db.select({ count: sql<number>`count(*)` }).from(listingsTable);
  const [approved] = await db.select({ count: sql<number>`count(*)` }).from(listingsTable).where(eq(listingsTable.status, "approved"));
  const [pending] = await db.select({ count: sql<number>`count(*)` }).from(listingsTable).where(eq(listingsTable.status, "pending"));
  const [totalBookings] = await db.select({ count: sql<number>`count(*)` }).from(bookingsTable);
  const [totalReviews] = await db.select({ count: sql<number>`count(*)` }).from(reviewsTable);

  res.json({
    total_users: Number(totalUsers?.count ?? 0),
    total_students: Number(students?.count ?? 0),
    total_owners: Number(owners?.count ?? 0),
    total_listings: Number(totalListings?.count ?? 0),
    approved_listings: Number(approved?.count ?? 0),
    pending_listings: Number(pending?.count ?? 0),
    total_bookings: Number(totalBookings?.count ?? 0),
    total_reviews: Number(totalReviews?.count ?? 0),
  });
});

export default router;
