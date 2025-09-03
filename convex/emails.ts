import { action } from "./_generated/server";
import { v } from "convex/values";
import { sendProjectInvitationEmail, sendRoleUpdateEmail as sendRoleUpdateEmailUtil, sendRemovalEmail as sendRemovalEmailUtil } from "../lib/email";

// Send project invitation email action
export const sendInvitationEmail = action({
  args: {
    to: v.string(),
    projectName: v.string(),
    inviterName: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    return await sendProjectInvitationEmail({
      to: args.to,
      projectName: args.projectName,
      inviterName: args.inviterName,
      role: args.role,
    });
  },
});

// Send role update email action
export const sendRoleUpdateEmail = action({
  args: {
    to: v.string(),
    projectName: v.string(),
    updaterName: v.string(),
    newRole: v.string(),
  },
  handler: async (ctx, args) => {
    return await sendRoleUpdateEmailUtil({
      to: args.to,
      projectName: args.projectName,
      updaterName: args.updaterName,
      newRole: args.newRole,
    });
  },
});

// Send removal notification email action
export const sendRemovalEmail = action({
  args: {
    to: v.string(),
    projectName: v.string(),
    removerName: v.string(),
  },
  handler: async (ctx, args) => {
    return await sendRemovalEmailUtil({
      to: args.to,
      projectName: args.projectName,
      removerName: args.removerName,
    });
  },
});
