import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Define the type for membersWithRole
type MembersWithRole = Record<string, string>;

// Query: Get projects where the current user is a member (not owner)
export const getSharedProjects = query({
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const userId = identity.subject;
    
    // Get all projects
    const allProjects = await db.query("projects").collect();
    
    // Filter projects where the user is a member but not the owner
    return allProjects.filter(project => {
      // Skip projects where the user is the owner
      if (project.userId === userId) {
        return false;
      }
      
      // Check if the user is in membersWithRole
      const membersWithRole = project.membersWithRole as MembersWithRole || {};
      return membersWithRole[userId] !== undefined;
    });
  },
});

// Mutation: Add a member to a project
export const addMemberToProject = mutation({
  args: {
    projectId: v.id("projects"),
    memberEmail: v.string(),
    role: v.string(),
  },
  handler: async (ctx, { projectId, memberEmail, role }) => {
    const { db, auth, scheduler } = ctx;
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
    
    // Only the owner or admins can add members
    if (project.userId !== userId) {
      const membersWithRole = project.membersWithRole as MembersWithRole || {};
      if (membersWithRole[userId] !== "admin" && membersWithRole[userId] !== "owner") {
        throw new Error("Not authorized to add members");
      }
    }
    
    // Find the user by email
    const users = await db.query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", memberEmail))
      .collect();
    
    if (users.length === 0) {
      throw new Error("User not found");
    }
    
    const memberUserId = users[0].userId;
    
    // Update the project's membersWithRole
    const membersWithRole = project.membersWithRole as MembersWithRole || {};
    membersWithRole[memberUserId] = role;
    
    await db.patch(projectId, { membersWithRole });
    
    // Send email notification
    try {
      // Get project name
      const projectName = project.name || "Untitled Project";
      
      // Get inviter's name
      const inviter = await db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .first();
      
      const inviterName = inviter ? 
        `${inviter.firstName || ""} ${inviter.lastName || ""}`?.trim() || "A user" : 
        "A user";
      
      // Schedule email notification asynchronously
      await scheduler.runAfter(0, api.emails.sendInvitationEmail, {
        to: memberEmail,
        projectName,
        inviterName,
        role,
      });
    } catch (error) {
      console.error("Failed to send invitation email:", error);
      // Continue with member addition even if email fails
    }
    
    return { success: true };
  },
});

// Mutation: Remove a member from a project
// Mutation: Update a member's role in a project
export const updateMemberRole = mutation({
  args: {
    projectId: v.id("projects"),
    memberUserId: v.string(),
    newRole: v.string(),
  },
  handler: async (ctx, { projectId, memberUserId, newRole }) => {
    const { db, auth, scheduler } = ctx;
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
    
    // Only the owner or admins can update member roles
    if (project.userId !== userId) {
      const membersWithRole = project.membersWithRole as MembersWithRole || {};
      if (membersWithRole[userId] !== "admin" && membersWithRole[userId] !== "owner") {
        throw new Error("Not authorized to update member roles");
      }
    }
    
    // Cannot change the owner's role
    if (project.userId === memberUserId) {
      throw new Error("Cannot change the owner's role");
    }
    
    // Get the member's profile to get their email
    const memberProfile = await db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", memberUserId))
      .first();
    
    if (!memberProfile) {
      throw new Error("Member profile not found");
    }
    
    const memberEmail = memberProfile.email;
    
    // Update the project's membersWithRole
    const membersWithRole = project.membersWithRole as MembersWithRole || {};
    membersWithRole[memberUserId] = newRole;
    
    await db.patch(projectId, { membersWithRole });
    
    // Send email notification if we have the member's email
    if (memberEmail) {
      try {
        // Get project name
        const projectName = project.name || "Untitled Project";
        
        // Get updater's name
        const updater = await db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .first();
        
        const updaterName = updater ? 
          `${updater.firstName || ""} ${updater.lastName || ""}`?.trim() || "A user" : 
          "A user";
        
        // Schedule email notification asynchronously
        await scheduler.runAfter(0, api.emails.sendRoleUpdateEmail, {
          to: memberEmail,
          projectName,
          updaterName,
          newRole,
        });
      } catch (error) {
        console.error("Failed to send role update email notification:", error);
        // Don't throw error, we still want to update the role even if email fails
      }
    }
    
    return { success: true };
  },
});

export const removeMemberFromProject = mutation({
  args: {
    projectId: v.id("projects"),
    memberUserId: v.string(),
  },
  handler: async (ctx, { projectId, memberUserId }) => {
    const { db, auth, scheduler } = ctx;
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
    
    // Only the owner or admins can remove members
    if (project.userId !== userId) {
      const membersWithRole = project.membersWithRole as MembersWithRole || {};
      if (membersWithRole[userId] !== "admin" && membersWithRole[userId] !== "owner") {
        throw new Error("Not authorized to remove members");
      }
    }
    
    // Cannot remove the owner
    if (project.userId === memberUserId) {
      throw new Error("Cannot remove the owner");
    }
    
    // Update the project's membersWithRole
    const membersWithRole = project.membersWithRole as MembersWithRole || {};
    
    // Get the member's email before removing them
    const memberProfile = await db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", memberUserId))
      .first();
    
    const memberEmail = memberProfile?.email;
    
    // Remove the member
    delete membersWithRole[memberUserId];
    await db.patch(projectId, { membersWithRole });
    
    // Send email notification if we have the member's email
    if (memberEmail) {
      try {
        // Get project name
        const projectName = project.name || "Untitled Project";
        
        // Get remover's name
        const remover = await db
          .query("userProfiles")
          .withIndex("by_userId", (q) => q.eq("userId", userId))
          .first();
        
        const removerName = remover ? 
          `${remover.firstName || ""} ${remover.lastName || ""}`?.trim() || "A user" : 
          "A user";
        
        // Schedule email notification asynchronously
        // Use the correct function reference from the API
        await scheduler.runAfter(0, api.emails.sendRemovalEmail, {
          to: memberEmail,
          projectName,
          removerName,
        });
      } catch (error) {
        console.error("Failed to send removal email notification:", error);
        // Don't throw error, we still want to remove the member even if email fails
      }
    }
    
    return { success: true };
  },
});
