import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { DatabaseReader, MutationCtx, QueryCtx } from "./_generated/server";


// Query: Get features for a project
export const getProjectFeatures = query({
  args: { projectId: v.id("projects") },
  handler: async ({ db, auth }, { projectId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Check if user has access to this project
    const project = await db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check if user is the owner or a member with access
    const isOwner = project.userId === userId;
    const membersWithRole = project.membersWithRole as Record<string, string> || {};
    const isMember = membersWithRole[userId] !== undefined;
    
    if (!isOwner && !isMember) {
      throw new Error("Access denied: You don't have permission to view this project");
    }
    
    return await db.query("features")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();
  }
});

// Mutation: Create a feature
export const createFeature = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.string(),
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
    implementationDetails: v.optional(v.string()),
    aiPrompt: v.optional(v.string())
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Check if user has access to this project
    const project = await db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check if user is the owner or a member with admin/owner role
    const isOwner = project.userId === userId;
    const membersWithRole = project.membersWithRole as Record<string, string> || {};
    const isAdminOrOwner = isOwner || membersWithRole[userId] === "admin" || membersWithRole[userId] === "owner";
    
    if (!isAdminOrOwner) {
      throw new Error("Access denied: You don't have permission to create features for this project");
    }
    
    return await db.insert("features", {
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      priority: args.priority,
      effort: args.effort,
      category: args.category,
      userId: userId,
      addedToTask: false
    });
  }
});

// Mutation: Create multiple features at once
export const createFeatures = mutation({
  args: {
    projectId: v.id("projects"),
    features: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
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
        implementationDetails: v.optional(v.string()),
        aiPrompt: v.optional(v.string())
      })
    )
  },
  handler: async ({ db, auth }, { projectId, features }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Check if user has access to this project
    const project = await db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check if user is the owner or a member with admin/owner role
    const isOwner = project.userId === userId;
    const membersWithRole = project.membersWithRole as Record<string, string> || {};
    const isAdminOrOwner = isOwner || membersWithRole[userId] === "admin" || membersWithRole[userId] === "owner";
    
    if (!isAdminOrOwner) {
      throw new Error("Access denied: You don't have permission to create features for this project");
    }
    
    const featureIds = [];
    
    for (const feature of features) {
      const featureId = await db.insert("features", {
        projectId,
        title: feature.title,
        description: feature.description,
        priority: feature.priority,
        effort: feature.effort,
        category: feature.category,
        userId: userId,
        addedToTask: false
      });
      
      featureIds.push(featureId);
    }
    
    return featureIds;
  }
});

// Mutation: Update a feature
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
    implementationDetails: v.optional(v.string()),
    aiPrompt: v.optional(v.string())
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Get the feature
    const feature = await db.get(args.featureId);
    if (!feature) {
      throw new Error("Feature not found");
    }
    
    // Check if user has access to the project this feature belongs to
    const project = await db.get(feature.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check if user is the owner or a member with admin/owner role
    const isOwner = project.userId === userId;
    const membersWithRole = project.membersWithRole as Record<string, string> || {};
    const isAdminOrOwner = isOwner || membersWithRole[userId] === "admin" || membersWithRole[userId] === "owner";
    
    if (!isAdminOrOwner) {
      throw new Error("Access denied: You don't have permission to update features for this project");
    }
    
    // Update the feature
    return await db.patch(args.featureId, {
      title: args.title,
      description: args.description,
      priority: args.priority,
      effort: args.effort,
      category: args.category
    });
  }
});

// Mutation: Delete a feature
export const deleteFeature = mutation({
  args: { featureId: v.id("features") },
  handler: async ({ db, auth }, { featureId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Get the feature
    const feature = await db.get(featureId);
    if (!feature) {
      throw new Error("Feature not found");
    }
    
    // Check if user has access to the project this feature belongs to
    const project = await db.get(feature.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check if user is the owner or a member with admin/owner role
    const isOwner = project.userId === userId;
    const membersWithRole = project.membersWithRole as Record<string, string> || {};
    const isAdminOrOwner = isOwner || membersWithRole[userId] === "admin" || membersWithRole[userId] === "owner";
    
    if (!isAdminOrOwner) {
      throw new Error("Access denied: You don't have permission to update features for this project");
    }
    
    // Delete the feature
    await db.delete(featureId);
    return true;
  }
});
