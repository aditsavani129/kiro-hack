import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Send a new chat message
export const sendMessage = mutation({
  args: {
    projectId: v.id("projects"),
    content: v.string(),
    userId: v.string(),
    userName: v.optional(v.string()),
    userImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if project exists
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Create the message
    const messageId = await ctx.db.insert("chatMessages", {
      projectId: args.projectId,
      userId: args.userId,
      content: args.content,
      timestamp: Date.now(),
      userName: args.userName,
      userImageUrl: args.userImageUrl,
    });

    return messageId;
  },
});

// Get chat messages for a project
export const getProjectMessages = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50; // Default to 50 messages
    
    // Get messages for the project, ordered by timestamp (newest first)
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_projectId_timestamp", (q) => 
        q.eq("projectId", args.projectId)
      )
      .order("desc")
      .take(limit);
    
    // Return messages in reverse order (oldest first)
    return messages.reverse();
  },
});

// Delete a chat message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("chatMessages"),
    userId: v.string(), // User requesting the deletion
  },
  handler: async (ctx, args) => {
    // Get the message
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Check if the user is the message author
    if (message.userId !== args.userId) {
      throw new Error("You can only delete your own messages");
    }

    // Delete the message
    await ctx.db.delete(args.messageId);
    return { success: true };
  },
});
