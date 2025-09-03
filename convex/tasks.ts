import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Helper function to check if user has access to a project
async function checkProjectAccess(db: any, projectId: Id<"projects">, userId: string) {
  const project = await db.get(projectId);
  if (!project) {
    return { hasAccess: false, project: null, error: "Project not found" };
  }
  
  // Check if user is the owner or a member with any role
  const isOwner = project.userId === userId;
  const membersWithRole = project.membersWithRole as Record<string, string> || {};
  const isMember = isOwner || membersWithRole[userId] !== undefined;
  
  if (!isMember) {
    return { hasAccess: false, project, error: "Access denied" };
  }
  
  return { 
    hasAccess: true, 
    project, 
    isOwner,
    membersWithRole,
    role: isOwner ? "owner" : membersWithRole[userId]
  };
}

// Helper function to check if user has admin access to a project
async function checkProjectAdminAccess(db: any, projectId: Id<"projects">, userId: string) {
  const { hasAccess, project, isOwner, membersWithRole, error } = await checkProjectAccess(db, projectId, userId);
  
  if (!hasAccess) {
    return { hasAdminAccess: false, project, error };
  }
  
  // Check if user is the owner or has a specific role (admin or member)
  const userRole = membersWithRole ? membersWithRole[userId] : undefined;
  const isOwnerAdminOrMember = isOwner || 
    userRole === "admin" || 
    userRole === "member" || 
    userRole === "owner";
  
  if (!isOwnerAdminOrMember) {
    return { 
      hasAdminAccess: false, 
      project, 
      error: "Access denied: You don't have permission to modify tasks for this project" 
    };
  }
  
  return { hasAdminAccess: true, project };
}

// Query: Get tasks for a project
export const getProjectTasks = query({
  args: { projectId: v.id("projects") },
  handler: async ({ db, auth }, { projectId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    
    const userId = identity.subject;
    
    // Check if user has access to the project
    const { hasAccess } = await checkProjectAccess(db, projectId, userId);
    if (!hasAccess) {
      return [];
    }
    
    return await db
      .query("tasks")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();
  },
});

// Query: Get all tasks for the current user
export const getAllTasks = query({
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const userId = identity.subject;
    
    // Get all projects owned by the user
    const projects = await db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    
    // Get all tasks for those projects
    const projectIds = projects.map(project => project._id);
    
    // If no projects, return empty array
    if (projectIds.length === 0) {
      return [];
    }
    
    // Get all tasks for all projects
    const tasks = await db
      .query("tasks")
      .filter(q => q.or(...projectIds.map(id => q.eq(q.field("projectId"), id))))
      .collect();
    
    return tasks;
  },
});

// Query: Get tasks for a feature
export const getFeatureTasks = query({
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
    const { hasAccess, error } = await checkProjectAccess(db, feature.projectId, userId);
    if (!hasAccess) {
      throw new Error(error);
    }
    
    // Get all tasks for the feature
    return await db
      .query("tasks")
      .withIndex("by_featureId", (q) => q.eq("featureId", featureId))
      .collect();
  }
});

// Mutation: Add feature to task (create a new task from a feature)
export const addFeatureToTask = mutation({
  args: {
    featureId: v.id("features"),
    projectId: v.id("projects"),
    dueDate: v.optional(v.number()), // Optional timestamp for due date
    assignedTo: v.optional(v.string()) // Optional userId of assigned project member
  },
  handler: async ({ db, auth }, { featureId, projectId, dueDate, assignedTo }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Check if user has admin access to the project
    const { hasAdminAccess, error } = await checkProjectAdminAccess(db, projectId, userId);
    if (!hasAdminAccess) {
      throw new Error(error);
    }
    
    // Get the feature
    const feature = await db.get(featureId);
    if (!feature) {
      throw new Error("Feature not found");
    }
    
    // Check if feature already has a task
    if (feature.addedToTask) {
      throw new Error("Feature already added to a task");
    }
    
    // Get the highest position to place the new task at the end
    const tasks = await db
      .query("tasks")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();
    
    const highestPosition = tasks.length > 0
      ? Math.max(...tasks.map(task => task.position))
      : 0;
    
    // If assignedTo is provided, validate that the user is a project member
    if (assignedTo) {
      const project = await db.get(projectId);
      if (!project) {
        throw new Error("Project not found");
      }
      
      // Check if the assigned user is a member of the project
      const isOwner = project.userId === assignedTo;
      const membersWithRole = project.membersWithRole as Record<string, string> || {};
      const isMember = isOwner || membersWithRole[assignedTo] !== undefined;
      
      if (!isMember) {
        throw new Error("Assigned user is not a member of this project");
      }
    }
    
    // Create a new task from the feature
    const taskId = await db.insert("tasks", {
      projectId,
      featureId,
      title: feature.title,
      description: feature.description || "",
      status: "todo", // Default to todo status
      position: highestPosition + 1,
      priority: feature.priority,
      effort: feature.effort,
      category: feature.category,
      dueDate, // Include due date if provided
      assignedTo // Include assignedTo if provided
    });
    
    // Mark the feature as added to task
    await db.patch(featureId, {
      addedToTask: true
    });
    
    return taskId;
  }
});

