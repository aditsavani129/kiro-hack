// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define custom types/enums
const taskStatusEnum = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("blocked")
);

const storyTypeEnum = v.union(
  v.literal("end_user"),
  v.literal("technical"),
  v.literal("epic")
);

const storyPriorityEnum = v.union(
  v.literal("Low"),
  v.literal("Medium"),
  v.literal("High"),
  v.literal("Critical")
);

const projectStatusEnum = v.union(
  v.literal("draft"),
  v.literal("active"),
  v.literal("completed"),
  v.literal("archived")
);

const questionSectionTypeEnum = v.union(
  v.literal("general"),
  v.literal("technical"),
  v.literal("business"),
  v.literal("user_experience")
);

const questionInputTypeEnum = v.union(
  v.literal("text"),
  v.literal("textarea"),
  v.literal("select"),
  v.literal("multiselect"),
  v.literal("radio"),
  v.literal("checkbox")
);

const memberRoleEnum = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("member"),
  v.literal("viewer")
);

const featurePriorityEnum = v.union(
  v.literal("Low"),
  v.literal("Medium"),
  v.literal("High"),
  v.literal("Critical")
);

const featureEffortEnum = v.union(
  v.literal("Small"),
  v.literal("Medium"),
  v.literal("Large"),
  v.literal("XL")
);

const featureCategoryEnum = v.union(
  v.literal("Core"),
  v.literal("Enhancement"),
  v.literal("Integration"),
  v.literal("UI/UX"),
  v.literal("Performance"),
  v.literal("Security")
);

const subscriptionPlanEnum = v.union(
  v.literal("free"),
  v.literal("basic"),
  v.literal("pro"),
  v.literal("enterprise")
);

