import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Create a compliance document record (insurance, license, certification). */
export const createDoc = mutation({
  args: {
    customerOrLeadId: v.optional(v.id("customers")),
    leadId: v.optional(v.id("leads")),
    docType: v.union(v.literal("insurance"), v.literal("license"), v.literal("certification"), v.literal("permit"), v.literal("bond")),
    title: v.string(),
    documentUrl: v.string(),
    issuer: v.optional(v.string()),
    issueDate: v.optional(v.number()),
    expirationDate: v.optional(v.number()),
    amount: v.optional(v.number()),
    coverageDetails: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("complianceDocs", {
      customerOrLeadId: args.customerOrLeadId,
      leadId: args.leadId,
      docType: args.docType,
      holder: args.issuer || "",
      provider: args.issuer || "manual",
      certificateNumber: "",
      issueDate: args.issueDate ?? now,
      expirationDate: args.expirationDate,
      documentUrl: args.documentUrl,
      storageId: undefined,
      status: args.expirationDate && args.expirationDate < now ? "expired" : "valid",
      autoRenew: false,
      alertThresholdDays: 7,
      notes: args.coverageDetails,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

/** Update a compliance document (flexible partial patch). */
export const updateDoc = mutation({
  args: v.object({ docId: v.id("complianceDocs"), patch: v.optional(v.any()) }),
  handler: async (ctx, args) => {
    const patch = args.patch || {};
    const doc = await ctx.db.get(args.docId);
    if (!doc) throw new Error("Compliance doc not found");
    const now = Date.now();
    const combined = { ...patch, updatedAt: now };
    await ctx.db.patch(args.docId, combined);
    return await ctx.db.get(args.docId);
  },
});

/** Nudge an expiring compliance doc — create event + alert. */
export const nudgeExpiringDoc = mutation({
  args: { docId: v.id("complianceDocs") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.docId);
    if (!doc) return false;
    await ctx.db.patch(args.docId, {
      status: "expiring_soon",
      updatedAt: Date.now(),
    });
    const leadId = args.docId as any;
    await ctx.db.insert("events", {
      leadId,
      type: "compliance_expiring",
      summary: `Compliance doc ${doc.docType} (${doc.holder}) expires soon`,
      body: doc.notes || "",
      relatedId: args.docId,
      createdAt: Date.now(),
    });
    return true;
  },
});

/** List compliance docs by status. */
export const listByStatus = query({
  args: { status: v.union(v.literal("valid"), v.literal("expiring_soon"), v.literal("expired"), v.literal("missing")), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const docs = await ctx.db.query("complianceDocs").collect();
    const now = Date.now();
    const filtered = docs.filter((d) => {
      if (args.status === "valid") return !d.expirationDate || d.expirationDate > now;
      if (args.status === "expiring_soon") return d.expirationDate && d.expirationDate <= now + 7 * 24 * 60 * 60 * 1000 && d.expirationDate > now;
      if (args.status === "expired") return d.expirationDate && d.expirationDate < now;
      if (args.status === "missing") return false;
      return true;
    });
    return args.limit ? filtered.slice(0, args.limit) : filtered;
  },
});

/** Enforce compliance for a work order (block completion if missing). */
export const enforceWorkOrderCompliance = mutation({
  args: { workOrderId: v.id("workOrders") },
  handler: async (ctx, args) => {
    const wo = await ctx.db.get(args.workOrderId);
    if (!wo) throw new Error("Work order not found");
    const now = Date.now();
    const missing = (await ctx.db.query("complianceDocs").collect()).filter((d) => d.expirationDate && d.expirationDate < now);
    if (missing.length > 0) {
      return { blocked: true, missingDocs: missing.map((d) => `${d.docType} - ${d.holder}`) };
    }
    return { blocked: false };
  },
});

export const sendComplianceExpiryAlert = mutation({
  args: { docId: v.id("complianceDocs") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.docId);
    if (!doc) return;
    const leadId = args.docId as any;
    await ctx.db.insert("events", {
      leadId,
      type: "compliance_expiring",
      summary: `Compliance doc ${doc.docType} (${doc.holder}) requires attention`,
      body: doc.notes || "",
      relatedId: args.docId,
      createdAt: Date.now(),
    });
  },
});
