import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Query: List all projects
export const listProjects = query(async ({ db }) => {
  return await db.query("projects").collect();
});

// Query: Get all projects for the current user
export const getUserProjects = query({
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const userId = identity.subject;
    
    return await db.query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Query: Get projects by status
export const getProjectsByStatuses = query({
  args: { statuses: v.array(v.string()) },
  handler: async ({ db, auth }, { statuses }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    const userId = identity.subject;

    return await db.query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter((q) => q.or(...statuses.map(status => q.eq(q.field("status"), status))))
      .collect();
  },
});

// Query: Get single project by ID
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async ({ db }, { projectId }) => {
    return await db.get(projectId);
  }
});

// Mutation: Create new project (initial empty project)
export const createProject = mutation({
  handler: async ({ db, auth }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    return await db.insert("projects", {
      name: "", // Empty initially, will be filled in step 1
      description: "", // Empty initially, will be filled in step 2
      status: "draft",
      category: "Other",
      platform: "Web",
      contextAnswers: {}, // Empty object as per schema
      currentStep: 1, // Start at step 1
      lastEditedStep: 1,
      totalSteps: 6, // 6 steps in project creation
      userId: userId,
      questionsGenerated: false,
      questionsAnswered: false,
      canProceedFromContext: false,
      lastDraftSave: Date.now()
    });
  }
});

export const setCurrentStep = mutation({
  args: {
    projectId: v.id("projects"),
    currentStep: v.number(),
  },
  handler: async ({ db, auth }, { projectId, currentStep }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const project = await db.get(projectId);
    if (!project) throw new Error("Project not found");
    if (project.userId !== identity.subject) throw new Error("Not authorized");

    await db.patch(projectId, { currentStep });
  }
});

// Mutation: Update project name (Step 1)
export const updateProjectName = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
  },
  handler: async ({ db, auth }, { projectId, name }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const project = await db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    if (project.userId !== identity.subject) {
      throw new Error("Not authorized");
    }
    
    await db.patch(projectId, {
      name,
      currentStep: 2,
      lastEditedStep: 2,
      lastDraftSave: Date.now()
    });
    
    return projectId;
  }
});

// Mutation: Update project description (Step 2)
export const updateProjectDescription = mutation({
  args: {
    projectId: v.id("projects"),
    description: v.string(),
    techStack: v.optional(v.string()),
  },
  handler: async ({ db, auth }, { projectId, description, techStack }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const project = await db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    if (project.userId !== identity.subject) {
      throw new Error("Not authorized");
    }
    
    const updateData: any = {
      description,
      currentStep: 3,
      lastEditedStep: 3,
      lastDraftSave: Date.now()
    };
    
    // Add techStack if provided
    if (techStack) {
      updateData.techStack = { name: techStack };
    }
    
    await db.patch(projectId, updateData);
    
    return projectId;
  }
});

// Mutation: Generate project questions (Step 3)
export const generateProjectQuestions = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async ({ db, auth }, { projectId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const project = await db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    if (project.userId !== identity.subject) {
      throw new Error("Not authorized");
    }
    
    // Check if questions have already been generated for this project
    const existingQuestions = await db
      .query("projectQuestions")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();
    
    // If questions already exist, don't generate new ones
    if (existingQuestions.length > 0) {
      console.log(`Questions already exist for project ${projectId}. Skipping generation.`);
      return projectId;
    }
    
    // Generate 5 questions based on project description
    // In a real app, this might call an AI service
    const questions = [
      {
        question: "What is the target audience for this project?",
        section: "business",
        inputType: "textarea"
      },
      {
        question: "What problem does this project solve?",
        section: "business",
        inputType: "textarea"
      },
      {
        question: "What are the key features needed for MVP?",
        section: "technical",
        inputType: "textarea"
      },
      {
        question: "What is your timeline for this project?",
        section: "business",
        inputType: "text"
      },
      {
        question: "What technologies would you prefer to use?",
        section: "technical",
        inputType: "textarea"
      }
    ];
    
    // Store questions in projectQuestions table
    for (let i = 0; i < questions.length; i++) {
      await db.insert("projectQuestions", {
        projectId,
        section: questions[i].section as any,
        questionText: questions[i].question,
        inputType: questions[i].inputType as any,
        orderIndex: i,
        isRequired: true
      });
    }
    
    // Update project
    await db.patch(projectId, {
      questionsGenerated: true,
      currentStep: 3,
      lastEditedStep: 3,
      lastDraftSave: Date.now()
    });
    
    return projectId;
  }
});

