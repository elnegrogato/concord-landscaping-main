import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Resend } from "resend";
import { assembleEmail } from "./lib/email";

const EMAIL_WORKFLOW_KEYS = [
  "leadWelcome",
  "estimateReady",
  "invoiceReady",
  "paymentReceived",
  "appointmentReminder",
  "reviewRequest",
  "passwordReset",
  "internalLeadAlert",
  "workOrderScheduled",
  "workOrderCompleted",
  "estimateForApproval",
  "estimateReminder",
  "genericNotification",
] as const;
export type EmailWorkflowKey = (typeof EMAIL_WORKFLOW_KEYS)[number];

// ───────────────────────────────────────────────────────────
// Workflow templates (React Email)
// ───────────────────────────────────────────────────────────

const WORKFLOWS = {
  leadWelcome: "leadWelcome",
  estimateReady: "estimateReady",
  invoiceReady: "invoiceReady",
  paymentReceived: "paymentReceived",
  appointmentReminder: "appointmentReminder",
  reviewRequest: "reviewRequest",
  passwordReset: "passwordReset",
  internalLeadAlert: "internalLeadAlert",
  workOrderScheduled: "workOrderScheduled",
  workOrderCompleted: "workOrderCompleted",
  estimateForApproval: "estimateForApproval",
  estimateReminder: "estimateReminder",
  genericNotification: "genericNotification",
} as const;

export type WorkflowKey = keyof typeof WORKFLOWS;

