import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody, GetMeResponse, LoginResponse } from "@workspace/api-zod";
import { createHash } from "crypto";
import jwt from "jsonwebtoken";

const router: IRouter = Router();

const JWT_SECRET = process.env["SESSION_SECRET"] ?? "jarvis-secret-key";

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "jarvis_salt").digest("hex");
}

function signToken(userId: number, username: string): string {
  return jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: "7d" });
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (existing.length > 0) {
    res.status(400).json({ error: "Username already taken" });
    return;
  }

  const [user] = await db
    .insert(usersTable)
    .values({ username, passwordHash: hashPassword(password) })
    .returning();

  const token = signToken(user.id, user.username);

  res.status(201).json(
    LoginResponse.parse({
      token,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt.toISOString(),
      },
    }),
  );
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken(user.id, user.username);

  res.json(
    LoginResponse.parse({
      token,
      user: {
        id: user.id,
        username: user.username,
        createdAt: user.createdAt.toISOString(),
      },
    }),
  );
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  let payload: { id: number; username: string };

  try {
    payload = jwt.verify(token, JWT_SECRET) as { id: number; username: string };
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, payload.id))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json(
    GetMeResponse.parse({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
    }),
  );
});

export default router;