// Query: Get project questions
export const getProjectQuestions = query({
  args: { projectId: v.id("projects") },
  handler: async ({ db, auth }, { projectId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    
    return await db.query("projectQuestions")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();
  }
});

// Mutation: Save question answers (Step 3)
export const saveQuestionAnswers = mutation({
  args: {
    projectId: v.id("projects"),
    answers: v.array(
      v.object({
        questionId: v.id("projectQuestions"),
        answer: v.string()
      })
    )
  },
  handler: async ({ db, auth }, { projectId, answers }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const project = await db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    if (project.userId !== identity.subject) {
      throw new Error("Not authorized");
    }
    
    // Save each answer
    for (const answer of answers) {
      // Check if answer already exists
      const existingAnswer = await db.query("projectAnswers")
        .withIndex("by_project_question", (q) => 
          q.eq("projectId", projectId).eq("questionId", answer.questionId)
        )
        .first();
      
      if (existingAnswer) {
        // Update existing answer
        await db.patch(existingAnswer._id, {
          answerText: answer.answer
        });
      } else {
        // Create new answer
        await db.insert("projectAnswers", {
          projectId,
          questionId: answer.questionId,
          answerText: answer.answer
        });
      }
    }
    
    // Update project
    await db.patch(projectId, {
      questionsAnswered: true,
      currentStep: 4,
      lastEditedStep: 4,
      lastDraftSave: Date.now()
    });
    
    return projectId;
  }
});

// Query: Get project answers
export const getProjectAnswers = query({
  args: { projectId: v.id("projects") },
  handler: async ({ db, auth }, { projectId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    
    return await db.query("projectAnswers")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();
  }
});

// Mutation: Generate project context and features (Step 4)
export const generateProjectContext = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async ({ db, auth }, { projectId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const project = await db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    if (project.userId !== identity.subject) {
      throw new Error("Not authorized");
    }
    
    // In a real app, this would call an AI service to generate features
    // based on project description and question answers
    const features = [
      {
        title: "User Authentication",
        description: "Allow users to sign up, log in, and manage their accounts",
        priority: "High",
        effort: "Medium",
        category: "Core"
      },
      {
        title: "Project Dashboard",
        description: "Main interface for users to view and manage their projects",
        priority: "High",
        effort: "Medium",
        category: "Core"
      },
      {
        title: "Task Management",
        description: "Create, edit, and organize tasks within projects",
        priority: "Medium",
        effort: "Medium",
        category: "Core"
      }
    ];
    
    // Store features
    for (const feature of features) {
      await db.insert("features", {
        projectId,
        title: feature.title,
        description: feature.description,
        priority: feature.priority as any,
        effort: feature.effort as any,
        category: feature.category as any,
        addedToTask: false
      });
    }
    
    // Update project to move to step 5 (Prompts)
    await db.patch(projectId, {
      currentStep: 5,
      lastEditedStep: 5,
      lastDraftSave: Date.now()
    });
    
    return projectId;
  }
});

// Query: Get project features
export const getProjectFeatures = query({
  args: { projectId: v.id("projects") },
  handler: async ({ db, auth }, { projectId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    
    return await db.query("features")
      .withIndex("by_projectId", (q) => q.eq("projectId", projectId))
      .collect();
  }
});

// Mutation: Generate project summary (Step 5)
export const generateProjectSummary = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async ({ db, auth }, { projectId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const project = await db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    if (project.userId !== identity.subject) {
      throw new Error("Not authorized");
    }
    
    // In a real app, this would generate a summary based on all project data
    const summary = `Project ${project.name} aims to ${project.description}. It includes key features such as user authentication, project dashboard, and task management.`;
    
    // Update project with summary and change status to active
    await db.patch(projectId, {
      summary,
      status: "active",
      currentStep: 6,
      lastEditedStep: 6,
      lastDraftSave: Date.now()
    });
    
    return projectId;
  }
});

// Mutation: Update (patch) a project
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    contextAnswers: v.optional(v.object({})),
    memberIds: v.optional(v.array(v.string())),
  },
  handler: async ({ db, auth }, { projectId, ...updates }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const project = await db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    if (project.userId !== identity.subject) {
      throw new Error("Not authorized");
    }
    
    // Remove undefined updates
    Object.keys(updates).forEach(
      key => updates[key as keyof typeof updates] === undefined && delete updates[key as keyof typeof updates]
    );
    
    await db.patch(projectId, {
      ...updates,
      lastDraftSave: Date.now()
    });
    
    return projectId;
  }
});

// Mutation: Delete a project
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async ({ db, auth }, { projectId }) => {
    const identity = await auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const project = await db.get(projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    
    if (project.userId !== identity.subject) {
      throw new Error("Not authorized");
    }
    
    await db.delete(projectId);
    return projectId;
  }
});
