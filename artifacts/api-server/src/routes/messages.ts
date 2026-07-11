import { Router, type IRouter } from "express";
import { eq, and, or, sql } from "drizzle-orm";
import { db, conversationsTable, messagesTable, listingsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

async function serializeConversation(
  conv: typeof conversationsTable.$inferSelect,
  userId: number
) {
  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, conv.listingId));
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, conv.studentId));
  const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, conv.ownerId));

  const lastMsg = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conv.id))
    .orderBy(sql`${messagesTable.createdAt} DESC`)
    .limit(1);

  const unreadCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(messagesTable)
    .where(
      and(
        eq(messagesTable.conversationId, conv.id),
        eq(messagesTable.isRead, false),
        sql`${messagesTable.senderId} != ${userId}`
      )
    );

  return {
    id: conv.id,
    listing_id: conv.listingId,
    listing_name: listing?.name ?? null,
    listing_img: listing?.img ?? null,
    student_id: conv.studentId,
    student_name: student ? `${student.firstName} ${student.lastName}` : null,
    owner_id: conv.ownerId,
    owner_name: owner ? `${owner.firstName} ${owner.lastName}` : null,
    last_message: lastMsg[0]?.body ?? null,
    last_message_at: lastMsg[0]?.createdAt?.toISOString() ?? null,
    unread_count: Number(unreadCount[0]?.count ?? 0),
    created_at: conv.createdAt,
  };
}

// Get all conversations for current user
router.get("/messages/conversations", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;
  const convs = await db
    .select()
    .from(conversationsTable)
    .where(
      or(eq(conversationsTable.studentId, userId), eq(conversationsTable.ownerId, userId))
    )
    .orderBy(sql`${conversationsTable.lastMessageAt} DESC NULLS LAST`);

  const result = await Promise.all(convs.map((c) => serializeConversation(c, userId)));
  res.json(result);
});

// Start or get a conversation
router.post("/messages/conversations", requireAuth, async (req, res): Promise<void> => {
  const { listing_id } = req.body;
  if (!listing_id) {
    res.status(400).json({ error: "listing_id is required" });
    return;
  }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, Number(listing_id)));
  if (!listing) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  const userId = req.user!.userId;
  const studentId = req.user!.role === "student" ? userId : listing.ownerId;
  const ownerId = listing.ownerId;

  // Check if conversation exists
  const [existing] = await db
    .select()
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.listingId, Number(listing_id)),
        eq(conversationsTable.studentId, studentId),
        eq(conversationsTable.ownerId, ownerId)
      )
    );

  if (existing) {
    res.json(await serializeConversation(existing, userId));
    return;
  }

  const [conv] = await db
    .insert(conversationsTable)
    .values({ listingId: Number(listing_id), studentId, ownerId })
    .returning();

  res.json(await serializeConversation(conv, userId));
});

// Get conversation with messages
router.get("/messages/conversations/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const userId = req.user!.userId;
  const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  if (conv.studentId !== userId && conv.ownerId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, id))
    .orderBy(messagesTable.createdAt);

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, conv.listingId));
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, conv.studentId));
  const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, conv.ownerId));

  const senderMap: Record<number, string> = {};
  senderMap[conv.studentId] = student ? `${student.firstName} ${student.lastName}` : "Student";
  senderMap[conv.ownerId] = owner ? `${owner.firstName} ${owner.lastName}` : "Owner";

  const messagesData = msgs.map((m) => ({
    id: m.id,
    conversation_id: m.conversationId,
    sender_id: m.senderId,
    sender_name: senderMap[m.senderId] ?? null,
    body: m.body,
    is_read: m.isRead,
    created_at: m.createdAt,
  }));

  res.json({
    id: conv.id,
    listing_id: conv.listingId,
    listing_name: listing?.name ?? null,
    listing_img: listing?.img ?? null,
    student_id: conv.studentId,
    student_name: student ? `${student.firstName} ${student.lastName}` : null,
    owner_id: conv.ownerId,
    owner_name: owner ? `${owner.firstName} ${owner.lastName}` : null,
    messages: messagesData,
    created_at: conv.createdAt,
  });
});

// Send message
router.post("/messages/conversations/:id/send", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const { body } = req.body;
  if (!body?.trim()) {
    res.status(400).json({ error: "Message body is required" });
    return;
  }

  const userId = req.user!.userId;
  const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  if (conv.studentId !== userId && conv.ownerId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [msg] = await db
    .insert(messagesTable)
    .values({ conversationId: id, senderId: userId, body: body.trim() })
    .returning();

  await db
    .update(conversationsTable)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversationsTable.id, id));

  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  res.status(201).json({
    id: msg.id,
    conversation_id: msg.conversationId,
    sender_id: msg.senderId,
    sender_name: sender ? `${sender.firstName} ${sender.lastName}` : null,
    body: msg.body,
    is_read: msg.isRead,
    created_at: msg.createdAt,
  });
});

// Mark conversation read
router.patch("/messages/conversations/:id/read", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const userId = req.user!.userId;

  // Verify caller is a participant in this conversation (prevents IDOR)
  const [conv] = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  if (conv.studentId !== userId && conv.ownerId !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db
    .update(messagesTable)
    .set({ isRead: true })
    .where(
      and(
        eq(messagesTable.conversationId, id),
        sql`${messagesTable.senderId} != ${userId}`
      )
    );

  res.json({ success: true });
});

// Get unread count
router.get("/messages/unread-count", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;
  const convs = await db
    .select({ id: conversationsTable.id })
    .from(conversationsTable)
    .where(
      or(eq(conversationsTable.studentId, userId), eq(conversationsTable.ownerId, userId))
    );

  const convIds = convs.map((c) => c.id);
  if (convIds.length === 0) {
    res.json({ count: 0 });
    return;
  }

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(messagesTable)
    .where(
      and(
        sql`${messagesTable.conversationId} = ANY(${sql.raw(`ARRAY[${convIds.join(",")}]`)})`,
        eq(messagesTable.isRead, false),
        sql`${messagesTable.senderId} != ${userId}`
      )
    );

  res.json({ count: Number(result[0]?.count ?? 0) });
});

export default router;
