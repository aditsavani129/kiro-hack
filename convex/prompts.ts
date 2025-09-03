import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Save a generated prompt to the database
export const savePrompt = mutation({
  args: {
    projectId: v.id("projects"),
    featureId: v.optional(v.id("features")),
    content: v.string(),
    type: v.string(), // 'project' or 'feature'
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const userId = identity.subject;

    // Save the prompt
    const promptId = await ctx.db.insert("prompts", {
      projectId: args.projectId,
      featureId: args.featureId,
      content: args.content,
      type: args.type,
      createdAt: args.createdAt,
      userId,
    });

    return promptId;
  },
});

// Get all prompts for a project
export const getProjectPrompts = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get all prompts for the project
    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    return prompts;
  },
});

// Get prompts for a specific feature
export const getFeaturePrompts = query({
  args: {
    featureId: v.id("features"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get all prompts for the feature
    const prompts = await ctx.db
      .query("prompts")
      .withIndex("by_featureId", (q) => q.eq("featureId", args.featureId))
      .collect();

    return prompts;
  },
});

// Delete a prompt
export const deletePrompt = mutation({
  args: {
    promptId: v.id("prompts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Delete the prompt
    await ctx.db.delete(args.promptId);
    return true;
  },
});
