import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Webhook: payment intent succeeded → mark invoice paid. */
export const webhookPaymentIntentSucceeded = mutation({
  args: {
    paymentIntentId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("succeeded"), v.literal("failed")),
    stripeChargeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_intent", (q) => q.eq("stripePaymentIntentId", args.paymentIntentId))
      .first();
    if (payment) {
      await ctx.db.patch(payment._id, { status: args.status, stripeChargeId: args.stripeChargeId });
      return payment._id;
    }
    const id = await ctx.db.insert("payments", {
      invoiceId: undefined,
      amount: args.amount,
      currency: args.currency,
      status: args.status,
      method: "card",
      stripePaymentIntentId: args.paymentIntentId,
      stripeChargeId: args.stripeChargeId,
      processedAt: now,
      createdAt: now,
    });
    return id;
  },
});

/** Webhook: checkout session completed → update invoice. */
export const webhookCheckoutCompleted = mutation({
  args: { invoiceId: v.id("invoices"), stripeCheckoutSessionId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) throw new Error("Invoice not found");
    await ctx.db.patch(args.invoiceId, {
      status: "paid",
      stripePaymentIntentId: args.stripeCheckoutSessionId,
      paidAt: now,
      balanceDue: 0,
      updatedAt: now,
    });
    // Mark the associated estimate approved if present.
    if (invoice.estimateId) {
      await ctx.db.patch(invoice.estimateId, { stage: "approved", updatedAt: now });
    }
    return true;
  },
});

/** Webhook: payment intent failed. */
export const webhookPaymentIntentFailed = mutation({
  args: { paymentIntentId: v.string(), status: v.union(v.literal("succeeded"), v.literal("failed")), failureCode: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .withIndex("by_intent", (q) => q.eq("stripePaymentIntentId", args.paymentIntentId))
      .first();
    if (payment) {
      await ctx.db.patch(payment._id, { status: args.status });
      return payment._id;
    }
    return null;
  },
});

/** Get a customer by email (used by public invoice pages). */
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .collect();
    return customers;
  },
});