// Mutation: Remove feature from task
export const removeFeatureFromTask = mutation({
  args: {
    featureId: v.id("features")
  },
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
    
    // Check if user has admin access to the project
    const { hasAdminAccess, error } = await checkProjectAdminAccess(db, feature.projectId, userId);
    if (!hasAdminAccess) {
      throw new Error(error);
    }
    
    // Find and delete the task associated with this feature
    const tasks = await db
      .query("tasks")
      .withIndex("by_featureId", (q) => q.eq("featureId", featureId))
      .collect();
    
    if (tasks.length > 0) {
      for (const task of tasks) {
        await db.delete(task._id);
      }
    }
    
    // Mark the feature as not added to task
    await db.patch(featureId, {
      addedToTask: false
    });
    
    return true;
  }
});

// Mutation: Update task status
export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    newStatus: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("blocked")
    ),
    newPosition: v.number()
  },
  handler: async ({ db, auth }, { taskId, newStatus, newPosition }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Get the task
    const task = await db.get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Check if user has admin access to the project
    const { hasAdminAccess, error } = await checkProjectAdminAccess(db, task.projectId, userId);
    if (!hasAdminAccess) {
      throw new Error(error);
    }
    
    // Update task status and position
    await db.patch(taskId, {
      status: newStatus,
      position: newPosition
    });
    
    // Reorder other tasks in the same status column
    const tasksInSameStatus = await db
      .query("tasks")
      .withIndex("by_projectId", (q) => q.eq("projectId", task.projectId))
      .filter((q) => q.eq(q.field("status"), newStatus))
      .collect();
    
    // Update positions of tasks that need to be shifted
    for (const otherTask of tasksInSameStatus) {
      if (otherTask._id !== taskId && otherTask.position >= newPosition) {
        await db.patch(otherTask._id, {
          position: otherTask.position + 1
        });
      }
    }
    
    return true;
  }
});

// Mutation: Update task position
export const updateTaskPosition = mutation({
  args: {
    taskId: v.id("tasks"),
    newPosition: v.number()
  },
  handler: async ({ db, auth }, { taskId, newPosition }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Get the task
    const task = await db.get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Check if user has admin access to the project
    const { hasAdminAccess, error } = await checkProjectAdminAccess(db, task.projectId, userId);
    if (!hasAdminAccess) {
      throw new Error(error);
    }
    
    // Update task position
    await db.patch(taskId, {
      position: newPosition
    });
    
    return true;
  }
});

// Mutation: Create a task manually
export const createTask = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: v.optional(v.string()),
    effort: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("blocked")
    ),
    dueDate: v.optional(v.number()),
    assignedTo: v.optional(v.string())
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Check if user has admin access to the project
    const { hasAdminAccess, error, project } = await checkProjectAdminAccess(db, args.projectId, userId);
    if (!hasAdminAccess) {
      throw new Error(error);
    }
    
    // If assignedTo is provided, verify that the assigned user is a member of the project
    if (args.assignedTo) {
      const membersWithRole = project.membersWithRole as Record<string, string> || {};
      const isProjectMember = args.assignedTo === project.userId || membersWithRole[args.assignedTo] !== undefined;
      
      if (!isProjectMember) {
        throw new Error("Can only assign tasks to project members");
      }
    }
    
    // Get the highest position to place the new task at the end
    const tasks = await db
      .query("tasks")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    const highestPosition = tasks.length > 0
      ? Math.max(...tasks.map(task => task.position))
      : 0;
    
    // Create a new task
    const taskId = await db.insert("tasks", {
      projectId: args.projectId,
      title: args.title,
      description: args.description || "",
      status: args.status || "todo",
      position: highestPosition + 1,
      priority: args.priority || "Medium",
      effort: args.effort || "Medium",
      category: args.category || "Core",
      dueDate: args.dueDate,
      assignedTo: args.assignedTo
    });
    
    return taskId;
  }
});

// Mutation: Update task assignment
export const updateTaskAssignment = mutation({
  args: {
    taskId: v.id("tasks"),
    assignedTo: v.optional(v.string())
  },
  handler: async ({ db, auth }, { taskId, assignedTo }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Get the task
    const task = await db.get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Check if user has admin access to the project
    const { hasAdminAccess, error, project } = await checkProjectAdminAccess(db, task.projectId, userId);
    if (!hasAdminAccess) {
      throw new Error(error);
    }
    
    // If assignedTo is provided, verify that the assigned user is a member of the project
    if (assignedTo) {
      const membersWithRole = project.membersWithRole as Record<string, string> || {};
      const isProjectMember = assignedTo === project.userId || membersWithRole[assignedTo] !== undefined;
      
      if (!isProjectMember) {
        throw new Error("Can only assign tasks to project members");
      }
    }
    
    // Update task assignment
    await db.patch(taskId, {
      assignedTo
    });
    
    return true;
  }
});

// Mutation: Update task notes
export const updateTaskNotes = mutation({
  args: {
    taskId: v.id("tasks"),
    notes: v.string()
  },
  handler: async ({ db, auth }, { taskId, notes }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Get the task
    const task = await db.get(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    
    // Check if user has access to the project
    const { hasAccess, error } = await checkProjectAccess(db, task.projectId, userId);
    if (!hasAccess) {
      throw new Error(error);
    }
    
    // Update task notes
    await db.patch(taskId, {
      notes
    });
    
    return true;
  }
});
