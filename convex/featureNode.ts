import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query: Get all features for a given project
export const getFeatureTree = query({
  args: { projectId: v.id("projects") },
  handler: async ({ db }, { projectId }) => {
    return await db.query("features").filter(q => 
      q.eq(q.field("projectId"), projectId)
    ).collect();
    // Build the tree on the client side using parentId
  }
});

// Mutation: Add a feature
export const addFeature = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.union(
      v.literal("Low"),
      v.literal("Medium"),
      v.literal("High"),
      v.literal("Critical")
    ),
    effort: v.union(
      v.literal("Small"),
      v.literal("Medium"),
      v.literal("Large"),
      v.literal("XL")
    ),
    category: v.union(
      v.literal("Core"),
      v.literal("Enhancement"),
      v.literal("Integration"),
      v.literal("UI/UX"),
      v.literal("Performance"),
      v.literal("Security")
    ),
    userId: v.optional(v.string()),
  },
  handler: async ({ db }, { ...rest }) => {
    return await db.insert("features", {
      ...rest,
      addedToTask: false,
    });
  }
});

// Mutation: Update (patch) a feature
export const updateFeature = mutation({
  args: {
    featureId: v.id("features"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priority: v.optional(v.union(
      v.literal("Low"),
      v.literal("Medium"),
      v.literal("High"),
      v.literal("Critical")
    )),
    effort: v.optional(v.union(
      v.literal("Small"),
      v.literal("Medium"),
      v.literal("Large"),
      v.literal("XL")
    )),
    category: v.optional(v.union(
      v.literal("Core"),
      v.literal("Enhancement"),
      v.literal("Integration"),
      v.literal("UI/UX"),
      v.literal("Performance"),
      v.literal("Security")
    )),
    userId: v.optional(v.string()),
    addedToTask: v.optional(v.boolean()),
  },
  handler: async ({ db }, { featureId, ...updates }) => {
    // Clean out undefined updates
    Object.keys(updates).forEach(
      key => updates[key as keyof typeof updates] === undefined && delete updates[key as keyof typeof updates]
    );
    await db.patch(featureId, updates);
  }
});

// Mutation: Delete a feature
export const deleteFeature = mutation({
  args: { featureId: v.id("features") },
  handler: async ({ db }, { featureId }) => {
    await db.delete(featureId);
  }
});
