import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Create a draft estimate for a lead/customer. */
export const create = mutation({
  args: {
    leadId: v.id("leads"),
    title: v.optional(v.string()),
    lineItems: v.array(v.object({
      description: v.string(),
      quantity: v.number(),
      unit: v.string(),
      unitPrice: v.number(),
      total: v.number(),
    })),
    notes: v.optional(v.string()),
    terms: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    const subtotal = args.lineItems.reduce((sum: number, item) => sum + item.quantity * item.unitPrice, 0);
    const now = Date.now();
    const id = await ctx.db.insert("estimates", {
      leadId: args.leadId,
      customerEmail: lead.email || "",
      title: args.title || `${lead.firstName} ${lead.lastName}'s estimate`,
      stage: "draft",
      service: lead.service || "General",
      market: lead.market,
      tier: "good",
      validUntil: now + 30 * 24 * 60 * 60 * 1000,
      expiresAt: now + 30 * 24 * 60 * 60 * 1000,
      tiers: [],
      lineItems: args.lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit || "hr",
        unitPrice: item.unitPrice,
        total: item.total ?? item.quantity * item.unitPrice,
      })),
      subtotal,
      taxPercent: 0,
      taxAmount: 0,
      totalEstimate: subtotal,
      totalAmount: subtotal,
      estimateNumber: `EST-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: args.notes,
      terms: args.terms,
      selectedTierId: undefined,
      approvalRequired: true,
      approvedBy: undefined,
      approvedAt: undefined,
      clientNudgedAt: undefined,
      sentAt: undefined,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

/** Send an estimate to the client for approval. */
export const sendForApproval = mutation({
  args: { estimateId: v.id("estimates") },
  handler: async (ctx, args) => {
    const estimate = await ctx.db.get(args.estimateId);
    if (!estimate) throw new Error("Estimate not found");
    if (!estimate.customerEmail) throw new Error("Estimate has no customer email");
    await ctx.db.patch(args.estimateId, {
      stage: "sent",
      sentAt: Date.now(),
      updatedAt: Date.now(),
    });
    return true;
  },
});

/** Record a client approval (via public page or email link). */
export const approve = mutation({
  args: { estimateId: v.id("estimates") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const estimate = await ctx.db.get(args.estimateId);
    if (!estimate) throw new Error("Estimate not found");
    await ctx.db.patch(args.estimateId, {
      stage: "approved",
      approvedAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("events", {
      leadId: args.estimateId as any,
      type: "estimate_approved",
      summary: `Estimate ${estimate.title} approved by client`,
      body: "",
      relatedId: args.estimateId,
      createdAt: now,
    });
    return true;
  },
});

/** Send a reminder/nudge about a pending estimate. */
export const sendNudge = mutation({
  args: { estimateId: v.id("estimates"), reason: v.string() },
  handler: async (ctx, args) => {
    const estimate = await ctx.db.get(args.estimateId);
    if (!estimate) throw new Error("Estimate not found");
    await ctx.db.patch(args.estimateId, {
      clientNudgedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return true;
  },
});

/** Update estimate line items / totals in place. */
export const update = mutation({
  args: v.object({ estimateId: v.id("estimates") }),
  handler: async (ctx, args) => {
    const patch = (args as any).patch || {};
    const estimate = await ctx.db.get(args.estimateId);
    if (!estimate) throw new Error("Estimate not found");
    const now = Date.now();
    const combined = { ...patch, updatedAt: now };
    if (combined.lineItems) {
      const subtotal = combined.lineItems.reduce((sum: number, item: any) => sum + (item.quantity || 1) * (item.unitPrice || 0), 0);
      combined.subtotal = subtotal;
      combined.totalEstimate = subtotal;
      combined.totalAmount = subtotal;
    }
    await ctx.db.patch(args.estimateId, combined);
    return await ctx.db.get(args.estimateId);
  },
});

/** Public page: resolve estimate by tokenized email + number. */
export const getByPublicId = query({
  args: { email: v.string(), estimateNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("estimates")
      .withIndex("by_customer_email", (q) => q.eq("customerEmail", args.email.toLowerCase()))
      .filter((q) => q.eq(q.field("estimateNumber"), args.estimateNumber))
      .first();
  },
});

/** List estimates by status for the dashboard. */
export const listByStatus = query({
  args: { status: v.union(v.literal("draft"), v.literal("sent"), v.literal("viewed"), v.literal("approved"), v.literal("rejected")), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("estimates").collect();
    const filtered = items.filter((i) => i.stage === args.status);
    return args.limit ? filtered.slice(0, args.limit) : filtered;
  },
});

/** Get a single estimate by ID. */
export const get = query({
  args: { estimateId: v.id("estimates") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.estimateId);
  },
});

/** Public page: client can approve an estimate via token. */
export const approvePublic = mutation({
  args: { email: v.string(), estimateNumber: v.string() },
  handler: async (ctx, args) => {
    const estimate = await ctx.db
      .query("estimates")
      .withIndex("by_customer_email", (q) => q.eq("customerEmail", args.email.toLowerCase()))
      .filter((q) => q.eq(q.field("estimateNumber"), args.estimateNumber))
      .first();
    if (!estimate) throw new Error("Estimate not found");
    if (estimate.stage !== "sent") throw new Error("Estimate is not available for approval");
    const now = Date.now();
    await ctx.db.patch(estimate._id, {
      stage: "approved",
      approvedAt: now,
      updatedAt: now,
    });
    return true;
  },
});