// ───────────────────────────────────────────────────────────
// Sending engine
// ───────────────────────────────────────────────────────────

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/** Persist an outbound message record (called by the send action). */
export const queueOutboundMessage = mutation({
  args: {
    leadId: v.id("leads"),
    workflow: v.union(...EMAIL_WORKFLOW_KEYS.map((w) => v.literal(w))),
    status: v.union(v.literal("sent"), v.literal("failed"), v.literal("queued")),
    providerMessageId: v.optional(v.string()),
    providerErrorCode: v.optional(v.string()),
    retries: v.number(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<string> => {
    const now = Date.now();
    const msgId = await ctx.db.insert("outboundMessages", {
      leadId: args.leadId,
      type: "email",
      workflow: args.workflow,
      status: args.status,
      providerMessageId: args.providerMessageId,
      providerErrorCode: args.providerErrorCode,
      retries: args.retries,
      nextRetryAt: args.status === "failed" ? now + 5 * 60 * 1000 : undefined,
      sentAt: undefined,
      deliveredAt: undefined,
      openedAt: undefined,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });
    return msgId;
  },
});

/** Persist an events record (called by the send action). */
export const queueEvent = mutation({
  args: {
    leadId: v.id("leads"),
    type: v.union(v.literal("note"), v.literal("sms"), v.literal("call_inbound"), v.literal("call_outbound"), v.literal("email_sent"), v.literal("email_opened"), v.literal("email_clicked"), v.literal("form_submitted"), v.literal("visit"), v.literal("stage_change"), v.literal("approval"), v.literal("payment"), v.literal("work_order_created"), v.literal("estimate_approved"), v.literal("sla_breached"), v.literal("compliance_expiring")),
    summary: v.string(),
    body: v.optional(v.string()),
    relatedId: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<string> => {
    const now = Date.now();
    return await ctx.db.insert("events", {
      leadId: args.leadId,
      type: args.type,
      summary: args.summary,
      body: args.body,
      direction: args.type === "call_inbound" ? "inbound" : "outbound",
      providerMessageId: undefined,
      relatedId: args.relatedId,
      createdAt: now,
    });
  },
});

/** Get an outbound message by ID. */
export const getOutboundMessageById = query({
  args: { messageId: v.id("outboundMessages") },
  handler: async (ctx, args) => await ctx.db.get(args.messageId),
});

/** Send an email workflow for a lead, queuing it in outboundMessages. */
export const sendEmail = action({
  args: {
    workflow: v.union(...EMAIL_WORKFLOW_KEYS.map((w) => v.literal(w))),
    leadId: v.id("leads"),
    data: v.optional(v.any()),
    to: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ messageId: string; status: string; providerMessageId: string | undefined }> => {
    const lead = await ctx.runQuery(api.leads.get, { leadId: args.leadId });
    if (!lead) throw new Error("Lead not found");
    const toEmail = args.to || lead.email;
    if (!toEmail) throw new Error("No recipient email");

    const assembled = await assembleEmail(args.workflow, args.data || {});
    if (!assembled) {
      throw new Error(`Email template for workflow '${args.workflow}' not found`);
    }
    const { subject, html, text } = assembled;

    let providerMessageId: string | undefined;
    let status: "sent" | "failed" | "queued" = "queued";
    let providerErrorCode: string | undefined;

    if (resend) {
      const res = await resend.emails.send({
        from: process.env.EMAIL_FROM || "noreply@concordlandscaping.com",
        to: toEmail,
        subject,
        html,
        text,
        headers: {
          "List-Unsubscribe": `<mailto:${process.env.EMAIL_REPLY_TO || "noreply@concordlandscaping.com"}?subject=unsubscribe-${args.workflow}>`,
          "X-Campaign": args.workflow,
        },
      });
      if (res.error) {
        providerErrorCode = String(res.error);
        status = "failed";
      } else if (res.data) {
        providerMessageId = res.data.id;
        status = "sent";
      }
    } else {
      console.log(`[Email Mock] ${args.workflow} to ${toEmail}: ${subject}`);
      status = "queued";
    }

    const msgId = await ctx.runMutation(api.emails.queueOutboundMessage, {
      leadId: args.leadId,
      workflow: args.workflow,
      status,
      providerMessageId,
      providerErrorCode,
      retries: 0,
      metadata: { subject, recipient: toEmail, data: args.data },
    });

    const eventType = status === "sent" ? "email_sent" : "note";
    await ctx.runMutation(api.emails.queueEvent, {
      leadId: args.leadId,
      type: eventType,
      summary: `Email '${args.workflow}' ${status}`,
      body: JSON.stringify({ messageId: msgId, providerMessageId, status }),
      relatedId: msgId,
    });

    return { messageId: msgId, status, providerMessageId };
  },
});

/** Batch send emails (e.g., follow-up campaigns). */
export const sendBatchEmails = action({
  args: {
    workflow: v.union(v.literal("leadWelcome"), v.literal("estimateReady"), v.literal("invoiceReady"), v.literal("paymentReceived"), v.literal("appointmentReminder"), v.literal("reviewRequest"), v.literal("passwordReset"), v.literal("internalLeadAlert"), v.literal("workOrderScheduled"), v.literal("workOrderCompleted"), v.literal("estimateForApproval"), v.literal("estimateReminder"), v.literal("genericNotification")),
    leadIds: v.array(v.id("leads")),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args): Promise<unknown> => {
    return Promise.all(
      args.leadIds.map((leadId) =>
        ctx.scheduler.runAfter(0, api.emails.sendEmail, { workflow: args.workflow, leadId, data: args.data }).catch((err) => ({
          leadId,
          status: "failed",
          error: err instanceof Error ? err.message : "unknown",
        }))
      )
    );
  },
});

/** Resend a single outbound message by ID. */
export const resendOutboundMessage = action({
  args: { messageId: v.id("outboundMessages") },
  handler: async (ctx, args): Promise<{ messageId: string; status: string }> => {
    const msg = await ctx.runQuery(api.emails.getOutboundMessageById, { messageId: args.messageId });
    if (!msg) throw new Error("Message not found");
    if (msg.type !== "email") throw new Error("Only email messages can be resent");
    const lead = await ctx.runQuery(api.leads.get, { leadId: msg.leadId });
    if (!lead) throw new Error("Lead not found");
    const scheduledId = await ctx.scheduler.runAfter(0, api.emails.sendEmail, {
      workflow: msg.workflow as EmailWorkflowKey,
      leadId: msg.leadId,
      data: msg.metadata?.data,
    });
    return { messageId: scheduledId, status: "queued" };
  },
});

// ───────────────────────────────────────────────────────────
// Convenience wrappers for the automations layer
// ───────────────────────────────────────────────────────────

export const sendLeadWelcome = action({
  args: { email: v.optional(v.string()), leadId: v.optional(v.id("leads")) },
  handler: async (ctx, args): Promise<unknown> => {
    let lead = await (args.leadId
      ? ctx.runQuery(api.leads.get, { leadId: args.leadId })
      : ctx.runQuery(api.leads.getByEmail, { email: args.email! }));
    if (!lead) throw new Error("Lead not found");
    return ctx.scheduler.runAfter(0, api.emails.sendEmail, {
      workflow: "leadWelcome",
      leadId: lead._id,
      data: { lead },
      to: args.email,
    });
  },
});

export const sendInternalLeadAlert = action({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args): Promise<unknown> => {
    const lead = await ctx.runQuery(api.leads.get, { leadId: args.leadId });
    if (!lead) throw new Error("Lead not found");
    return ctx.scheduler.runAfter(0, api.emails.sendEmail, {
      workflow: "internalLeadAlert",
      leadId: args.leadId,
      data: { lead },
      to: process.env.INTERNAL_LEAD_ALERT_EMAIL,
    });
  },
});

/** Send a password reset email to a user. */
export const sendPasswordReset = action({
  args: { userId: v.id("users"), email: v.string() },
  handler: async (ctx, args): Promise<unknown> => {
    return ctx.scheduler.runAfter(0, api.emails.sendEmail, {
      workflow: "internalLeadAlert",
      leadId: args.userId as any,
      data: { user: { email: args.email }, resetUrl: process.env.APP_URL || "https://concordlandscaping.com" },
      to: args.email,
    });
  },
});
