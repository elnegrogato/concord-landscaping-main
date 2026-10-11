import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Log an audit event from any Convex function. */
export const log = mutation({
  args: {
    actorId: v.optional(v.union(v.id("users"), v.id("staff"), v.string())),
    actorType: v.union(v.literal("user"), v.literal("staff"), v.literal("system"), v.literal("webhook")),
    action: v.string(),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    changes: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("auditLog", {
      actorId: args.actorId,
      actorType: args.actorType,
      action: args.action,
      resourceType: args.resourceType,
      resourceId: args.resourceId,
      changes: args.changes,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      createdAt: Date.now(),
    });
    return id;
  },
});

/** Log a Stripe webhook event. */
export const logStripeWebhook = mutation({
  args: { eventType: v.string(), eventId: v.string(), createdAt: v.number(), ipAddress: v.optional(v.string()), userAgent: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditLog", {
      actorType: "webhook",
      action: `stripe.${args.eventType}`,
      resourceId: args.eventId,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      createdAt: args.createdAt,
    });
  },
});

/** Webhook audit log feed (admin view). */
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const q = ctx.db.query("auditLog").order("desc");
    const results = await q.collect();
    return args.limit ? results.slice(0, args.limit) : results;
  },
});
