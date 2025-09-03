import { query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Query: Get project members for task assignment
export const getProjectMembers = query({
  args: { projectId: v.id("projects") },
  handler: async ({ db, auth }, { projectId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Get the project
    const project = await db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Check if user has access to the project
    const isOwner = project.userId === userId;
    const membersWithRole = project.membersWithRole as Record<string, string> || {};
    const isMember = isOwner || membersWithRole[userId] !== undefined;
    
    if (!isMember) {
      throw new Error("Not authorized to access this project");
    }
    
    // Get user profiles for all members
    const members = [];
    
    // Add the owner
    const ownerProfile = await db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", project.userId))
      .first();
    
    if (ownerProfile) {
      members.push({
        userId: project.userId,
        name: `${ownerProfile.firstName || ""} ${ownerProfile.lastName || ""}`.trim() || ownerProfile.email,
        email: ownerProfile.email,
        role: "owner"
      });
    }
    
    // Add all other members
    for (const [memberId, role] of Object.entries(membersWithRole)) {
      const memberProfile = await db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", memberId))
        .first();
      
      if (memberProfile) {
        members.push({
          userId: memberId,
          name: `${memberProfile.firstName || ""} ${memberProfile.lastName || ""}`.trim() || memberProfile.email,
          email: memberProfile.email,
          role: role
        });
      }
    }
    
    return members;
  }
});
