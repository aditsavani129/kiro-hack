// types/project.ts
import { Id } from '@/convex/_generated/dataModel';

// Project related types
export interface Project {
  _id: Id<"projects">;
  _creationTime: number;
  name: string;
  description?: string;
  category?: string;
  platform?: string;
  budget?: string;
  timeline?: string;
  contextAnswers?: Record<string, string>;
  summary?: string;
  userStories?: any[];
  status: "draft" | "active" | "completed" | "archived";
  currentStep: number;
  lastEditedStep: number;
  totalSteps: number;
  lastDraftSave?: number;
  userId: string;
  membersWithRole?: Record<string, string>;
  questionsGenerated: boolean;
  selectedKit?: string;
  techStack?: Record<string, any>;
  questionsAnswered: boolean;
  canProceedFromContext: boolean;
  coverImage?: string;
  tags?: string[];
  isTemplate?: boolean;
  templateCategory?: string;
}

export interface Feature {
  _id?: Id<"features">;
  _creationTime?: number;
  projectId: Id<"projects">;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  effort: "Small" | "Medium" | "Large" | "XL";
  category: "Core" | "Enhancement" | "Integration" | "UI/UX" | "Performance" | "Security";
  userId?: string;
  addedToTask: boolean;
  estimatedHours?: number;
  actualHours?: number;
  assignedTo?: string;
  dueDate?: number;
  completedAt?: number;
  dependencies?: Id<"features">[];
  tags?: string[];
  acceptanceCriteria?: string[];
  technicalNotes?: string;
}

export interface Task {
  _id?: Id<"tasks">;
  _creationTime?: number;
  projectId: Id<"projects">;
  featureId?: Id<"features">;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "completed" | "blocked";
  position: number;
  priority?: string;
  effort?: string;
  category?: string;
  assignedTo?: string;
  dueDate?: number;
  createdBy?: string;
  estimatedHours?: number;
  actualHours?: number;
  completedAt?: number;
  parentTaskId?: Id<"tasks">;
  tags?: string[];
  attachments?: string[];
}

export interface Story {
  _id?: Id<"stories">;
  _creationTime?: number;
  projectId?: Id<"projects">;
  featureId?: Id<"features">;
  title: string;
  storyType: "end_user" | "technical" | "epic";
  asA: string;
  iWant: string;
  soThat: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  storyPoints: number;
  acceptanceCriteria?: any[];
  testCases?: any[];
  userId?: string;
  status?: "backlog" | "ready" | "in_progress" | "review" | "done";
  assignedTo?: string;
  sprint?: string;
  epicId?: Id<"stories">;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
}

export interface ProjectQuestion {
  _id?: Id<"projectQuestions">;
  _creationTime?: number;
  projectId: Id<"projects">;
  section: "general" | "technical" | "business" | "user_experience";
  questionText: string;
  placeholderText?: string;
  inputType: "text" | "textarea" | "select" | "multiselect" | "radio" | "checkbox";
  options?: any[];
  orderIndex: number;
  isRequired: boolean;
  helpText?: string;
  validationRules?: Record<string, any>;
  conditionalLogic?: Record<string, any>;
}

export interface ProjectAnswer {
  _id?: Id<"projectAnswers">;
  _creationTime?: number;
  projectId: Id<"projects">;
  questionId: Id<"projectQuestions">;
  answerText?: string;
  answerData?: Record<string, any>;
  answeredBy?: string;
  answeredAt?: number;
}

export interface UserProfile {
  _id?: Id<"userProfiles">;
  _creationTime?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  timezone: string;
  stripeCustomerId?: string;
  userId: string;
}

export interface MemberWithRole {
  _id?: Id<"membersWithRole">;
  _creationTime?: number;
  userId: string;
  projectId: Id<"projects">;
  taskId?: Id<"tasks">;
  role: "owner" | "admin" | "member" | "viewer";
  permissions?: Record<string, any>;
  invitedBy?: string;
  invitedAt?: number;
  joinedAt?: number;
  lastActive?: number;
}





// OpenAI related types
export interface GeneratedQuestion {
  question: string;
  type: "text" | "textarea" | "select" | "multiselect" | "radio" | "checkbox";
  section: "general" | "technical" | "business" | "user_experience";
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface GeneratedFeature {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  effort: "Small" | "Medium" | "Large" | "XL";
  category: "Core" | "Enhancement" | "Integration" | "UI/UX" | "Performance" | "Security";
  acceptanceCriteria?: string[];
  technicalNotes?: string;
}

export interface GeneratedStory {
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  storyType: "end_user" | "technical" | "epic";
  priority: "Low" | "Medium" | "High" | "Critical";
  storyPoints: number;
  acceptanceCriteria?: string[];
}

export interface GeneratedTask {
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed" | "blocked";
  priority: "Low" | "Medium" | "High" | "Critical";
  effort: "Small" | "Medium" | "Large" | "XL";
  category: string;
  estimatedHours?: number;
  dependencies?: string[];
}

// UI State types
export interface ProjectCreationState {
  currentStep: number;
  projectName: string;
  projectDescription: string;
  generatedQuestions: GeneratedQuestion[];
  answers: Record<string, string>;
  generatedFeatures: GeneratedFeature[];
  isGeneratingQuestions: boolean;
  isGeneratingFeatures: boolean;
  isSaving: boolean;
}

export interface ProjectListState {
  projects: Project[];
  isLoading: boolean;
  isCreating: boolean;
  searchQuery: string;
  filterStatus: string;
  sortBy: string;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form types
export interface ProjectFormData {
  name: string;
  description: string;
  category?: string;
  platform?: string;
  budget?: string;
  timeline?: string;
  tags?: string[];
}

export interface FeatureFormData {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  effort: "Small" | "Medium" | "Large" | "XL";
  category: "Core" | "Enhancement" | "Integration" | "UI/UX" | "Performance" | "Security";
  assignedTo?: string;
  dueDate?: Date;
  tags?: string[];
  acceptanceCriteria?: string[];
  technicalNotes?: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  effort: "Small" | "Medium" | "Large" | "XL";
  category: string;
  assignedTo?: string;
  dueDate?: Date;
  estimatedHours?: number;
  tags?: string[];
}

// Utility types
export type ProjectStepType = 1 | 2 | 3 | 4 | 5 | 6;
export type ProjectStatusType = "draft" | "active" | "completed" | "archived";
export type PriorityType = "Low" | "Medium" | "High" | "Critical";
export type EffortType = "Small" | "Medium" | "Large" | "XL";
export type CategoryType = "Core" | "Enhancement" | "Integration" | "UI/UX" | "Performance" | "Security";

// Constants
export const PROJECT_STEPS = {
  NAME: 1,
  DESCRIPTION: 2,
  QUESTIONS: 3,
  FEATURES: 4,
  PROMPTS: 5,
  REVIEW: 6,
} as const;

export const PRIORITY_COLORS = {
  Low: "bg-green-100 text-green-800 border-green-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  High: "bg-orange-100 text-orange-800 border-orange-200",
  Critical: "bg-red-100 text-red-800 border-red-200",
} as const;

export const EFFORT_COLORS = {
  Small: "bg-gray-100 text-gray-800",
  Medium: "bg-indigo-100 text-indigo-800",
  Large: "bg-blue-100 text-blue-800",
  XL: "bg-purple-100 text-purple-800",
} as const;

export const STATUS_COLORS = {
  draft: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-800",
} as const;