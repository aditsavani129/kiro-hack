import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get the current user's plan
export const getCurrentUserPlan = query(async ({ db, auth }) => {
  const identity = await auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  const userId = identity.subject;
  
  return await db.query("userPlans")
    .withIndex("by_userId", q => q.eq("userId", userId))
    .unique();
});

// Create or ensure a user plan exists
export const ensureUserPlan = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  const userId = identity.subject;

  // Check if a plan already exists
  const existingPlan = await ctx.db.query("userPlans").withIndex("by_userId", q => q.eq("userId", userId)).unique();
  if (existingPlan) {
    return existingPlan;
  }

  // Insert a new plan record with default values
  const now = Date.now();
  const newPlan = await ctx.db.insert("userPlans", {
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

  return await ctx.db.get(newPlan);
});

// Deduct credits for feature generation
export const deductCreditsForFeature = mutation({
  args: {
    creditsToDeduct: v.number(),
  },
  handler: async (ctx, { creditsToDeduct }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;
    
    // Find the user plan
    const userPlan = await ctx.db.query("userPlans")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
    
    if (!userPlan) {
      // Create a new plan if it doesn't exist
      const now = Date.now();
      const newPlanId = await ctx.db.insert("userPlans", {
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
      
      const newPlan = await ctx.db.get(newPlanId);
      if (!newPlan) {
        throw new Error("Failed to create user plan");
      }
      
      // Check if the new plan has enough credits
      if (newPlan.creditsRemaining < creditsToDeduct) {
        throw new Error("Not enough credits");
      }
      
      // Update the new plan
      await ctx.db.patch(newPlanId, {
        creditsRemaining: newPlan.creditsRemaining - creditsToDeduct,
        creditsUsed: newPlan.creditsUsed + creditsToDeduct,
      });
      
      return await ctx.db.get(newPlanId);
    }
    
    // Check if the plan has enough credits
    if (userPlan.creditsRemaining < creditsToDeduct) {
      throw new Error("Not enough credits");
    }
    
    // Update the plan
    await ctx.db.patch(userPlan._id, {
      creditsRemaining: userPlan.creditsRemaining - creditsToDeduct,
      creditsUsed: userPlan.creditsUsed + creditsToDeduct,
    });
    
    return await ctx.db.get(userPlan._id);
  },
});

// Add credits to a user's plan (for admin or purchase)
export const addCredits = mutation({
  args: {
    userId: v.string(),
    creditsToAdd: v.number(),
  },
  handler: async (ctx, { userId, creditsToAdd }) => {
    // Find the user plan
    const userPlan = await ctx.db.query("userPlans")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .unique();
    
    if (!userPlan) {
      throw new Error("User plan not found");
    }
    
    // Update the plan
    await ctx.db.patch(userPlan._id, {
      creditsRemaining: userPlan.creditsRemaining + creditsToAdd,
    });
    
    return await ctx.db.get(userPlan._id);
  },
});
