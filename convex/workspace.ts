import { query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Query to get all members with their roles across all projects
export const getAllMembersWithRoles = query({
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    
    const userId = identity.subject;
    
    // Get projects where the current user is either the owner or a member
    const ownedProjects = await db.query("projects")
      .filter(q => q.eq(q.field("userId"), userId))
      .collect();
    
    const sharedProjects = await db.query("projects")
      .collect()
      .then(projects => {
        return projects.filter(project => {
          const membersWithRole = project.membersWithRole as Record<string, string> || {};
          return membersWithRole[userId] !== undefined;
        });
      });
    
    // Combine owned and shared projects
    const userProjects = [...ownedProjects, ...sharedProjects];
    
    // Create a map to store unique members with their roles across projects
    const membersMap: Record<string, {
      userId: string,
      roles: Record<string, string>, // projectId -> role
      projects: Record<string, { id: Id<"projects">, name: string }>
    }> = {};
    
    // Initialize current user entry
    membersMap[userId] = {
      userId,
      roles: {},
      projects: {}
    };
    
    // Process each project to extract members
    for (const project of userProjects) {
      // Add the owner if it's the current user
      if (project.userId === userId) {
        // Set owner role for this project
        membersMap[userId].roles[project._id.toString()] = "owner";
        membersMap[userId].projects[project._id.toString()] = {
          id: project._id,
          name: project.name
        };
      }
      
      // Process other members - only add the current user
      const membersWithRole = project.membersWithRole as Record<string, string> || {};
      
      if (membersWithRole[userId]) {
        // Set role for this project
        membersMap[userId].roles[project._id.toString()] = membersWithRole[userId];
        membersMap[userId].projects[project._id.toString()] = {
          id: project._id,
          name: project.name
        };
      }
    }
    
    // Convert map to array
    const members = Object.values(membersMap);
    
    // Get user profiles for all members
    const userIds = members.map(member => member.userId);
    const userProfiles = await db
      .query("userProfiles")
      .filter(q => q.or(...userIds.map(id => q.eq(q.field("userId"), id))))
      .collect();
    
    // Create a map of userId to profile
    const profileMap: Record<string, any> = {};
    userProfiles.forEach(profile => {
      profileMap[profile.userId] = profile;
    });
    
    // Combine member data with profiles
    const membersWithProfiles = members.map(member => ({
      ...member,
      profile: profileMap[member.userId] || null
    }));
    
    return membersWithProfiles;
  }
});

// Query to get members of a specific project
export const getProjectMembers = query({
  args: { projectId: v.id("projects") },
  handler: async ({ db, auth }, { projectId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    
    // Get the project
    const project = await db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    // Create array to store members
    const members = [];
    
    // Add the owner
    members.push({
      userId: project.userId,
      role: "owner",
      projectId: project._id
    });
    
    // Add other members
    const membersWithRole = project.membersWithRole as Record<string, string> || {};
    for (const [userId, role] of Object.entries(membersWithRole)) {
      members.push({
        userId,
        role,
        projectId: project._id
      });
    }
    
    // Get user profiles for all members
    const userIds = members.map(member => member.userId);
    const userProfiles = await db
      .query("userProfiles")
      .filter(q => q.or(...userIds.map(id => q.eq(q.field("userId"), id))))
      .collect();
    
    // Create a map of userId to profile
    const profileMap: Record<string, any> = {};
    userProfiles.forEach(profile => {
      profileMap[profile.userId] = profile;
    });
    
    // Combine member data with profiles
    const membersWithProfiles = members.map(member => ({
      ...member,
      profile: profileMap[member.userId] || null
    }));
    
    return membersWithProfiles;
  }
});
