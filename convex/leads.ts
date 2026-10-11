import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// ───────────── SLA config ─────────────
const SLA_MS = {
  emergency: 10 * 60 * 1000,   // 10 min
  high: 30 * 60 * 1000,        // 30 min
  standard: 60 * 60 * 1000,    // 60 min
  low: 4 * 60 * 60 * 1000,     // 4 hrs
};

type LeadStage = "new" | "contacted" | "estimated" | "booked" | "scheduled" | "completed" | "won" | "lost" | "deferred";

// ───────────── Lead creation ─────────────

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    service: v.optional(v.string()),
    serviceSlug: v.optional(v.string()),
    market: v.optional(v.string()),
    county: v.optional(v.string()),
    problem: v.optional(v.string()),
    urgency: v.optional(v.union(v.literal("emergency"), v.literal("high"), v.literal("standard"), v.literal("low"))),
    intent: v.optional(v.union(v.literal("repair"), v.literal("install"), v.literal("maintenance"), v.literal("estimate"), v.literal("inquiry"))),
    entityType: v.optional(v.union(v.literal("homeowner"), v.literal("hoa"), v.literal("commercial"), v.literal("property-manager"))),
    leadSource: v.optional(v.union(v.literal("website"), v.literal("phone"), v.literal("sms"), v.literal("referral"), v.literal("ad"), v.literal("network"))),
    utm: v.optional(v.object({
      source: v.optional(v.string()),
      medium: v.optional(v.string()),
      campaign: v.optional(v.string()),
      term: v.optional(v.string()),
      content: v.optional(v.string()),
    })),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
    // Communication consent (required before outbound email/SMS/voice follow-up)
    consentGiven: v.boolean(),
    consentTimestamp: v.optional(v.number()),
    consentVersion: v.optional(v.string()),
    consentSourcePage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const firstName = args.firstName.trim();
    const lastName = args.lastName.trim();
    const email = args.email.trim().toLowerCase();

    // Dedupe: existing lead with same email or phone
    const existing = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        updatedAt: now,
        notes: args.notes
          ? `${existing.notes ? existing.notes + "\n" : ""}[${new Date().toISOString()}] Re-merged from ${args.leadSource || "unknown"}`
          : undefined,
        tags: args.tags ? [...new Set([...(existing.tags || []), ...args.tags])] : existing.tags,
        lastContactedAt: now,
      });
      return existing._id;
    }

    const phoneE164 = args.phone; // normalize server-side with lib/normalize.ts in prod

    const leadId = await ctx.db.insert("leads", {
      firstName,
      lastName,
      email,
      phone: args.phone,
      phoneE164: phoneE164,
      service: args.service,
      serviceSlug: args.serviceSlug,
      market: args.market,
      county: args.county,
      problem: args.problem,
      urgency: args.urgency || "standard",
      intent: args.intent || "estimate",
      entityType: args.entityType || "homeowner",
      status: "new",
      stageHistory: [{ stage: "new", timestamp: now, note: `Lead created via ${args.leadSource || "unknown"}` }],
      leadSource: args.leadSource || "website",
      utm: args.utm,
      notes: args.notes,
      tags: args.tags || [],
      // Communication consent
      consentGiven: args.consentGiven,
      consentTimestamp: args.consentTimestamp,
      consentVersion: args.consentVersion,
      consentSourcePage: args.consentSourcePage,
      createdAt: now,
      updatedAt: now,
    });

    // Record creation event
    await ctx.db.insert("events", {
      leadId,
      type: "form_submitted",
      summary: `New lead: ${firstName} ${lastName}`,
      body: JSON.stringify({ source: args.leadSource, service: args.service, urgency: args.urgency }),
      createdAt: now,
    });

    // Internal lead alert email (async via outboundMessages).
    await ctx.scheduler.runAfter(0, api.emails.sendInternalLeadAlert, { leadId });

    return leadId;
  },
});

// ───────────── Stage transitions ─────────────

