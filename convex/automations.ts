import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/** Automation engine: evaluates triggers and executes actions. */
export const evaluateTrigger = action({
  args: { triggerId: v.optional(v.string()), context: v.any() },
  handler: async (ctx, args) => {
    const context = args.context || {};
    // Log the default workflow run when no specific trigger is targeted.
    await ctx.runMutation(api.auditLog.log, {
      actorType: "system",
      action: "automation.runLeadOnboarding.default",
      changes: context,
    });
    return { executed: [] };
  },
});

/** Workflow: new lead onboarding sequence. */
export const runLeadOnboarding = action({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    // Queue the lead welcome email asynchronously.
    await ctx.scheduler.runAfter(0, api.emails.sendLeadWelcome, { leadId: args.leadId });
    return { sent: true };
  },
});

/** Workflow: abandoned estimate follow-up. */
export const runAbandonedEstimate = action({
  args: { estimateId: v.id("estimates") },
  handler: async (ctx, args) => {
    // wire into email system
    return { sent: false };
  },
});

/** Workflow: invoice payment reminder. */
export const runInvoiceReminder = action({
  args: { invoiceId: v.id("invoices") },
  handler: async (ctx, args) => {
    return { sent: false };
  },
});
