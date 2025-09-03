/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as chat from "../chat.js";
import type * as dashboard from "../dashboard.js";
import type * as emails from "../emails.js";
import type * as featureNode from "../featureNode.js";
import type * as features from "../features.js";
import type * as members from "../members.js";
import type * as projectMembers from "../projectMembers.js";
import type * as projects from "../projects.js";
import type * as prompts from "../prompts.js";
import type * as tasks from "../tasks.js";
import type * as userPlans from "../userPlans.js";
import type * as userProfiles from "../userProfiles.js";
import type * as users from "../users.js";
import type * as workspace from "../workspace.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  chat: typeof chat;
  dashboard: typeof dashboard;
  emails: typeof emails;
  featureNode: typeof featureNode;
  features: typeof features;
  members: typeof members;
  projectMembers: typeof projectMembers;
  projects: typeof projects;
  prompts: typeof prompts;
  tasks: typeof tasks;
  userPlans: typeof userPlans;
  userProfiles: typeof userProfiles;
  users: typeof users;
  workspace: typeof workspace;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
