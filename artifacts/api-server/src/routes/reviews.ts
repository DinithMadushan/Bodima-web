import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, reviewsTable, listingsTable, usersTable } from "@workspace/db";
import { requireRole } from "../middlewares/auth";

const router: IRouter = Router();

async function serializeReview(review: typeof reviewsTable.$inferSelect) {
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, review.studentId));
  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, review.listingId));
  return {
    id: review.id,
    listing_id: review.listingId,
    listing_name: listing?.name ?? null,
    student_id: review.studentId,
    student_name: student ? `${student.firstName} ${student.lastName}` : null,
    student_avatar: null,
    rating: review.rating,
    comment: review.comment,
    created_at: review.createdAt,
  };
}

// Get reviews for a listing
router.get("/reviews", async (req, res): Promise<void> => {
  const listingId = Number(req.query.listing_id);
  if (!listingId || isNaN(listingId)) {
    res.status(400).json({ error: "listing_id is required" });
    return;
  }

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.listingId, listingId))
    .orderBy(sql`${reviewsTable.createdAt} DESC`);

  const result = await Promise.all(reviews.map(serializeReview));
  res.json(result);
});

// Get all reviews (for reviews page)
router.get("/reviews/all", async (req, res): Promise<void> => {
  const limit = Math.min(Number(req.query.limit ?? 20), 50);
  const reviews = await db
    .select()
    .from(reviewsTable)
    .orderBy(sql`${reviewsTable.createdAt} DESC`)
    .limit(limit);

  const result = await Promise.all(reviews.map(serializeReview));
  res.json(result);
});

// Create review
router.post("/reviews", requireRole("student"), async (req, res): Promise<void> => {
  const { listing_id, rating, comment } = req.body;
  if (!listing_id || !rating) {
    res.status(400).json({ error: "listing_id and rating are required" });
    return;
  }
  if (rating < 1 || rating > 5) {
    res.status(400).json({ error: "Rating must be 1-5" });
    return;
  }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, Number(listing_id)));
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const [existing] = await db
    .select()
    .from(reviewsTable)
    .where(
      eq(reviewsTable.listingId, Number(listing_id))
    );

  const [review] = await db
    .insert(reviewsTable)
    .values({
      listingId: Number(listing_id),
      studentId: req.user!.userId,
      rating: Number(rating),
      comment: comment ?? null,
    })
    .onConflictDoNothing()
    .returning();

  if (!review) {
    res.status(400).json({ error: "You have already reviewed this listing" });
    return;
  }

  // Recalculate listing rating
  const allReviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.listingId, Number(listing_id)));
  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await db
    .update(listingsTable)
    .set({ rating: Math.round(avg * 10) / 10, reviewCount: allReviews.length })
    .where(eq(listingsTable.id, Number(listing_id)));

  res.status(201).json(await serializeReview(review));
});

export default router;
