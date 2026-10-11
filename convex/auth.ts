import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

const SESSION_EXPIRY_MS = Number(process.env.AUTH_SESSION_EXPIRY_HOURS || 24) * 60 * 60 * 1000;
const MAX_CONCURRENT_SESSIONS = Number(process.env.MAX_CONCURRENT_SESSIONS || 3);

const USER_ROLE_OPTIONS = ["owner", "admin", "dispatcher", "estimator", "technician", "crew_lead", "viewer"] as const;
export type UserRole = (typeof USER_ROLE_OPTIONS)[number];

function authPepper() {
  return process.env.AUTH_SESSION_SECRET || "concord_landscaping_pepper";
}

type Ctx = { db: any };

async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.randomUUID();
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password + authPepper()),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return {
    hash: Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join(""),
    salt,
  };
}

async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password + authPepper()),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode(salt), iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  const candidate = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  if (candidate.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i += 1) {
    diff |= candidate.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return diff === 0;
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(token + authPepper()),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: encoder.encode("token-salt-concord"), iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getUserByEmail(ctx: Ctx, email: string) {
  return await ctx.db.query("users").withIndex("by_email", (q: any) => q.eq("email", email.toLowerCase())).first();
}

async function getSessionByToken(ctx: Ctx, token: string) {
  const tokenHash = await hashToken(token);
  const session = await ctx.db.query("sessions").withIndex("by_token_hash", (q: any) => q.eq("tokenHash", tokenHash)).first();
  if (!session || session.expiresAt < Date.now()) return null;
  return session;
}

async function getSessionUser(ctx: Ctx, token: string) {
  const session = await getSessionByToken(ctx, token);
  if (!session) return null;
  const user = await ctx.db.get(session.userId);
  if (!user || user.status !== "active") return null;
  return { session, user };
}

function safeUser(user: any) {
  const { passwordHash, passwordSalt, ...rest } = user;
  return rest;
}

async function createSession(ctx: Ctx, args: { userId: any; token: string; ipAddress?: string; userAgent?: string }) {
  const now = Date.now();
  const tokenHash = await hashToken(args.token);
  const existingSessions = await ctx.db.query("sessions").withIndex("by_user", (q: any) => q.eq("userId", args.userId)).collect();
  const activeSessions = existingSessions.filter((session: any) => session.expiresAt > now);
  if (activeSessions.length >= MAX_CONCURRENT_SESSIONS) {
    activeSessions.sort((a: any, b: any) => a.createdAt - b.createdAt);
    const oldest = activeSessions[0];
    if (oldest) await ctx.db.delete(oldest._id);
  }
  const sessionId = await ctx.db.insert("sessions", {
    userId: args.userId,
    tokenHash,
    expiresAt: now + SESSION_EXPIRY_MS,
    ipAddress: args.ipAddress,
    userAgent: args.userAgent,
    createdAt: now,
  });
  return { sessionId, expiresAt: now + SESSION_EXPIRY_MS };
}

export const register = mutation({
  args: { name: v.string(), email: v.string(), phone: v.optional(v.string()), password: v.string(), role: v.optional(v.union(...USER_ROLE_OPTIONS.map((r) => v.literal(r)))) },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const existing = await getUserByEmail(ctx, email);
    if (existing) throw new Error("Email already registered");
    const { hash, salt } = await hashPassword(args.password);
    const userId = await ctx.db.insert("users", {
      email,
      name: args.name.trim(),
      role: (args.role ?? "viewer") as UserRole,
      phone: args.phone,
      status: "active",
      passwordHash: hash,
      passwordSalt: salt,
      googleCalendarConnected: false,
      calendarAutoSync: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await ctx.scheduler.runAfter(0, api.emails.sendLeadWelcome, { email: args.email });
    return { success: true, userId };
  },
});

export const signup = register;

export const login = mutation({
  args: { email: v.string(), password: v.string(), ipAddress: v.optional(v.string()), userAgent: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const user = await getUserByEmail(ctx, email);
    if (!user) throw new Error("Invalid email or password");
    if (user.status !== "active") throw new Error("Account is not active");
    const isValid = await verifyPassword(args.password, user.passwordHash, user.passwordSalt);
    if (!isValid) throw new Error("Invalid email or password");
    const token = crypto.randomUUID();
    const { expiresAt } = await createSession(ctx, { userId: user._id, token, ipAddress: args.ipAddress, userAgent: args.userAgent });
    return { success: true, token, expiresAt, user: safeUser(user) };
  },
});

/** Revoke the authenticated session. */
export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await getSessionByToken(ctx, args.token);
    if (session) await ctx.db.delete(session._id);
    return { success: true };
  },
});

export const signout = logout;

export const getAuthenticatedUser = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const result = await getSessionUser(ctx, args.token);
    if (!result) return null;
    return {
      session: {
        id: result.session._id,
        expiresAt: result.session.expiresAt,
        ipAddress: result.session.ipAddress,
        userAgent: result.session.userAgent,
      },
      user: safeUser(result.user),
    };
  },
});

export const changePassword = mutation({
  args: { token: v.string(), currentPassword: v.string(), newPassword: v.string() },
  handler: async (ctx, args) => {
    const result = await getSessionUser(ctx, args.token);
    if (!result) throw new Error("Not authenticated");
    const isValid = await verifyPassword(args.currentPassword, result.user.passwordHash, result.user.passwordSalt);
    if (!isValid) throw new Error("Current password is incorrect");
    const { hash, salt } = await hashPassword(args.newPassword);
    await ctx.db.patch(result.user._id, {
      passwordHash: hash,
      passwordSalt: salt,
      passwordChangedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true, message: "Password changed successfully. Please login again." };
  },
});

export const forgotPassword = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const user = await getUserByEmail(ctx, email);
    if (user) {
      await ctx.scheduler.runAfter(0, api.emails.sendPasswordReset, { userId: user._id, email: user.email });
    }
    return { sent: true };
  },
});

export const resetPassword = mutation({
  args: { token: v.string(), newPassword: v.string() },
  handler: async (ctx, args) => {
    const result = await getSessionUser(ctx, args.token);
    if (!result) throw new Error("Invalid reset token");
    const { hash, salt } = await hashPassword(args.newPassword);
    await ctx.db.patch(result.user._id, {
      passwordHash: hash,
      passwordSalt: salt,
      passwordChangedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});
