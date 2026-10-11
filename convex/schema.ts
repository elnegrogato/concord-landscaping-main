import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const stringUrl = v.string();
const stringEmail = v.string();
const stringPhone = v.string();

export default defineSchema({
  // ───────────────────────────────────────────────────────────
  // Core business entities
  // ───────────────────────────────────────────────────────────

  /** Customer leads with stage tracking, SLAs, and assignment. */
  leads: defineTable({
    // Contact info
    firstName: v.string(),
    lastName: v.string(),
    email: stringEmail,
    phone: stringPhone,
    phoneE164: v.string(),
    // Lead intent
    service: v.optional(v.string()),
    serviceSlug: v.optional(v.string()),
    market: v.optional(v.string()),
    county: v.optional(v.string()),
    problem: v.optional(v.string()),
    urgency: v.optional(v.union(v.literal("emergency"), v.literal("high"), v.literal("standard"), v.literal("low"))),
    intent: v.optional(v.union(v.literal("repair"), v.literal("install"), v.literal("maintenance"), v.literal("estimate"), v.literal("inquiry"))),
    entityType: v.optional(v.union(v.literal("homeowner"), v.literal("hoa"), v.literal("commercial"), v.literal("property-manager"))),
    status: v.optional(v.union(v.literal("new"), v.literal("contacted"), v.literal("estimated"), v.literal("booked"), v.literal("scheduled"), v.literal("completed"), v.literal("won"), v.literal("lost"), v.literal("deferred"))),
    stageHistory: v.array(v.object({
      stage: v.string(),
      timestamp: v.number(),
      note: v.optional(v.string()),
    })),
    // Routing & assignment
    assignedTo: v.optional(v.id("staff")),
    assignedAt: v.optional(v.number()),
    leadSource: v.optional(v.union(v.literal("website"), v.literal("phone"), v.literal("sms"), v.literal("referral"), v.literal("ad"), v.literal("network"))),
    utm: v.optional(v.object({
      source: v.optional(v.string()),
      medium: v.optional(v.string()),
      campaign: v.optional(v.string()),
      term: v.optional(v.string()),
      content: v.optional(v.string()),
    })),
    // Timeline
    lastContactedAt: v.optional(v.number()),
    nextFollowUpAt: v.optional(v.number()),
    urgentAfterNotifiedAt: v.optional(v.number()),
    urgentAfterMinutes: v.optional(v.number()),
    // Metadata
    notes: v.optional(v.string()),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_phone", ["phone"])
    .index("by_email", ["email"])
    .index("by_assigned", ["assignedTo"])
    .index("by_created", ["createdAt"])
    .index("by_urgency_status", ["urgency", "status"]),

  /** Timeline of every lead interaction (calls, texts, emails, visits). */
  events: defineTable({
    leadId: v.id("leads"),
    type: v.union(v.literal("call_inbound"), v.literal("call_outbound"), v.literal("sms"), v.literal("email_sent"), v.literal("email_opened"), v.literal("email_clicked"), v.literal("form_submitted"), v.literal("visit"), v.literal("note"), v.literal("stage_change"), v.literal("approval"), v.literal("payment"), v.literal("work_order_created"), v.literal("invoice_created"), v.literal("estimate_approved"), v.literal("sla_breached"), v.literal("compliance_expiring")),
    summary: v.string(),
    body: v.optional(v.string()),
    direction: v.optional(v.union(v.literal("inbound"), v.literal("outbound"))),
    providerMessageId: v.optional(v.string()),
    relatedId: v.optional(v.any()),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
  }).index("by_lead", ["leadId"])
    .index("by_type", ["type"])
    .index("by_created", ["createdAt"]),

  // ───────────────────────────────────────────────────────────
  // Quotes & work
  // ───────────────────────────────────────────────────────────

  /** Line-item estimates with good/better/best tiers. */
  estimates: defineTable({
    leadId: v.id("leads"),
    customerEmail: stringEmail,
    title: v.string(),
    stage: v.union(v.literal("draft"), v.literal("sent"), v.literal("viewed"), v.literal("approved"), v.literal("rejected")),
    service: v.string(),
    market: v.optional(v.string()),
    tier: v.union(v.literal("good"), v.literal("better"), v.literal("best")),
    validUntil: v.number(),
    expiresAt: v.number(),
    tiers: v.array(v.object({
      id: v.string(),
      name: v.string(),
      label: v.string(),
      price: v.number(),
      depositPercent: v.optional(v.number()),
      description: v.string(),
      included: v.array(v.string()),
      excluded: v.array(v.string()),
    })),
    lineItems: v.array(v.object({
      description: v.string(),
      quantity: v.number(),
      unit: v.string(),
      unitPrice: v.number(),
      total: v.number(),
    })),
    subtotal: v.number(),
    taxPercent: v.number(),
    taxAmount: v.number(),
    totalEstimate: v.number(),
    totalAmount: v.number(),
    estimateNumber: v.string(),
    notes: v.optional(v.string()),
    terms: v.optional(v.string()),
    selectedTierId: v.optional(v.string()),
    approvalRequired: v.boolean(),
    approvedBy: v.optional(v.id("staff")),
    approvedAt: v.optional(v.number()),
    clientNudgedAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_lead", ["leadId"])
    .index("by_status", ["stage"])
    .index("by_customer_email", ["customerEmail"]),

  /** Scheduled jobs with crews and time windows. */
  appointments: defineTable({
    estimateId: v.optional(v.id("estimates")),
    leadId: v.id("leads"),
    startDate: v.number(),
    endDate: v.number(),
    timezone: v.optional(v.string()),
    status: v.union(v.literal("scheduled"), v.literal("in_progress"), v.literal("on_hold"), v.literal("completed"), v.literal("cancelled"), v.literal("no_show")),
    crewId: v.optional(v.id("crews")),
    leadTechnicianId: v.optional(v.id("staff")),
    serviceType: v.string(),
    notes: v.optional(v.string()),
    calendarEventId: v.optional(v.string()),
    calendarProvider: v.optional(v.union(v.literal("google"))),
    remindersSent: v.array(v.object({ type: v.string(), sentAt: v.number() })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_lead", ["leadId"])
    .index("by_crew", ["crewId"])
    .index("by_status", ["status"])
    .index("by_date", ["startDate", "endDate"]),

  /** Job execution with proof of completion and budget tracking. */
  workOrders: defineTable({
    appointmentId: v.optional(v.id("appointments")),
    estimateId: v.optional(v.id("estimates")),
    leadId: v.id("leads"),
    status: v.union(v.literal("planned"), v.literal("dispatched"), v.literal("in_progress"), v.literal("inspection"), v.literal("completed"), v.literal("closed"), v.literal("cancelled")),
    budget: v.number(),
    actualCost: v.optional(v.number()),
    notToExceed: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
    proof: v.optional(v.object({ photos: v.array(v.string()), videos: v.array(v.string()), notes: v.string() })),
    managerOverride: v.optional(v.boolean()),
    completedBy: v.optional(v.id("staff")),
    leadTechnicianId: v.optional(v.id("staff")),
    inspectionNotes: v.optional(v.string()),
    items: v.array(v.object({
      description: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
    })),
    totalAmount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_lead", ["leadId"])
    .index("by_status", ["status"])
    .index("by_crew", ["leadTechnicianId"]),

  // ───────────────────────────────────────────────────────────
  // Billing
  // ───────────────────────────────────────────────────────────

  /** Invoices with Stripe integration & partial payments. */
  invoices: defineTable({
    workOrderId: v.optional(v.id("workOrders")),
    estimateId: v.optional(v.id("estimates")),
    leadId: v.optional(v.id("leads")),
    customerEmail: stringEmail,
    invoiceNumber: v.string(),
    issueDate: v.number(),
    dueDate: v.number(),
    status: v.union(v.literal("draft"), v.literal("sent"), v.literal("paid"), v.literal("partial"), v.literal("overdue"), v.literal("cancelled")),
    currency: v.string(),
    subtotal: v.number(),
    tax: v.number(),
    total: v.number(),
    amountPaid: v.number(),
    balanceDue: v.number(),
    stripePaymentIntentId: v.optional(v.string()),
    stripeChargeId: v.optional(v.string()),
    pdfStoredId: v.optional(v.id("_storage")),
    lineItems: v.array(v.object({
      description: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      total: v.number(),
    })),
    sentAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_lead", ["leadId"])
    .index("by_status", ["status"])
    .index("by_due_date", ["dueDate"]),

  /** Payment records & splits. */
  payments: defineTable({
    invoiceId: v.optional(v.id("invoices")),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed"), v.literal("refunded")),
    method: v.union(v.literal("card"), v.literal("ach"), v.literal("check"), v.literal("cash"), v.literal("financing")),
    stripePaymentIntentId: v.optional(v.string()),
    stripeChargeId: v.optional(v.string()),
    cardLast4: v.optional(v.string()),
    cardBrand: v.optional(v.string()),
    metadata: v.optional(v.any()),
    processedAt: v.number(),
    createdAt: v.number(),
  }).index("by_invoice", ["invoiceId"])
    .index("by_intent", ["stripePaymentIntentId"]),

  /** Customer deposit requests/status. */
  deposits: defineTable({
    estimateId: v.id("estimates"),
    leadId: v.id("leads"),
    amount: v.number(),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled")),
    stripePaymentIntentId: v.optional(v.string()),
    dueDate: v.number(),
    paidAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_estimate", ["estimateId"])
    .index("by_lead", ["leadId"]),

  // ───────────────────────────────────────────────────────────
  // Outreach & email
  // ───────────────────────────────────────────────────────────

  /** Queued outbound messages with retry logic. */
  outboundMessages: defineTable({
    leadId: v.id("leads"),
    type: v.union(v.literal("email"), v.literal("sms")),
    workflow: v.string(),
    status: v.union(v.literal("queued"), v.literal("sending"), v.literal("sent"), v.literal("failed"), v.literal("delivered"), v.literal("opened"), v.literal("clicked")),
    providerMessageId: v.optional(v.string()),
    providerErrorCode: v.optional(v.string()),
    retries: v.number(),
    nextRetryAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
    openedAt: v.optional(v.number()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_lead", ["leadId"])
    .index("by_status", ["status"])
    .index("by_retry", ["status", "nextRetryAt"]),

  /** Customer email preferences (opt-in/opt-out). */
  emailPreferences: defineTable({
    leadId: v.optional(v.id("leads")),
    userEmail: stringEmail,
    subscribed: v.boolean(),
    workflows: v.optional(v.record(v.string(), v.boolean())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["userEmail"])
    .index("by_lead", ["leadId"]),

  // ───────────────────────────────────────────────────────────
  // Operations
  // ───────────────────────────────────────────────────────────

  /** Verified project gallery. */
  caseStudies: defineTable({
    title: v.string(),
    slug: v.string(),
    service: v.string(),
    location: v.string(),
    county: v.optional(v.string()),
    description: v.string(),
    challenges: v.array(v.string()),
    solution: v.string(),
    results: v.array(v.string()),
    priceRange: v.optional(v.object({ low: v.number(), high: v.number() })),
    gallery: v.array(v.object({ src: v.string(), caption: v.string() })),
    videoUrl: v.optional(v.string()),
    featured: v.boolean(),
    published: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_service", ["service"])
    .index("by_location", ["location"])
    .index("by_featured", ["featured", "published"]),

  /** Compliance docs with expiry alerts. */
  complianceDocs: defineTable({
    docType: v.union(v.literal("insurance"), v.literal("license"), v.literal("certification"), v.literal("permit"), v.literal("bond")),
    holder: v.string(),
    provider: v.optional(v.string()),
    certificateNumber: v.string(),
    leadId: v.optional(v.id("leads")),
    customerOrLeadId: v.optional(v.union(v.id("customers"), v.id("leads"))),
    issueDate: v.optional(v.number()),
    expirationDate: v.optional(v.number()),
    status: v.union(v.literal("valid"), v.literal("expiring_soon"), v.literal("expired"), v.literal("missing"), v.literal("pending_review")),
    documentUrl: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    autoRenew: v.boolean(),
    alertThresholdDays: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_type", ["docType"])
    .index("by_status", ["status"])
    .index("by_expiry", ["expirationDate"])
    .index("by_customer_or_lead", ["customerOrLeadId"]),

  /** Vehicle & equipment fleet. */
  fleet: defineTable({
    type: v.union(v.literal("truck"), v.literal("van"), v.literal("trailer"), v.literal("equipment"), v.literal("mower")),
    make: v.string(),
    model: v.string(),
    year: v.optional(v.number()),
    vin: v.optional(v.string()),
    plateNumber: v.optional(v.string()),
    plateState: v.optional(v.string()),
    status: v.union(v.literal("available"), v.literal("in_use"), v.literal("maintenance"), v.literal("retired")),
    currentJobId: v.optional(v.id("workOrders")),
    assignedCrewId: v.optional(v.id("crews")),
    lastMaintenanceDate: v.optional(v.number()),
    nextMaintenanceDate: v.optional(v.number()),
    odometerReading: v.optional(v.number()),
    insuranceExpiry: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_crew", ["assignedCrewId"]),

  /** Equipment maintenance logs. */
  maintenanceLogs: defineTable({
    fleetId: v.id("fleet"),
    type: v.union(v.literal("service"), v.literal("repair"), v.literal("inspection"), v.literal("parts_replacement")),
    date: v.number(),
    provider: v.optional(v.string()),
    cost: v.optional(v.number()),
    description: v.string(),
    nextServiceDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_fleet", ["fleetId"]),

  /** Employees & contractors. */
  staff: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: stringEmail,
    phone: stringPhone,
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("dispatcher"), v.literal("estimator"), v.literal("technician"), v.literal("crew_lead"), v.literal("viewer")),
    userType: v.union(v.literal("employee"), v.literal("contractor")),
    licenseNumbers: v.optional(v.array(v.string())),
    certifiedFor: v.optional(v.array(v.string())),
    territory: v.optional(v.string()),
    hourlyRate: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("on_leave"), v.literal("inactive")),
    onboardedAt: v.optional(v.number()),
    profilePhoto: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_status", ["status"]),

  /** Crews & scheduling. */
  crews: defineTable({
    name: v.string(),
    leadTechnicianId: v.optional(v.id("staff")),
    members: v.array(v.id("staff")),
    territory: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive")),
    availability: v.optional(v.object({ monday: v.boolean(), tuesday: v.boolean(), wednesday: v.boolean(), thursday: v.boolean(), friday: v.boolean(), saturday: v.boolean() })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_lead_tech", ["leadTechnicianId"])
    .index("by_status", ["status"]),

  /** Parts & supplies with reorder points. */
  inventory: defineTable({
    sku: v.string(),
    name: v.string(),
    category: v.string(),
    unit: v.string(),
    quantityOnHand: v.number(),
    reorderPoint: v.number(),
    reorderQuantity: v.number(),
    unitCost: v.number(),
    supplier: v.optional(v.string()),
    location: v.optional(v.string()),
    status: v.union(v.literal("in_stock"), v.literal("low_stock"), v.literal("out_of_stock"), v.literal("discontinued")),
    lastRestockedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_sku", ["sku"])
    .index("by_status", ["status"])
    .index("by_category", ["category"]),

  /** Inventory movement log. */
  inventoryMovements: defineTable({
    inventoryId: v.id("inventory"),
    type: v.union(v.literal("in"), v.literal("out"), v.literal("adjustment"), v.literal("transfer")),
    quantity: v.number(),
    referenceId: v.optional(v.id("workOrders")),
    referenceType: v.optional(v.string()),
    reason: v.optional(v.string()),
    performedBy: v.optional(v.id("staff")),
    createdAt: v.number(),
  }).index("by_inventory", ["inventoryId"])
    .index("by_date", ["createdAt"]),

  // ───────────────────────────────────────────────────────────
  // Policy & approvals
  // ───────────────────────────────────────────────────────────

  /** Business rules: discount thresholds, approval workflows, SLAs. */
  policies: defineTable({
    key: v.string(),
    name: v.string(),
    description: v.string(),
    rules: v.any(),
    active: v.boolean(),
    version: v.number(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("staff")),
  }).index("by_key", ["key"]),

  /** Approval requests for discounts, overrides, exceptions. */
  approvalRequests: defineTable({
    requestId: v.string(),
    leadId: v.optional(v.id("leads")),
    workOrderId: v.optional(v.id("workOrders")),
    type: v.union(v.literal("discount"), v.literal("budget_override"), v.literal("schedule_override"), v.literal("scope_change"), v.literal("refund"), v.literal("warranty")),
    requestedBy: v.id("staff"),
    requestedAt: v.number(),
    amount: v.optional(v.number()),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    reviewedBy: v.optional(v.id("staff")),
    reviewedAt: v.optional(v.number()),
    note: v.optional(v.string()),
    approvalPolicyId: v.optional(v.id("policies")),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_requester", ["requestedBy"])
    .index("by_lead", ["leadId"]),

  // ───────────────────────────────────────────────────────────
  // People & accounts
  // ───────────────────────────────────────────────────────────

  users: defineTable({
    email: stringEmail,
    name: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("dispatcher"), v.literal("estimator"), v.literal("technician"), v.literal("crew_lead"), v.literal("viewer")),
    phone: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("suspended"), v.literal("inactive")),
    preferences: v.optional(v.any()),
    lastLoginAt: v.optional(v.number()),
    passwordHash: v.optional(v.string()),
    passwordSalt: v.optional(v.string()),
    passwordChangedAt: v.optional(v.number()),
    failedLoginAttempts: v.optional(v.number()),
    lockedUntil: v.optional(v.number()),
    googleCalendarConnected: v.boolean(),
    calendarAutoSync: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  sessions: defineTable({
    userId: v.id("users"),
    tokenHash: v.string(),
    expiresAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_token_hash", ["tokenHash"])
    .index("by_user", ["userId"]),

  /** Customer-facing accounts. */
  customers: defineTable({
    leadId: v.optional(v.id("leads")),
    email: stringEmail,
    firstName: v.string(),
    lastName: v.string(),
    phone: stringPhone,
    address: v.optional(v.any()),
    preferences: v.optional(v.any()),
    stripeCustomerId: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),

  // ───────────────────────────────────────────────────────────
  // Audit & observability
  // ───────────────────────────────────────────────────────────

  auditLog: defineTable({
    actorId: v.optional(v.union(v.id("users"), v.id("staff"), v.string())),
    actorType: v.union(v.literal("user"), v.literal("staff"), v.literal("system"), v.literal("webhook")),
    action: v.string(),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    changes: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_actor", ["actorId"])
    .index("by_created", ["createdAt"])
    .index("by_action", ["action"]),

  /** AI agent execution logs. */
  agentRuns: defineTable({
    agentName: v.string(),
    trigger: v.union(v.literal("cron"), v.literal("webhook"), v.literal("user"), v.literal("trigger"), v.literal("scheduled")),
    status: v.union(v.literal("pending"), v.literal("running"), v.literal("success"), v.literal("failed"), v.literal("cancelled")),
    input: v.optional(v.any()),
    output: v.optional(v.any()),
    error: v.optional(v.string()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    durationMs: v.optional(v.number()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  /** Analytics snapshot store. */
  stats: defineTable({
    metric: v.string(),
    value: v.number(),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    date: v.number(),
    dimensions: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_metric_date", ["metric", "date"]),

  // ───────────────────────────────────────────────────────────
  // Integrations
  // ───────────────────────────────────────────────────────────

  /** Third-party connection tokens. */
  integrations: defineTable({
    provider: v.union(v.literal("stripe"), v.literal("twilio"), v.literal("resend"), v.literal("google_calendar"), v.literal("google_maps")),
    providerUserId: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    scopes: v.optional(v.array(v.string())),
    config: v.optional(v.any()),
    active: v.boolean(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_provider", ["provider"])
    .index("by_provider_user", ["provider", "providerUserId"]),

  /** API keys for integrations/partners. */
  apiKeys: defineTable({
    name: v.string(),
    keyHash: v.string(),
    keyPrefix: v.string(),
    permissions: v.array(v.union(v.literal("leads_read"), v.literal("leads_write"), v.literal("estimates_read"), v.literal("estimates_write"), v.literal("work_orders_read"), v.literal("work_orders_write"), v.literal("invoices_read"), v.literal("invoices_write"), v.literal("admin"))),
    userId: v.optional(v.id("users")),
    active: v.boolean(),
    lastUsedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_key_hash", ["keyHash"]),
});
