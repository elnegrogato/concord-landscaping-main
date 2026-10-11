import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** Record a lead interaction event. */
export const create = mutation({
  args: {
    leadId: v.id("leads"),
    type: v.union(v.literal("call_inbound"), v.literal("call_outbound"), v.literal("sms"), v.literal("email_sent"), v.literal("email_opened"), v.literal("email_clicked"), v.literal("form_submitted"), v.literal("visit"), v.literal("note"), v.literal("stage_change"), v.literal("approval"), v.literal("payment"), v.literal("work_order_created")),
    summary: v.string(),
    body: v.optional(v.string()),
    direction: v.optional(v.union(v.literal("inbound"), v.literal("outbound"))),
    providerMessageId: v.optional(v.string()),
    relatedId: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("events", {
      leadId: args.leadId,
      type: args.type,
      summary: args.summary,
      body: args.body,
      direction: args.direction,
      providerMessageId: args.providerMessageId,
      relatedId: args.relatedId,
      createdAt: now,
    });
    return id;
  },
});

export const list = query({
  args: { leadId: v.id("leads"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const q = ctx.db.query("events").withIndex("by_lead", (qq) => qq.eq("leadId", args.leadId));
    const events = await q.collect();
    const sorted = args.limit ? events.slice(0, args.limit) : events.sort((a, b) => b._creationTime - a._creationTime);
    return sorted;
  },
});