export default defineSchema({
  // Prompts Table
  prompts: defineTable({
    projectId: v.id("projects"),
    featureId: v.optional(v.id("features")),
    content: v.string(), // The generated prompt content
    type: v.string(), // 'project' or 'feature'
    createdAt: v.number(), // Timestamp
    userId: v.string(), // User who generated the prompt
  })
    .index("by_projectId", ["projectId"])
    .index("by_featureId", ["featureId"])
    .index("by_userId", ["userId"]),
    
  // Chat Messages Table
  chatMessages: defineTable({
    projectId: v.id("projects"),
    userId: v.string(), // User who sent the message
    content: v.string(), // Message content
    timestamp: v.number(), // When the message was sent
    userName: v.optional(v.string()), // Name of the user who sent the message
    userImageUrl: v.optional(v.string()), // Profile image URL of the user
  })
    .index("by_projectId", ["projectId"])
    .index("by_projectId_timestamp", ["projectId", "timestamp"]),

  // User Plans Table
  userPlans: defineTable({
    userId: v.string(), // Reference to auth user - stored as string in Convex
    planType: v.optional(subscriptionPlanEnum), // Default will be handled in mutations
    creditsRemaining: v.number(), // Default will be handled in mutations
    creditsUsed: v.number(), // Default will be handled in mutations
    planStartedAt: v.number(), // Timestamp
    planEndsAt: v.optional(v.number()), // Timestamp
    isActive: v.boolean(),
    cancelAtPeriodEnd: v.boolean(),
    currentPeriodEnd: v.optional(v.number()), // Timestamp
    teamSize: v.number(),
  })
    .index("by_userId", ["userId"]),

  // User Profiles Table
  userProfiles: defineTable({
    // Note: Convex generates IDs automatically, no need for manual UUID
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    company: v.optional(v.string()),
    timezone: v.string(), // Default will be handled in mutations
    stripeCustomerId: v.optional(v.string()),
    // Note: createdAt and updatedAt are handled automatically by Convex
    userId: v.string(), // Reference to auth user - stored as string in Convex
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),

  // Projects Table
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    platform: v.optional(v.string()),
    budget: v.optional(v.string()),
    timeline: v.optional(v.string()),
    contextAnswers: v.optional(v.object({})), // JSON object
    summary: v.optional(v.string()),
    userStories: v.optional(v.array(v.any())), // JSON array
    status: projectStatusEnum,
    currentStep: v.number(),
    lastEditedStep: v.number(),
    totalSteps: v.number(),
    lastDraftSave: v.optional(v.number()), // Timestamp
    userId: v.string(),
    membersWithRole: v.optional(v.record(v.string(), v.string())), // Map of userId to role
    questionsGenerated: v.boolean(),
    selectedKit: v.optional(v.string()),
    techStack: v.optional(v.object({})), // JSON object
    questionsAnswered: v.boolean(),
    canProceedFromContext: v.boolean(),
    workspaceId: v.optional(v.id("workspaces")), // If you have workspaces table
    promptsGenerated: v.optional(v.boolean()), // Whether prompts have been generated
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_workspaceId", ["workspaceId"]),

  // Features Table
  features: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    priority: featurePriorityEnum,
    effort: featureEffortEnum,
    category: featureCategoryEnum,
    userId: v.optional(v.string()),
    addedToTask: v.boolean(),
    implementationDetails: v.optional(v.string()),
  })
    .index("by_projectId", ["projectId"])
    .index("by_userId", ["userId"])
    .index("by_priority", ["priority"]),

  // Tasks Table
  tasks: defineTable({
    projectId: v.id("projects"),
    featureId: v.optional(v.id("features")), // Made optional to support manual task creation
    title: v.string(),
    description: v.optional(v.string()),
    status: taskStatusEnum,
    position: v.number(),
    priority: v.optional(v.string()),
    effort: v.optional(v.string()),
    category: v.optional(v.string()),
    dueDate: v.optional(v.number()), // Timestamp for the task due date
    assignedTo: v.optional(v.string()), // User ID of the assigned project member
    notes: v.optional(v.string()), // Notes for the task
  })
    .index("by_projectId", ["projectId"])
    .index("by_featureId", ["featureId"])
    .index("by_status", ["status"])
    .index("by_position", ["position"])
    .index("by_dueDate", ["dueDate"])
    .index("by_assignedTo", ["assignedTo"]),

  // Stories Table
  stories: defineTable({
    projectId: v.optional(v.id("projects")),
    featureId: v.optional(v.id("features")),
    title: v.string(),
    storyType: storyTypeEnum,
    asA: v.string(),
    iWant: v.string(),
    soThat: v.string(),
    priority: storyPriorityEnum,
    storyPoints: v.number(),
    acceptanceCriteria: v.optional(v.array(v.any())), // JSON array
    testCases: v.optional(v.array(v.any())), // JSON array
    userId: v.optional(v.string()),
  })
    .index("by_projectId", ["projectId"])
    .index("by_featureId", ["featureId"])
    .index("by_userId", ["userId"])
    .index("by_priority", ["priority"]),

  // Project Questions Table
  projectQuestions: defineTable({
    projectId: v.id("projects"),
    section: questionSectionTypeEnum,
    questionText: v.string(),
    placeholderText: v.optional(v.string()),
    inputType: questionInputTypeEnum,
    options: v.optional(v.array(v.any())), // JSON array
    orderIndex: v.number(),
    isRequired: v.boolean(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_section", ["section"])
    .index("by_orderIndex", ["orderIndex"]),

  // Project Answers Table
  projectAnswers: defineTable({
    projectId: v.id("projects"),
    questionId: v.id("projectQuestions"),
    answerText: v.optional(v.string()),
  })
    .index("by_projectId", ["projectId"])
    .index("by_questionId", ["questionId"])
    .index("by_project_question", ["projectId", "questionId"]), // Unique constraint equivalent

  // Members with Role Table
  membersWithRole: defineTable({
    userId: v.string(),
    projectId: v.id("projects"),
    taskId: v.optional(v.id("tasks")),
    role: memberRoleEnum,
    permissions: v.optional(v.object({})), // JSON object
  })
    .index("by_userId", ["userId"])
    .index("by_projectId", ["projectId"])
    .index("by_taskId", ["taskId"])
    .index("by_project_user", ["projectId", "userId"]), // Unique constraint equivalent
});

// Additional helper types for your application
export type TaskStatus = typeof taskStatusEnum.type;
export type StoryType = typeof storyTypeEnum.type;
export type StoryPriority = typeof storyPriorityEnum.type;
export type ProjectStatus = typeof projectStatusEnum.type;
export type QuestionSectionType = typeof questionSectionTypeEnum.type;
export type QuestionInputType = typeof questionInputTypeEnum.type;
export type MemberRole = typeof memberRoleEnum.type;
export type FeaturePriority = typeof featurePriorityEnum.type;
export type FeatureEffort = typeof featureEffortEnum.type;
export type FeatureCategory = typeof featureCategoryEnum.type;
export type SubscriptionPlan = typeof subscriptionPlanEnum.type;