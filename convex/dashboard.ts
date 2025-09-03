import { query } from "./_generated/server";
import { v } from "convex/values";

// Query: Get dashboard stats for a user
export const getDashboardStats = query({
  args: {
    userId: v.string(),
  },
  handler: async ({ db }, { userId }) => {
    // Get projects owned by the user
    const ownedProjects = await db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Get projects where user is a member (not owner)
    const memberProjects = await db
      .query("membersWithRole")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Get the actual project documents for member projects
    const memberProjectDocs = await Promise.all(
      memberProjects.map(async (m) => {
        return await db.get(m.projectId);
      })
    );

    // Filter out any null values (in case projects were deleted)
    const validMemberProjects = memberProjectDocs.filter(p => p !== null);
    
    // Combine owned and member projects
    const allProjects = [...ownedProjects, ...validMemberProjects];
    
    // Remove duplicates (in case user is both owner and member)
    const uniqueProjects = Array.from(
      new Map(allProjects.map(p => [p._id.toString(), p])).values()
    );

    // Get projects by status
    const projectsByStatus = {
      draft: uniqueProjects.filter((p) => p.status === "draft").length,
      active: uniqueProjects.filter((p) => p.status === "active").length,
      completed: uniqueProjects.filter((p) => p.status === "completed").length,
      archived: uniqueProjects.filter((p) => p.status === "archived").length,
    };

    // Get total projects count
    const totalProjects = uniqueProjects.length;
    const memberProjectsCount = validMemberProjects.length;

    // Get tasks for all user's projects
    const tasks = await db
      .query("tasks")
      .filter((q) => q.or(...uniqueProjects.map((p) => q.eq(q.field("projectId"), p._id))))
      .collect();

    // Get tasks by status
    const tasksByStatus = {
      todo: tasks.filter((t) => t.status === "todo").length,
      in_progress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      blocked: tasks.filter((t) => t.status === "blocked").length,
    };

    // Get recent projects (last 5)
    const recentProjects = [...uniqueProjects]
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 5);
      
    return {
      totalProjects,
      projectsByStatus,
      memberProjectsCount,
      tasksByStatus,
      totalTasks: tasks.length,
      recentProjects,
    };
  },
});

// Query: Get recent activities
export const getRecentActivities = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async ({ db }, { userId, limit = 10 }) => {
    // This is a simplified version since we don't have an activities table
    // In a real app, you'd have a dedicated activities/events table
    
    // Get projects owned by the user
    const ownedProjects = await db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
    
    // Get projects where user is a member
    const memberProjects = await db
      .query("membersWithRole")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    
    // Get the actual project documents for member projects
    const memberProjectDocs = await Promise.all(
      memberProjects.map(async (m) => {
        return await db.get(m.projectId);
      })
    );
    
    // Filter out any null values and take only the most recent ones
    const validMemberProjects = memberProjectDocs
      .filter(p => p !== null)
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, limit);
    
    // Combine all projects
    const allProjects = [...ownedProjects, ...validMemberProjects];
    
    // Remove duplicates
    const uniqueProjects = Array.from(
      new Map(allProjects.map(p => [p._id.toString(), p])).values()
    );
    
    // Get tasks for all user's projects
    const tasks = await db
      .query("tasks")
      .filter((q) => q.or(...uniqueProjects.map((p) => q.eq(q.field("projectId"), p._id))))
      .order("desc")
      .take(limit);
    
    // Get features for all user's projects
    const features = await db
      .query("features")
      .filter((q) => q.or(...uniqueProjects.map((p) => q.eq(q.field("projectId"), p._id))))
      .order("desc")
      .take(limit);
    
    // Combine and sort by creation time
    const activities = [
      ...uniqueProjects.map(p => ({
        type: "project_created",
        timestamp: p._creationTime,
        project: p,
        data: { name: p.name }
      })),
      ...tasks.map(t => ({
        type: "task_created",
        timestamp: t._creationTime,
        task: t,
        data: { title: t.title }
      })),
      ...features.map(f => ({
        type: "feature_created",
        timestamp: f._creationTime,
        feature: f,
        data: { title: f.title }
      }))
    ];
    
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
});

// Query: Get project stats by category
export const getProjectStatsByCategory = query({
  args: {
    userId: v.string(),
  },
  handler: async ({ db }, { userId }) => {
    // Get projects owned by the user
    const ownedProjects = await db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Get projects where user is a member
    const memberProjects = await db
      .query("membersWithRole")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Get the actual project documents for member projects
    const memberProjectDocs = await Promise.all(
      memberProjects.map(async (m) => {
        return await db.get(m.projectId);
      })
    );

    // Filter out any null values
    const validMemberProjects = memberProjectDocs.filter(p => p !== null);
    
    // Combine all projects
    const allProjects = [...ownedProjects, ...validMemberProjects];
    
    // Remove duplicates
    const uniqueProjects = Array.from(
      new Map(allProjects.map(p => [p._id.toString(), p])).values()
    );
    
    // Group by category
    const categories: Record<string, number> = {};
    
    for (const project of uniqueProjects) {
      const category = project.category || "Uncategorized";
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category]++;
    }
    
    return categories;
  }
});

// Query: Get feature stats by priority and effort
export const getFeatureStats = query({
  args: {
    userId: v.string(),
  },
  handler: async ({ db }, { userId }) => {
    // Get projects owned by the user
    const ownedProjects = await db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Get projects where user is a member
    const memberProjects = await db
      .query("membersWithRole")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    // Get the actual project documents for member projects
    const memberProjectDocs = await Promise.all(
      memberProjects.map(async (m) => {
        return await db.get(m.projectId);
      })
    );

    // Filter out any null values
    const validMemberProjects = memberProjectDocs.filter(p => p !== null);
    
    // Combine all projects
    const allProjects = [...ownedProjects, ...validMemberProjects];
    
    // Remove duplicates
    const uniqueProjects = Array.from(
      new Map(allProjects.map(p => [p._id.toString(), p])).values()
    );
    
    // Get features for these projects
    const features = await db
      .query("features")
      .filter((q) => q.or(...uniqueProjects.map((p) => q.eq(q.field("projectId"), p._id))))
      .collect();
    
    // Group by priority
    const byPriority: Record<string, number> = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0
    };
    
    // Group by effort
    const byEffort: Record<string, number> = {
      Small: 0,
      Medium: 0,
      Large: 0,
      XL: 0
    };
    
    // Group by category
    const byCategory: Record<string, number> = {};
    
    for (const feature of features) {
      // Priority
      if (feature.priority) {
        byPriority[feature.priority]++;
      }
      
      // Effort
      if (feature.effort) {
        byEffort[feature.effort]++;
      }
      
      // Category
      if (feature.category) {
        const category = feature.category;
        if (!byCategory[category]) {
          byCategory[category] = 0;
        }
        byCategory[category]++;
      }
    }
    
    return {
      byPriority,
      byEffort,
      byCategory
    };
  }
});
