import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query: List all users (mock or real)
export const listUsers = query(async ({ db }) => {
  return await db.query("userProfiles").collect();
});

// Mutation: Create user (for dummy/demo use)
export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async ({ db }, { name, email, avatarUrl }) => {
    // Create a user profile with the required fields
    return await db.insert("userProfiles", { 
      firstName: name,
      email,
      userId: `user-${Date.now()}`, // Generate a mock user ID
      timezone: "UTC" // Default timezone
    });
  }
});