export const transition = mutation({
  args: {
    leadId: v.id("leads"),
    stage: v.union(v.literal("new"), v.literal("contacted"), v.literal("estimated"), v.literal("booked"), v.literal("scheduled"), v.literal("completed"), v.literal("won"), v.literal("lost"), v.literal("deferred")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    if (lead.status === args.stage) return args.leadId;

    await ctx.db.patch(args.leadId, {
      status: args.stage,
      lastContactedAt: now,
      stageHistory: [...lead.stageHistory, { stage: args.stage, timestamp: now, note: args.note }],
      updatedAt: now,
    });

    await ctx.db.insert("events", {
      leadId: args.leadId,
      type: "stage_change",
      summary: `Lead moved to ${args.stage}`,
      body: JSON.stringify({ from: lead.status, to: args.stage, note: args.note }),
      createdAt: now,
    });

    return args.leadId;
  },
});

// ───────────── Assign ─────────────

export const assign = mutation({
  args: {
    leadId: v.id("leads"),
    staffId: v.id("staff"),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");

    await ctx.db.patch(args.leadId, {
      assignedTo: args.staffId,
      assignedAt: now,
      lastContactedAt: now,
      updatedAt: now,
      stageHistory: [...lead.stageHistory, { stage: "assigned", timestamp: now, note: args.note || `Assigned to staff ${args.staffId}` }],
    });

    await ctx.db.insert("events", {
      leadId: args.leadId,
      type: "note",
      summary: `Assigned to ${args.staffId}`,
      body: args.note || "",
      createdAt: now,
    });

    return args.leadId;
  },
});

/** SLA watchdog helper: mark a lead as SLA breached & notify. */
export const markSLABreached = mutation({
  args: { leadId: v.id("leads"), firstContacted: v.optional(v.number()), minutesElapsed: v.number() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");
    await ctx.db.patch(args.leadId, {
      urgentAfterNotifiedAt: now,
      urgentAfterMinutes: args.minutesElapsed,
      updatedAt: now,
    });
    await ctx.db.insert("events", {
      leadId: args.leadId,
      type: "sla_breached",
      summary: `First-contact SLA breached after ${args.minutesElapsed} min (firstContacted=${args.firstContacted})`,
      body: "",
      createdAt: now,
    });
    return true;
  },
});

// ───────────── Contact / add note ─────────────

const EVENT_TYPE_MAP = {
  call_inbound: "call_inbound" as const,
  call_outbound: "call_outbound" as const,
  sms: "sms" as const,
  email: "email_sent" as const,
  visit: "visit" as const,
} as const;

export const contact = mutation({
  args: {
    leadId: v.id("leads"),
    type: v.union(v.literal("call_inbound"), v.literal("call_outbound"), v.literal("sms"), v.literal("email"), v.literal("visit")),
    summary: v.string(),
    body: v.optional(v.string()),
    providerMessageId: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");

    const eventType = EVENT_TYPE_MAP[args.type];
    const direction =
      args.type === "call_inbound" || args.type === "sms" || args.type === "visit" ? "inbound" : "outbound";

    await ctx.db.patch(args.leadId, {
      lastContactedAt: now,
      updatedAt: now,
      stageHistory: lead.stageHistory.length >= 20
        ? [...lead.stageHistory.slice(1), { stage: "contacted", timestamp: now, note: args.note }]
        : [...lead.stageHistory, { stage: "contacted", timestamp: now, note: args.note }],
    });

    await ctx.db.insert("events", {
      leadId: args.leadId,
      type: eventType,
      summary: args.summary,
      body: args.body,
      direction: direction,
      providerMessageId: args.providerMessageId,
      createdAt: now,
    });

    return args.leadId;
  },
});

// ───────────── SLA helpers ─────────────

/** Get the SLA target for a given urgency. */
export const slaTargetMs = query({
  args: { urgency: v.union(v.literal("emergency"), v.literal("high"), v.literal("standard"), v.literal("low")) },
  handler: async (ctx, args) => SLA_MS[args.urgency],
});

/** Find overdue leads not yet contacted. */
export const overdueLeads = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const leads = await ctx.db.query("leads").collect();
    const overdue: { leadId: string; created: number; urgency: string }[] = [];
    for (const lead of leads) {
      if (lead.status !== "new") continue;
      const target = SLA_MS[lead.urgency || "standard"];
      if (now - lead.createdAt > target && !lead.lastContactedAt) {
        overdue.push({ leadId: lead._id, created: lead.createdAt, urgency: lead.urgency || "standard" });
      }
    }
    return overdue;
  },
});

/** Find leads with a next follow-up due. */
export const followUpsDue = query({
  handler: async (ctx) => {
    const now = Date.now();
    const leads = await ctx.db.query("leads").collect();
    const result: any[] = [];
    for (const lead of leads) {
      if (lead.nextFollowUpAt && lead.nextFollowUpAt <= now) {
        result.push(lead);
      }
    }
    return result;
  },
});

// ───────────── Queries ─────────────

export const get = query({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => ctx.db.get(args.leadId),
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    status: v.optional(v.string()),
    assignedTo: v.optional(v.id("staff")),
  },
  handler: async (ctx, args) => {
    const leads = await ctx.db.query("leads").collect();
    let filtered = leads;
    if (args.status) filtered = filtered.filter((l) => l.status === args.status);
    if (args.assignedTo) filtered = filtered.filter((l) => l.assignedTo === args.assignedTo);
    const sorted = filtered.sort((a, b) => b._creationTime - a._creationTime);
    const start = args.offset || 0;
    const end = start + (args.limit || sorted.length);
    return sorted.slice(start, end);
  },
});

export const search = query({
  args: { q: v.string() },
  handler: async (ctx, args) => {
    const q = args.q.toLowerCase().trim();
    if (!q) return [];
    const byPhone = await ctx.db.query("leads").withIndex("by_phone", (qq) => qq.eq("phone", args.q)).collect();
    const results = await Promise.all(
      byPhone.map(async (lead) => {
        return [lead, 1 as const] as const;
      })
    );
    return results.flat().filter((x): x is any => !!x);
  },
});

export const countsByStage = query({
  handler: async (ctx) => {
    const stages: LeadStage[] = ["new", "contacted", "estimated", "booked", "scheduled", "completed", "won", "lost", "deferred"];
    const counts: Record<string, number> = {};
    const allLeads = await ctx.db.query("leads").collect();
    for (const stage of stages) {
      const ids = await ctx.db.query("leads").withIndex("by_status", (q) => q.eq("status", stage)).collect();
      counts[stage] = ids.length;
    }
    return counts;
  },
});

/** Resolve a lead by phone / email across sources. */
export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone.trim()))
      .first();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .first();
  },
});
