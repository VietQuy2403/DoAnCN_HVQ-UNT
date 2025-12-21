/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accountSettings from "../accountSettings.js";
import type * as auth from "../auth.js";
import type * as chatHistory from "../chatHistory.js";
import type * as dailyTracking from "../dailyTracking.js";
import type * as foodDatabase from "../foodDatabase.js";
import type * as http from "../http.js";
import type * as mealPlans from "../mealPlans.js";
import type * as userProfiles from "../userProfiles.js";
import type * as userSettings from "../userSettings.js";
import type * as weightTracking from "../weightTracking.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accountSettings: typeof accountSettings;
  auth: typeof auth;
  chatHistory: typeof chatHistory;
  dailyTracking: typeof dailyTracking;
  foodDatabase: typeof foodDatabase;
  http: typeof http;
  mealPlans: typeof mealPlans;
  userProfiles: typeof userProfiles;
  userSettings: typeof userSettings;
  weightTracking: typeof weightTracking;
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
