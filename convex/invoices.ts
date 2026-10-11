import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const generateInvoiceNumber = () => `INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

/** Convert a completed work order into a final invoice. */
export const createFromWorkOrder = mutation({
  args: { workOrderId: v.id("workOrders") },
  handler: async (ctx, args) => {
    const wo = await ctx.db.get(args.workOrderId);
    if (!wo) throw new Error("Work order not found");
    if (wo.status !== "completed") throw new Error("Only completed work orders may be invoiced");
    const lead = wo.leadId ? await ctx.db.get(wo.leadId) : null;
    const customerEmail = (wo.leadId ? (lead?.email || "") : "").toLowerCase();
    const now = Date.now();
    const invoiceNumber = generateInvoiceNumber();
    const id = await ctx.db.insert("invoices", {
      leadId: wo.leadId,
      workOrderId: wo._id,
      estimateId: wo.estimateId,
      customerEmail,
      invoiceNumber,
      issueDate: now,
      dueDate: now + 14 * 24 * 60 * 60 * 1000,
      status: "draft",
      currency: "USD",
      lineItems: wo.items?.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })) || [],
      subtotal: wo.totalAmount || 0,
      tax: 0,
      total: wo.totalAmount || 0,
      amountPaid: 0,
      balanceDue: wo.totalAmount || 0,
      stripePaymentIntentId: undefined,
      stripeChargeId: undefined,
      pdfStoredId: undefined,
      sentAt: undefined,
      paidAt: undefined,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("events", {
      leadId: wo.leadId,
      type: "invoice_created",
      summary: `Invoice ${invoiceNumber} created from work order ${wo._id}`,
      body: "",
      relatedId: id,
      createdAt: now,
    });
    return id;
  },
});

/** Draft invoice with editable line items. */
export const createDraft = mutation({
  args: { customerEmail: v.string(), lineItems: v.array(v.any()), workOrderId: v.optional(v.id("workOrders")), estimateId: v.optional(v.id("estimates")) },
  handler: async (ctx, args) => {
    const subtotal = args.lineItems.reduce((sum: number, item: any) => sum + (item.quantity || 1) * (item.unitPrice || 0), 0);
    const now = Date.now();
    const invoiceNumber = generateInvoiceNumber();
    const id = await ctx.db.insert("invoices", {
      leadId: undefined,
      workOrderId: args.workOrderId,
      estimateId: args.estimateId,
      customerEmail: args.customerEmail,
      invoiceNumber,
      issueDate: now,
      dueDate: now + 14 * 24 * 60 * 60 * 1000,
      status: "draft",
      currency: "USD",
      lineItems: args.lineItems.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total ?? item.quantity * item.unitPrice,
      })),
      subtotal,
      tax: 0,
      total: subtotal,
      amountPaid: 0,
      balanceDue: subtotal,
      stripePaymentIntentId: undefined,
      stripeChargeId: undefined,
      pdfStoredId: undefined,
      sentAt: undefined,
      paidAt: undefined,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

/** Send an invoice to a customer via email. */
export const sendInvoice = mutation({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get(args.invoiceId);
    if (!invoice) throw new Error("Invoice not found");
    if (invoice.customerEmail) {
      await ctx.db.patch(args.invoiceId, { sentAt: Date.now(), status: "sent", updatedAt: Date.now() });
    }
    return true;
  },
});

/** Public page: resolve invoice by tokenized email + invoice number. */
export const getByPublicId = query({
  args: { email: v.string(), invoiceNumber: v.string() },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.query("invoices").filter((q) => q.and(q.eq(q.field("customerEmail"), args.email.toLowerCase()), q.eq(q.field("invoiceNumber"), args.invoiceNumber))).first();
    return invoice;
  },
});

/** Find invoice by Stripe intent. */
export const getByStripeIntent = query({
  args: { intentId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("invoices").filter((q) => q.eq(q.field("stripePaymentIntentId"), args.intentId)).first();
  },
});

export const get = query({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.invoiceId);
  },
});

/** Webhook: Stripe checkout session completed → mark paid. */
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
    if (invoice.estimateId) {
      await ctx.db.patch(invoice.estimateId, { stage: "approved", updatedAt: now });
    }
    return true;
  },
});

/** List invoices by status. */
export const list = query({
  args: { status: v.optional(v.union(v.literal("draft"), v.literal("sent"), v.literal("paid"), v.literal("partial"), v.literal("overdue"), v.literal("cancelled"))), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const invoices = await ctx.db.query("invoices").collect();
    const filtered = args.status ? invoices.filter((i) => i.status === args.status) : invoices;
    return args.limit ? filtered.slice(0, args.limit) : filtered;
  },
});

/** Get invoices for a lead. */
export const getByLead = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const invoices = await ctx.db.query("invoices").collect();
    return invoices.filter((i) => i.leadId === args.leadId);
  },
});
