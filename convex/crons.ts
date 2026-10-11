import { v } from "convex/values";
import { cronJobs } from "convex/server";
import { action, query, mutation } from "./_generated/server";
import { api } from "./_generated/api";

/** SLA watchdog: runs every 15 min, nags on stale / overdue leads. */
export const slaWatchdog = action({
  args: {},
  handler: async (ctx): Promise<{ newLeads: number; ests: number; docs: number }> => {
    const now = Date.now();

    // 1) SLA: first contact target breached → mark urgent + notify sales.
    const newLeads = await ctx.runQuery(api.leads.list, { status: "new", limit: 100 });
    for (const lead of newLeads) {
      const minutesElapsed = (now - lead.createdAt) / 1000 / 60;
      const urgentAfterMinutes = lead.urgentAfterMinutes ?? 30;
      if (minutesElapsed > urgentAfterMinutes && !lead.urgentAfterNotifiedAt) {
        await ctx.runMutation(api.leads.markSLABreached, {
          leadId: lead._id,
          firstContacted: undefined,
          minutesElapsed: Math.floor(minutesElapsed),
        });
        await ctx.scheduler.runAfter(0, api.emails.sendInternalLeadAlert, { leadId: lead._id });
      }
    }

    // 2) Pending estimates past deadline → auto-nudge.
    const ests = await ctx.runQuery(api.estimates.listByStatus, { status: "draft", limit: 100 });
    for (const est of ests) {
      const expires = est.validUntil ?? est.expiresAt ?? est.createdAt + 7 * 24 * 60 * 60 * 1000;
      if (expires < now && !est.clientNudgedAt) {
        await ctx.runMutation(api.estimates.sendNudge, { estimateId: est._id, reason: "deadline_pending" });
        await ctx.scheduler.runAfter(0, api.emails.sendEmail, {
          workflow: "estimateReminder",
          leadId: est.leadId,
          data: { estimate: est },
        });
      }
    }

    // 3) Completed work orders → invoice conversion (workOrders module TBD).
    //    Kept as a no-op stub until the workOrders module is added.
    // 4) Compliance doc expiry nudges.
    const docs = await ctx.runQuery(api.compliance.listByStatus, { status: "valid", limit: 100 });
    for (const doc of docs) {
      if (doc.expirationDate && doc.expirationDate < now + 7 * 24 * 60 * 60 * 1000 && doc.expirationDate > now) {
        await ctx.runMutation(api.compliance.nudgeExpiringDoc, { docId: doc._id });
      }
    }
    return { newLeads: newLeads.length, ests: ests.length, docs: docs.length };
  },
});

/** Nudge all client estimates past deadline. */
export const sendEstimateReminders = action({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ests = await ctx.runQuery(api.estimates.listByStatus, { status: "draft", limit: args.limit });
    for (const est of ests) {
      const expires = est.validUntil ?? est.expiresAt ?? est.createdAt + 7 * 24 * 60 * 60 * 1000;
      if (expires < now && !est.clientNudgedAt) {
        await ctx.scheduler.runAfter(0, api.estimates.sendNudge, { estimateId: est._id, reason: "deadline_pending" });
        await ctx.scheduler.runAfter(0, api.emails.sendEmail, {
          workflow: "estimateReminder",
          leadId: est.leadId,
          data: { estimate: est },
        });
      }
    }
  },
});

/** Register scheduled cron jobs — runs at module load. */
const crons = cronJobs();
crons.interval("sla watchdog", { minutes: 15 }, api.crons.slaWatchdog);
crons.interval("estimate reminder nudges", { hours: 6 }, api.crons.sendEstimateReminders, { limit: 50 });

export default crons;
