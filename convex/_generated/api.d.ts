/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auditLog from "../auditLog.js";
import type * as auth from "../auth.js";
import type * as automations from "../automations.js";
import type * as compliance from "../compliance.js";
import type * as crons from "../crons.js";
import type * as emails from "../emails.js";
import type * as estimates from "../estimates.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as integrations from "../integrations.js";
import type * as invoices from "../invoices.js";
import type * as leads from "../leads.js";
import type * as lib_email from "../lib/email.js";
import type * as payments from "../payments.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auditLog: typeof auditLog;
  auth: typeof auth;
  automations: typeof automations;
  compliance: typeof compliance;
  crons: typeof crons;
  emails: typeof emails;
  estimates: typeof estimates;
  events: typeof events;
  http: typeof http;
  integrations: typeof integrations;
  invoices: typeof invoices;
  leads: typeof leads;
  "lib/email": typeof lib_email;
  payments: typeof payments;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
