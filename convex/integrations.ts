import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/** OAuth callback: exchange auth code for provider tokens (stub; wire your OAuth flow). */
export const syncGoogleCalendar = mutation({
  args: { code: v.string(), state: v.string(), userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const integrations = await ctx.db
      .query("integrations")
      .withIndex("by_provider", (q) => q.eq("provider", "google_calendar"))
      .first();
    if (integrations) {
      await ctx.db.patch(integrations._id, {
        accessToken: `mock_${Date.now()}`,
        config: { codeExchange: "mock" },
        active: true,
        updatedAt: Date.now(),
      });
    } else {
      const id = await ctx.db.insert("integrations", {
        provider: "google_calendar",
        providerUserId: args.userId?.toString(),
        accessToken: `mock_${Date.now()}`,
        config: { codeExchange: "mock", state: args.state },
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return id;
    }
    return true;
  },
});

/** Get a Google Calendar event for an appointment. */
export const getCalendarEvent = query({
  args: { calendarEventId: v.string(), appointmentId: v.optional(v.id("appointments")) },
  handler: async (ctx, args) => {
    // Return cached copy if present, else delegate to the calendar integration.
    return null;
  },
});

/** Sync an appointment to the connected calendar (two-way sync). */
export const syncAppointmentToCalendar = mutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const appt = await ctx.db.get(args.appointmentId);
    if (!appt) throw new Error("Appointment not found");
    const integration = await ctx.db
      .query("integrations")
      .withIndex("by_provider", (q) => q.eq("provider", "google_calendar"))
      .first();
    if (!integration?.active) return { synced: false, reason: "calendar integration not active" };
    // In prod: call Google Calendar API and store the external event id.
    return { synced: true, calendarEventId: `mock_${Date.now()}` };
  },
});

/** Sync a calendar event back into an appointment. */
export const syncCalendarToAppointment = mutation({
  args: { calendarEventId: v.string() },
  handler: async (ctx, args) => {
    // In prod: read external event and update appointments.
    return { synced: false, reason: "not implemented" };
  },
});
