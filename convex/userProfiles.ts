import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get the current user's profile
export const getCurrentUserProfile = query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  const userId = identity.subject;
  
  return await db.query("userProfiles")
    .withIndex("by_userId", q => q.eq("userId", userId))
    .unique();
});

// Get user profiles by user IDs
export const getUserProfilesByIds = query({
  args: { userIds: v.array(v.string()) },
  handler: async ({ db }, { userIds }) => {
    if (userIds.length === 0) {
      return [];
    }
    
    // Get all profiles and filter by userIds
    const profiles = await db.query("userProfiles").collect();
    return profiles.filter(profile => userIds.includes(profile.userId));
  }
});

// Create or ensure a user profile exists
export const ensureUserProfile = mutation(async (ctx, { email, firstName, lastName, company, timezone }) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const userId = identity.subject; // The unique user ID from your auth provider (Clerk, Convex Auth, etc.)

  // Check if a profile already exists
  const existingProfile = await ctx.db.query("userProfiles").withIndex("by_userId", q => q.eq("userId", userId)).unique();
  if (existingProfile) {
    return existingProfile;
  }

  // Insert a new profile record
  const newProfile = await ctx.db.insert("userProfiles", {
    userId,
    email: email as string,
    firstName: firstName as string,
    lastName: lastName as string,
    company: company as string,
    timezone: timezone as string,
    stripeCustomerId: undefined,
  });

  // Create a free user plan with 50 credits
  const now = Date.now();
  await ctx.db.insert("userPlans", {
    userId,
    planType: "free",
    creditsRemaining: 50, // Default 50 credits
    creditsUsed: 0,
    planStartedAt: now,
    planEndsAt: undefined, // Free plan doesn't expire
    isActive: true,
    cancelAtPeriodEnd: false,
    currentPeriodEnd: undefined,
    teamSize: 1,
  });

  return newProfile;
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    
    // Find the user profile
    const userProfile = await ctx.db.query("userProfiles")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
    
    if (!userProfile) {
      throw new Error("User profile not found");
    }
    
    // Update the profile
    await ctx.db.patch(userProfile._id, {
      ...(args.firstName !== undefined && { firstName: args.firstName }),
      ...(args.lastName !== undefined && { lastName: args.lastName }),
      ...(args.email !== undefined && { email: args.email }),
      ...(args.company !== undefined && { company: args.company }),
      ...(args.timezone !== undefined && { timezone: args.timezone }),
    });
    
    return await ctx.db.get(userProfile._id);
  },
});
