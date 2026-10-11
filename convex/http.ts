import { httpRouter } from "convex/server";
import Stripe from "stripe";
import { v } from "convex/values";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

/** Brand-alias for Convex table Ids (Id<"invoices"> = string & { __tableName: "invoices" }). */
type InvoiceId = string & { __tableName: "invoices" };

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null;

const http = httpRouter();

/** Stripe webhook — updates invoice/payment status. */
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const raw = await request.text();
    if (!raw) {
      return new Response("Missing body", { status: 400 });
    }
    const signature = request.headers.get("stripe-signature") || "";
    if (!process.env.STRIPE_WEBHOOK_SECRET || !signature) {
      return new Response("Webhook signing secret not configured", { status: 400 });
    }
    let event: Stripe.Event;
    try {
      event = stripe!.webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err);
      return new Response("Webhook error: invalid signature", { status: 400 });
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await ctx.runMutation(api.payments.webhookPaymentIntentSucceeded, {
          paymentIntentId: pi.id,
          amount: pi.amount,
          currency: pi.currency,
          status: "succeeded",
          stripeChargeId: (pi as any).charges?.data?.[0]?.id as any,
        });
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await ctx.runMutation(api.payments.webhookPaymentIntentFailed, {
          paymentIntentId: pi.id,
          status: "failed",
          failureCode: pi.last_payment_error?.code,
        });
        break;
      }
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const invoiceId = session.metadata?.invoiceId;
        if (invoiceId) {
          await ctx.runMutation(api.invoices.webhookCheckoutCompleted, { invoiceId: invoiceId as InvoiceId, stripeCheckoutSessionId: session.id });
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        // Handle subscription lifecycle if offering recurring plans.
        break;
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    await ctx.runMutation(api.auditLog.logStripeWebhook, {
      eventType: event.type,
      eventId: event.id,
      createdAt: Date.now(),
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return new Response("OK", { status: 200 });
  }),
});

/** Twilio inbound SMS — creates/links a lead. */
http.route({
  path: "/twilio/sms",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const from = params.get("From") || "";
    const bodyText = params.get("Body") || "";
    const messageId = params.get("MessageSid") || "";

    const lower = bodyText.toLowerCase();
    const urgency: "emergency" | "high" | "standard" | "low" =
      /(flood|urgent|emergency|bursting|water coming|leaking heavily)/i.test(lower) ? "emergency" :
      /(leak|broken|not working|clogged|broken zone)/i.test(lower) ? "high" :
      "standard";
    const intent: "repair" | "install" | "maintenance" | "estimate" | "inquiry" =
      /(repair|fix|broken|service)/i.test(lower) ? "repair" :
      /(install|new|replace|quote|estimate)/i.test(lower) ? "estimate" : "inquiry";

    const existing = await ctx.runQuery(api.leads.getByPhone, { phone: from });
    if (existing) {
      await ctx.runMutation(api.leads.contact, {
        leadId: existing._id,
        type: "sms",
        summary: `SMS from ${from}: ${bodyText.slice(0, 100)}`,
        body: bodyText,
        providerMessageId: messageId,
      });
      return new Response("", { status: 200 });
    }

    const leadId = await ctx.runMutation(api.leads.create, {
      firstName: "",
      lastName: "",
      email: "",
      phone: from,
      service: "Landscaping Repair",
      problem: bodyText.slice(0, 200),
      urgency,
      intent,
      leadSource: "sms",
      notes: bodyText,
    });
    await ctx.runMutation(api.leads.contact, {
      leadId,
      type: "sms",
      summary: `New lead via SMS from ${from}`,
      body: bodyText,
      providerMessageId: messageId,
    });
    return new Response("", { status: 200 });
  }),
});

/** Twilio voice — captures speech-to-text payloads into leads. */
http.route({
  path: "/twilio/voice",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.text();
    const params = new URLSearchParams(body);
    const from = params.get("From") || "";
    const callStatus = params.get("CallStatus") || "";
    const speech = params.get("SpeechResult") || params.get("Digits") || "";
    const callSid = params.get("CallSid") || "";

    if (callStatus === "completed") {
      const lower = speech.toLowerCase();
      const urgency: "emergency" | "high" | "standard" | "low" =
        /(flood|urgent|emergency|bursting)/i.test(lower) ? "emergency" : "standard";

      const existing = await ctx.runQuery(api.leads.getByPhone, { phone: from });
      if (existing) {
        await ctx.runMutation(api.leads.contact, {
          leadId: existing._id,
          type: "call_outbound",
          summary: `Phone call from ${from}: ${speech.slice(0, 200)}`,
          body: speech,
          providerMessageId: callSid,
        });
      } else {
        const leadId = await ctx.runMutation(api.leads.create, {
          firstName: "",
          lastName: "",
          email: "",
          phone: from,
          problem: speech.slice(0, 200),
          urgency,
          intent: /(repair|fix|broken)/i.test(lower) ? "repair" : "inquiry",
          leadSource: "phone",
          notes: speech,
        });
        await ctx.runMutation(api.leads.contact, {
          leadId,
          type: "call_inbound",
          summary: `New lead via phone from ${from}`,
          body: speech,
          providerMessageId: callSid,
        });
      }
    }
    return new Response("", { status: 200 });
  }),
});

/** Google Calendar callback — OAuth return. */
http.route({
  path: "/calendar/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
      return new Response("Invalid callback", { status: 400 });
    }
    // Exchange code for tokens upstream (integrations), storing them for the authenticated user.
    const userId = (await ctx.auth.getUserIdentity())?.identity;
    await ctx.runMutation(api.integrations.syncGoogleCalendar, { code, state, userId: userId as any });
    return new Response("<h1>Calendar connected</h1><p>You can close this window.</p>", {
      headers: { "Content-Type": "text/html" },
    });
  }),
});

export default http;
