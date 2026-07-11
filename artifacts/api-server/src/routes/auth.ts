import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable, studentsTable, boardingOwnersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
import { signToken } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const { email, password, first_name, last_name, phone, role } = req.body;

  if (!email || !password || !first_name || !last_name || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  if (!["student", "owner"].includes(role)) {
    res.status(400).json({ error: "Role must be student or owner" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({ email, passwordHash, firstName: first_name, lastName: last_name, phone, role })
    .returning();

  if (role === "student") {
    await db.insert(studentsTable).values({ userId: user.id });
  } else {
    await db.insert(boardingOwnersTable).values({ userId: user.id });
  }

  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phone,
      role: user.role,
      is_active: user.isActive,
      created_at: user.createdAt,
    },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password required" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user || !user.isActive) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phone,
      role: user.role,
      is_active: user.isActive,
      created_at: user.createdAt,
    },
  });
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ success: true, message: "Logged out" });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
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
    created_at: user.createdAt,
  });
});

router.patch("/auth/me/update", requireAuth, async (req, res): Promise<void> => {
  const { first_name, last_name, phone } = req.body;
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (first_name) updates.firstName = first_name;
  if (last_name) updates.lastName = last_name;
  if (phone !== undefined) updates.phone = phone;

  const [user] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.user!.userId))
    .returning();
  res.json({
    id: user.id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    phone: user.phone,
    role: user.role,
    is_active: user.isActive,
    created_at: user.createdAt,
  });
});

export default router;
