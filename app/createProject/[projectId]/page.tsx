"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Id } from "../../../convex/_generated/dataModel";
import {
  ArrowRight,
  ArrowDown,
  BarChart,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Code,
  Database,
  Download,
  FileText,
  GitBranch,
  Layout,
  Lightbulb,
  ListTodo,
  Loader2,
  MessageSquare,
  MinusCircle,
  Palette,
  PlusCircle,
  Server,
  Shield,
  Sparkles,
  Tag,
  Target,
  Users,
  Zap,
} from "lucide-react";

// Add custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(245, 158, 11, 0.3);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(245, 158, 11, 0.5);
  }
`;

export default function ProjectCreationPage() {
  // Add style tag for custom scrollbar
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = scrollbarStyles;
    document.head.appendChild(styleTag);
    
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);
  const { projectId } = useParams();
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  // Input states
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState<string>("");
  const [techStack, setTechStack] = useState<string>("");
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentFeatureId, setCurrentFeatureId] = useState<Id<"features"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState("");
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [isAddingFeature, setIsAddingFeature] = useState(false);
  const [isEditingFeature, setIsEditingFeature] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState<Id<"features"> | null>(null);
  const [featuresToGenerate, setFeaturesToGenerate] = useState(3);
  
  // Prompt generation states
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<Array<{
    type: 'project' | 'feature';
    content: string;
    featureId?: Id<"features">;
    createdAt: number;
  }>>([]);
  
  // Markdown export state
  const [isGeneratingMarkdown, setIsGeneratingMarkdown] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Manual feature creation states
  const [showManualFeatureForm, setShowManualFeatureForm] = useState(false);
  const [manualFeature, setManualFeature] = useState({
    title: "",
    description: "",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    effort: "Medium" as "Small" | "Medium" | "Large" | "XL",
    category: "Core" as "Core" | "Enhancement" | "Integration" | "UI/UX" | "Performance" | "Security",
    implementationDetails: ""
  });

  // Fetch data
  const project = useQuery(api.projects.getProject, {
    projectId: projectId as Id<"projects">,
  });
  // Fetch project members for assignment
  const projectMembers = useQuery(
    api.projectMembers.getProjectMembers,
    { projectId: projectId as Id<"projects"> }
  );
  const questions = useQuery(
    api.projects.getProjectQuestions,
    project?.questionsGenerated ? { projectId: projectId as Id<"projects"> } : "skip"
  );
  const answers = useQuery(
    api.projects.getProjectAnswers,
    project?.questionsAnswered ? { projectId: projectId as Id<"projects"> } : "skip"
  );
  const features = useQuery(api.features.getProjectFeatures,
    project && isSignedIn ? { projectId: projectId as Id<"projects"> } : "skip"
  );

  // Mutations
  const updateProjectName = useMutation(api.projects.updateProjectName);
  const updateProjectDescription = useMutation(api.projects.updateProjectDescription);
  const generateProjectQuestions = useMutation(api.projects.generateProjectQuestions);
  const saveQuestionAnswers = useMutation(api.projects.saveQuestionAnswers);
  const generateProjectContext = useMutation(api.projects.generateProjectContext);
  const generateProjectSummary = useMutation(api.projects.generateProjectSummary);
  const setCurrentStep = useMutation(api.projects.setCurrentStep);
  const createFeatures = useMutation(api.features.createFeatures);
  const deductCreditsForFeature = useMutation(api.userPlans.deductCreditsForFeature);
  const updateProject = useMutation(api.projects.updateProject);
  const savePrompt = useMutation(api.prompts.savePrompt);
  
  // Task management mutations
  const addFeatureToTask = useMutation(api.tasks.addFeatureToTask);
  const removeFeatureFromTask = useMutation(api.tasks.removeFeatureFromTask);

  // Initialize inputs on project load
  useEffect(() => {
    if (project) {
      setProjectName(project.name || "");
      setProjectDescription(project.description || "");
    }
  }, [project]);

  // Initialize answers on load
  useEffect(() => {
    if (answers && questions && answers.length > 0 && questions.length > 0) {
      const answerMap: Record<string, string> = {};
      answers.forEach((ans) => {
        if (ans.questionId && ans.answerText) {
          answerMap[ans.questionId] = ans.answerText;
        }
      });
      setQuestionAnswers(answerMap);
    }
  }, [answers, questions]);

  // Redirect if not signed in
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) router.push("/sign-in");
  }, [isSignedIn, isLoaded, router]);

  // Navigate to projects list
  const handleBackToList = () => {
    router.push("/createProject");
  };

  // Go to previous step
  const handlePreviousStep = async () => {
    if (!project || !project.currentStep || project.currentStep <= 1) return;
    try {
      setIsLoading(true);
      await setCurrentStep({
        projectId: projectId as Id<"projects">,
        currentStep: project.currentStep - 1,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle feature count change (clamp 1 to 3)
  const handleFeatureCountChange = (value: number) => {
    setFeaturesToGenerate(Math.min(Math.max(value, 1), 3));
  };

  // Handle manual feature input changes
  const handleManualFeatureChange = (field: string, value: any) => {
    setManualFeature(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle manual feature submission
  const handleManualFeatureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await createFeatures({
        projectId: projectId as Id<"projects">,
        features: [{
          title: manualFeature.title,
          description: manualFeature.description,
          priority: manualFeature.priority,
          effort: manualFeature.effort,
          category: manualFeature.category,
          implementationDetails: manualFeature.implementationDetails || "",
        }],
      });
      
      // Reset form
      setManualFeature({
        title: "",
        description: "",
        priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
        effort: "Medium" as "Small" | "Medium" | "Large" | "XL",
        category: "Core" as "Core" | "Enhancement" | "Integration" | "UI/UX" | "Performance" | "Security",
        implementationDetails: ""
      });
      
      // Hide form after successful submission
      setShowManualFeatureForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  // --- Step handlers ---

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await updateProjectName({
        projectId: projectId as Id<"projects">,
        name: projectName,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await updateProjectDescription({
        projectId: projectId as Id<"projects">,
        description: projectDescription,
        techStack: techStack || undefined,
      });
      await generateProjectQuestions({ projectId: projectId as Id<"projects"> });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formattedAnswers = Object.entries(questionAnswers).map(
        ([questionId, answer]) => ({
          questionId: questionId as Id<"projectQuestions">,
          answer,
        })
      );
      await saveQuestionAnswers({ projectId: projectId as Id<"projects">, answers: formattedAnswers });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleContextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Deduct credits for feature generation (5 credits per feature)
      try {
        await deductCreditsForFeature({ creditsToDeduct: 5 });
      } catch (creditError) {
        throw new Error(`Credit error: ${creditError instanceof Error ? creditError.message : String(creditError)}`);
      }
      
      // Prepare answers for AI prompt
      const formattedQA = (questions || []).map((q) => {
        const answer = (answers || []).find((a) => a.questionId === q._id);
        return { questionText: q.questionText, answer: answer?.answerText || "" };
      });

      // Get existing feature titles to prevent duplicates
      const existingFeatureTitles = (features || []).map(feature => feature.title);

      // Call OpenAI API with previous feature titles as context
      const res = await fetch("/api/ai/generate-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName,
          projectDescription,
          questionAnswers: formattedQA,
          previousFeatures: existingFeatureTitles,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate features");
      }

      const data = await res.json();

      // Save the single generated feature using Convex mutation
      type Feature = {
        _id: Id<"features">;
        title: string;
        description?: string;
        priority: "Low" | "Medium" | "High" | "Critical";
        effort: "Small" | "Medium" | "Large" | "XL";
        category: "Core" | "Enhancement" | "Integration" | "UI/UX" | "Performance" | "Security";
        projectId: Id<"projects">;
        userId?: string;
        addedToTask?: boolean;
        implementationDetails?: string;
      };

      await createFeatures({
        projectId: projectId as Id<"projects">,
        features: data.features.map((feature: any) => ({
          title: feature.title,
          description: feature.description || "",
          priority: feature.priority,
          effort: feature.effort,
          category: feature.category,
          implementationDetails: feature.implementationDetails || "",
        })),
      });

      await generateProjectContext({ projectId: projectId as Id<"projects"> });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await generateProjectSummary({ projectId: projectId as Id<"projects"> });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate Markdown content for features
  const generateFeaturesMarkdown = () => {
    if (!project || !features || features.length === 0) return "";
    
    const currentDate = new Date().toLocaleDateString();
    
    let markdown = `# ${project.name} - Project Features

`;
    markdown += `## Project Overview

${project.description || "No description provided."}

`;
    markdown += `*Generated on: ${currentDate}*

`;
    
    // Group features by category
    const categories: Record<string, typeof features> = {};
    features.forEach(feature => {
      if (!categories[feature.category]) {
        categories[feature.category] = [];
      }
      categories[feature.category].push(feature);
    });
    
    // Add features by category
    markdown += `## Features by Category

`;
    
    Object.entries(categories).forEach(([category, categoryFeatures]) => {
      markdown += `### ${category}

`;
      
      categoryFeatures.forEach((feature, index) => {
        markdown += `#### ${index + 1}. ${feature.title}

`;
        markdown += `- **Priority:** ${feature.priority}
`;
        markdown += `- **Effort:** ${feature.effort}
`;
        markdown += `- **Added to Task:** ${feature.addedToTask ? "Yes" : "No"}

`;
        
        markdown += `**Description:**  
${feature.description || "No description provided."}

`;
        
        if (feature.implementationDetails) {
          markdown += `**Implementation Details:**  
${feature.implementationDetails}

`;
        }
        
        markdown += `---

`;
      });
    });
    
    // Add summary statistics
    markdown += `## Summary Statistics

`;
    markdown += `- **Total Features:** ${features.length}
`;
    markdown += `- **Features Added to Tasks:** ${features.filter(f => f.addedToTask).length}
`;
    markdown += `- **Features by Priority:**
`;
    
    const priorityCounts: Record<string, number> = {};
    features.forEach(feature => {
      priorityCounts[feature.priority] = (priorityCounts[feature.priority] || 0) + 1;
    });
    
    Object.entries(priorityCounts).forEach(([priority, count]) => {
      markdown += `  - ${priority}: ${count}
`;
    });
    
    return markdown;
  };
  
  // Handle prompt generation
  const handleGeneratePrompt = async (type: 'project' | 'feature', featureId?: Id<"features">) => {
    setIsGeneratingPrompt(true);
    setError(null);
    try {
      // Prepare project data for the API
      const projectData = {
        projectName,
        projectDescription,
        features: features?.map(f => ({
          id: f._id,
          title: f.title,
          description: f.description || '',
          priority: f.priority,
          effort: f.effort,
          category: f.category
        })) || []
      };
      
      // Add feature-specific data if generating for a feature
      let featureData = undefined;
      if (type === 'feature' && featureId) {
        const feature = features?.find(f => f._id === featureId);
        if (feature) {
          featureData = {
            id: feature._id,
            title: feature.title,
            description: feature.description || '',
            priority: feature.priority,
            effort: feature.effort,
            category: feature.category
          };
        }
      }
      
      // Call the API to generate the prompt
      const res = await fetch("/api/ai/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          project: projectData,
          feature: featureData
        }),
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate prompt");
      }
      
      const data = await res.json();
      
      // Save the generated prompt to Convex
      await savePrompt({
        projectId: projectId as Id<"projects">,
        featureId: type === 'feature' ? featureId : undefined,
        content: data.prompt,
        type: type,
        createdAt: Date.now()
      });
      
      // Update local state with the new prompt
      setGeneratedPrompts(prev => [
        ...prev,
        {
          type,
          content: data.prompt,
          featureId: type === 'feature' ? featureId : undefined,
          createdAt: Date.now()
        }
      ]);
      
      // Mark the project as having prompts generated
      if (project && !project.promptsGenerated) {
        await updateProject({
          projectId: projectId as Id<"projects">
        });
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGeneratingPrompt(false);
    }
  };
  
  // Handle export to markdown
  const handleExportMarkdown = () => {
    setIsGeneratingMarkdown(true);
    try {
      const markdown = generateFeaturesMarkdown();
      if (!markdown) {
        throw new Error("Failed to generate markdown content");
      }
      
      // Create a blob from the markdown content
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link and trigger it
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.name || 'project'}-features.md`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGeneratingMarkdown(false);
    }
  };
  
  // Handle PDF documentation generation using OpenAI
  const handleGeneratePdfDocumentation = async () => {
    setIsGeneratingPdf(true);
    setError(null);
    try {
      // Prepare project data for the API
      const projectData = {
        projectName: project?.name || '',
        projectDescription: project?.description || '',
        techStack: project?.techStack ? (typeof project.techStack === 'object' ? (project.techStack as any).name : project.techStack) : '',
        features: features?.map(f => ({
          id: f._id,
          title: f.title,
          description: f.description || '',
          priority: f.priority,
          effort: f.effort,
          category: f.category,
          implementationDetails: f.implementationDetails || '',
        })) || [],
        summary: project?.summary || ''
      };
      
      // Call the API to generate PDF documentation
      const res = await fetch("/api/ai/generate-documentation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate PDF documentation");
      }
      
      const data = await res.json();
      
      // Create a blob from the PDF content
      const pdfBlob = new Blob([Buffer.from(data.pdfBase64, 'base64')], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Create a download link and trigger it
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `${project?.name || 'project'}-documentation.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(pdfUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Input change handlers for answers
  const handleAnswerChange = (questionId: string, value: string) => {
    setQuestionAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // Helper functions for feature styling
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "border-red-500 bg-red-900/30 text-red-300";
      case "Medium":
        return "border-yellow-500 bg-yellow-900/30 text-yellow-300";
      case "Low":
        return "border-blue-500 bg-blue-900/30 text-blue-300";
      default:
        return "border-gray-500 bg-gray-900/30 text-gray-300";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-600 border border-red-400";
      case "Medium":
        return "bg-yellow-600 border border-yellow-400";
      case "Low":
        return "bg-blue-600 border border-blue-400";
      default:
        return "bg-gray-600 border border-gray-400";
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case "High":
        return "border-purple-500 bg-purple-900/30 text-purple-300";
      case "Medium":
        return "border-indigo-500 bg-indigo-900/30 text-indigo-300";
      case "Low":
        return "border-green-500 bg-green-900/30 text-green-300";
      default:
        return "border-gray-500 bg-gray-900/30 text-gray-300";
    }
  };

  const getEffortBadgeColor = (effort: string) => {
    switch (effort) {
      case "High":
        return "bg-purple-800/60 text-purple-200 border border-purple-600";
      case "Medium":
        return "bg-indigo-800/60 text-indigo-200 border border-indigo-600";
      case "Low":
        return "bg-green-800/60 text-green-200 border border-green-600";
      default:
        return "bg-gray-800/60 text-gray-200 border border-gray-600";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "UI/UX":
        return "border-pink-500 bg-pink-900/30 text-pink-300";
      case "Backend":
        return "border-blue-500 bg-blue-900/30 text-blue-300";
      case "Frontend":
        return "border-purple-500 bg-purple-900/30 text-purple-300";
      case "Infrastructure":
        return "border-amber-500 bg-amber-900/30 text-amber-300";
      case "Security":
        return "border-red-500 bg-red-900/30 text-red-300";
      case "Performance":
        return "border-green-500 bg-green-900/30 text-green-300";
      case "Analytics":
        return "border-cyan-500 bg-cyan-900/30 text-cyan-300";
      default:
        return "border-gray-500 bg-gray-900/30 text-gray-300";
    }
  };
  
  const getCategoryNodeColor = (category: string) => {
    switch (category) {
      case "UI/UX":
        return "from-pink-800 to-pink-700";
      case "Backend":
        return "from-blue-800 to-blue-700";
      case "Frontend":
        return "from-purple-800 to-purple-700";
      case "Infrastructure":
        return "from-amber-800 to-amber-700";
      case "Security":
        return "from-red-800 to-red-700";
      case "Performance":
        return "from-green-800 to-green-700";
      case "Analytics":
        return "from-cyan-800 to-cyan-700";
      default:
        return "from-gray-800 to-gray-700";
    }
  };

  const getCategoryBorderColor = (category: string) => {
    switch (category) {
      case "UI/UX":
        return "border-pink-500";
      case "Backend":
        return "border-blue-500";
      case "Frontend":
        return "border-purple-500";
      case "Infrastructure":
        return "border-amber-500";
      case "Security":
        return "border-red-500";
      case "Performance":
        return "border-green-500";
      case "Analytics":
        return "border-cyan-500";
      default:
        return "border-gray-500";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "UI/UX":
        return <Palette className="h-4 w-4 text-pink-300" />;
      case "Backend":
        return <Database className="h-4 w-4 text-blue-300" />;
      case "Frontend":
        return <Layout className="h-4 w-4 text-purple-300" />;
      case "Infrastructure":
        return <Server className="h-4 w-4 text-amber-300" />;
      case "Security":
        return <Shield className="h-4 w-4 text-red-300" />;
      case "Performance":
        return <Zap className="h-4 w-4 text-green-300" />;
      case "Analytics":
        return <BarChart className="h-4 w-4 text-cyan-300" />;
      default:
        return <Tag className="h-4 w-4 text-gray-300" />;
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-gray-900 to-purple-950 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="bg-gray-900 rounded-xl shadow-lg p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-center mb-4 text-gray-200">Loading project...</h1>
            <div className="space-y-3">
              <div className="animate-pulse bg-gray-700 h-4 w-full rounded"></div>
              <div className="animate-pulse bg-gray-700 h-4 w-3/4 rounded"></div>
              <div className="animate-pulse bg-gray-700 h-4 w-1/2 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Progress bar width as percent
  const progress = ((project.currentStep - 1) / project.totalSteps) * 100;

  // Steps config for progress bar
  const stepConfig = [
    { label: "Project Name", icon: FileText, color: "blue" },
    { label: "Description", icon: FileText, color: "indigo" },
    { label: "Questions", icon: Users, color: "purple" },
    { label: "Features", icon: Target, color: "pink" },
    { label: "Prompts", icon: MessageSquare, color: "amber" },
    { label: "Summary", icon: CheckCircle, color: "green" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br bg-black text-gray-200 p-4">
      <div className="max-w-7xl mx-auto py-8">

        {/* Back to projects list */}
        <button onClick={handleBackToList} disabled={isLoading} className="mb-6 inline-flex items-center px-4 py-2 bg-gray-800 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
          <ChevronLeft className="mr-2 h-5 w-5" /> Back to Projects
        </button>

        

        <div className="bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
          <div className="w-full bg-gray-800 rounded-full h-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="flex justify-between">
            {stepConfig.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = i < project.currentStep - 1;
              const isCurrent = i === project.currentStep - 1;
              return (
                <div key={i} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-600 text-gray-100 shadow-lg"
                      : isCurrent
                      ? `bg-${step.color}-600 text-gray-100 shadow-lg animate-pulse`
                      : "bg-gray-800 text-gray-500"
                  }`}>
                    {isCompleted ? <CheckCircle className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <span className={`text-xs font-medium ${isCurrent ? "text-gray-100" : "text-gray-500"}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main form card */}
        <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden p-8">
          {error && (
            <div className="bg-red-900 border-l-4 border-red-700 p-4 mb-6 rounded-lg">
              <div className="flex items-center space-x-3">
                <Circle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Project Name */}
          {project.currentStep === 1 && (
            <form onSubmit={handleNameSubmit} className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-800 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-blue-300" />
                </div>
                <h2 className="text-2xl font-bold mb-2">What's your project name?</h2>
                <p className="text-gray-400">Give your project a memorable name that captures its essence</p>
              </div>
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium mb-2">Project Name</label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter your amazing project name"
                  required
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                />
              </div>
              <div className="flex justify-between">
                {/* No previous step button on first step */}
                <div />
                <button
                  type="submit"
                  disabled={isLoading || !projectName.trim()}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-medium rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? <><Loader2 className="animate-spin h-5 w-5 mr-2" />Saving...</> : <>Next Step<ChevronRight className="ml-2 h-5 w-5" /></>}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Description */}
          {project.currentStep === 2 && (
            <form onSubmit={handleDescriptionSubmit} className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-800 rounded-full mb-4">
                  <FileText className="h-8 w-8 text-indigo-300" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Describe your project</h2>
                <p className="text-gray-400">Tell us about your project vision, goals, and requirements</p>
              </div>
              <div>
                <label htmlFor="projectDescription" className="block text-sm font-medium mb-2">Project Description</label>
                <textarea
                  id="projectDescription"
                  rows={6}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe your project in detail. What problem does it solve? Who are your users? What are the main features you envision?"
                  required
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                />
                <p className="mt-2 text-sm text-gray-500">💡 The more detailed your description, the better questions we can generate for you</p>
              </div>
              
              <div>
                <label htmlFor="techStack" className="block text-sm font-medium mb-2">Tech Stack</label>
                <select
                  id="techStack"
                  value={techStack || ""}
                  onChange={(e) => setTechStack(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select a tech stack</option>
                  <option value="nextjs-supabase">Next.js + Supabase</option>
                  <option value="nextjs-convex">Next.js + Convex</option>
                  <option value="mern">MERN Stack (MongoDB, Express, React, Node)</option>
                  <option value="reactjs-supabase">React.js + Supabase</option>
                  <option value="reactjs-convex">React.js + Convex</option>
                </select>
                <p className="mt-2 text-sm text-gray-500">Select the tech stack you want to use for your project</p>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-gray-700 text-gray-400 rounded-lg shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-colors"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" /> Previous Step
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !projectDescription.trim()}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? <><Loader2 className="animate-spin h-5 w-5 mr-2" />Generating Questions...</> : <>Next Step<ChevronRight className="ml-2 h-5 w-5"/></>}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Questions */}
          {project.currentStep === 3 && questions && (
            <form onSubmit={handleQuestionsSubmit} className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-800 rounded-full mb-4">
                  <Users className="h-8 w-8 text-purple-300" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Project Questions</h2>
                <p className="text-gray-400">AI-generated questions to better understand your project needs</p>
              </div>
              <div className="space-y-6">
                {questions.map((q, i) => (
                  <div key={q._id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-300">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <label htmlFor={q._id} className="block text-sm font-medium mb-3">
                          {q.questionText}{q.isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {q.inputType === "textarea" ? (
                          <textarea
                            id={q._id}
                            value={questionAnswers[q._id] || ""}
                            onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                            rows={4}
                            placeholder={q.placeholderText || "Your answer"}
                            required={q.isRequired}
                            className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                          />
                        ) : (
                          <input
                            id={q._id}
                            type="text"
                            value={questionAnswers[q._id] || ""}
                            onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                            placeholder={q.placeholderText || "Your answer"}
                            required={q.isRequired}
                            className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-gray-700 text-gray-400 rounded-lg shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-colors"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Previous Step
                </button>
                <button
                  type="submit"
                  disabled={isLoading || questions.some((q) => q.isRequired && !questionAnswers[q._id]?.trim())}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-700 text-white font-medium rounded-lg shadow-lg hover:from-purple-700 hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? <><Loader2 className="animate-spin mr-2 h-5 w-5" />Saving Answers...</> : <>Next Step<ChevronRight className="ml-2 h-5 w-5" /></>}
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Feature Generation */}
          {project.currentStep === 4 && (
            <>
              <form onSubmit={handleContextSubmit} className="space-y-6">
                
                
                {/* Interactive Control Panel */}
                <div className="relative bg-gradient-to-b from-gray-900 to-purple-900/20 rounded-xl border border-purple-800/50 p-6 mb-8 overflow-hidden">
                  {/* Background decorative elements */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(219,39,119,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(124,58,237,0.15),transparent_50%)]" />
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }} />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                      {/* Project Info Card */}
                      <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-5 border border-purple-700/50 w-full md:w-2/3 shadow-lg">
                        <div className="flex items-start">
                          <div className="bg-gradient-to-br from-pink-600 to-purple-700 rounded-full p-2 mr-4">
                            <Lightbulb className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-100 mb-2">Project Brief</h3>
                            <p className="text-sm text-gray-300 mb-2 font-medium">{project.name}</p>
                            <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Feature Generation Controls */}
                      <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-5 border border-purple-700/50 w-full md:w-1/3 shadow-lg">
                        
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <div className="flex-1">
                            
                            <div className="relative">
                              
                              <p>Generate Features</p>
                            </div>
                          </div>
                          
                          
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="flex-shrink-0 inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-pink-600 to-purple-700 text-white font-medium rounded-lg shadow-lg hover:from-pink-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="mr-2 h-5 w-5" />
                                  Generate
                                </>
                              )}
                            </button>
                        
                        </div>

                        <div className="border-t border-purple-700/30 pt-4 mt-4">
                          <button
                            type="button"
                            onClick={() => setShowManualFeatureForm(!showManualFeatureForm)}
                            className="w-full flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-colors shadow-md"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            {showManualFeatureForm ? "Hide Manual Form" : "Add Feature Manually"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>

              {/* Manual Feature Creation Form */}
              {showManualFeatureForm && (
                <div className="relative bg-gradient-to-b from-gray-900 to-indigo-900/20 rounded-xl border border-indigo-800/50 p-6 mb-8 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(79,70,229,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(124,58,237,0.15),transparent_50%)]" />
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }} />
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold flex items-center text-transparent bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text mb-6">
                      <PlusCircle className="h-6 w-6 mr-2 text-indigo-400" />
                      Add Feature Manually
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="featureTitle" className="block text-sm font-medium mb-2 text-gray-300">Feature Title*</label>
                            <input
                              id="featureTitle"
                              type="text"
                              value={manualFeature.title}
                              onChange={(e) => handleManualFeatureChange('title', e.target.value)}
                              placeholder="Enter feature title"
                              required
                              className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="featureDescription" className="block text-sm font-medium mb-2 text-gray-300">Description*</label>
                            <textarea
                              id="featureDescription"
                              rows={4}
                              value={manualFeature.description}
                              onChange={(e) => handleManualFeatureChange('description', e.target.value)}
                              placeholder="Describe the feature in detail"
                              required
                              className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="featureImplementation" className="block text-sm font-medium mb-2 text-gray-300">Implementation Details</label>
                            <textarea
                              id="featureImplementation"
                              rows={4}
                              value={manualFeature.implementationDetails}
                              onChange={(e) => handleManualFeatureChange('implementationDetails', e.target.value)}
                              placeholder="Optional implementation details or technical notes"
                              className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="featurePriority" className="block text-sm font-medium mb-2 text-gray-300">Priority*</label>
                            <select
                              id="featurePriority"
                              value={manualFeature.priority}
                              onChange={(e) => handleManualFeatureChange('priority', e.target.value)}
                              required
                              className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Critical">Critical</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="featureEffort" className="block text-sm font-medium mb-2 text-gray-300">Effort*</label>
                            <select
                              id="featureEffort"
                              value={manualFeature.effort}
                              onChange={(e) => handleManualFeatureChange('effort', e.target.value)}
                              required
                              className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            >
                              <option value="Small">Small</option>
                              <option value="Medium">Medium</option>
                              <option value="Large">Large</option>
                              <option value="XL">XL</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="featureCategory" className="block text-sm font-medium mb-2 text-gray-300">Category*</label>
                            <select
                              id="featureCategory"
                              value={manualFeature.category}
                              onChange={(e) => handleManualFeatureChange('category', e.target.value)}
                              required
                              className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            >
                              <option value="Core">Core</option>
                              <option value="Enhancement">Enhancement</option>
                              <option value="Integration">Integration</option>
                              <option value="UI/UX">UI/UX</option>
                              <option value="Performance">Performance</option>
                              <option value="Security">Security</option>
                            </select>
                          </div>
                          
                          <div className="pt-4">
                            <button
                              type="button"
                              onClick={handleManualFeatureSubmit}
                              disabled={isLoading || !manualFeature.title || !manualFeature.description}
                              className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-medium rounded-lg shadow-lg hover:from-indigo-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <PlusCircle className="mr-2 h-5 w-5" />
                                  Add Feature
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleContextSubmit} className="space-y-6">

                {/* Feature Showcase */}
                {features && features.length > 0 && (
                  <div className="relative bg-gradient-to-b from-gray-900 to-pink-900/20 rounded-xl border border-pink-800/50 p-6 mb-8 overflow-hidden">
                    {/* Background decorative elements */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(219,39,119,0.15),transparent_50%),radial-gradient(circle_at_30%_70%,rgba(124,58,237,0.15),transparent_50%)]" />
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }} />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold flex items-center text-transparent bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text">
                          <Sparkles className="h-6 w-6 mr-2 text-yellow-400" />
                          AI-Generated Features
                        </h3>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400 bg-gray-800/80 px-2 py-1 rounded-md border border-gray-700">
                            {features.filter(f => f.addedToTask).length}/{features.length} Added to Tasks
                          </span>
                        </div>
                      </div>
                      
                      {/* Feature Cards with 3D effect */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[500px] overflow-y-auto pr-2 pb-2">
                        {features.map((feature, index) => (
                          <div 
                            key={feature._id}
                            className={`group relative bg-gradient-to-br ${feature.addedToTask ? 
                              'from-green-900/80 to-emerald-900/80 border-green-600/70' : 
                              'from-gray-900/90 to-gray-800/90 border-gray-700/70'} 
                            rounded-xl border shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 transform perspective-1000`}
                          >
                            {/* Category ribbon */}
                            <div className="absolute -right-12 top-6 transform rotate-45 z-10">
                              <div className={`w-36 py-1 text-center text-xs font-semibold ${getCategoryColor(feature.category)}`}>
                                {feature.category}
                              </div>
                            </div>
                            
                            {/* Priority indicator */}
                            <div className="absolute top-3 left-3">
                              <div className={`flex items-center ${getPriorityColor(feature.priority)} rounded-full px-2 py-1 text-xs font-medium`}>
                                <span className="flex h-2 w-2 rounded-full mr-1.5 animate-pulse"></span>
                                {feature.priority}
                              </div>
                            </div>
                            
                            <div className="p-6">
                              <div className="mt-5 mb-4">
                                <h4 className="text-xl font-semibold text-gray-100">{feature.title}</h4>
                              </div>
                              
                              <p className="text-gray-300 mb-5 line-clamp-3">{feature.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-5">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getEffortColor(feature.effort)}`}>
                                  <Target className="h-3 w-3 mr-1" /> {feature.effort} Effort
                                </span>
                                
                                {feature.addedToTask && (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-800/60 text-green-200 border border-green-600">
                                    <CheckSquare className="h-3 w-3 mr-1" /> Task Created
                                  </span>
                                )}
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                                <button
                                  onClick={() => setExpandedFeature(expandedFeature === feature._id ? null : feature._id)}
                                  className="text-xs font-medium flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  {expandedFeature === feature._id ? "Hide Details" : "View Details"}
                                  <ChevronRight className={`ml-1 h-3 w-3 transition-transform ${expandedFeature === feature._id ? "rotate-90" : ""}`} />
                                </button>
                                
                                {!feature.addedToTask ? (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setCurrentFeatureId(feature._id);
                                      setSelectedDate(""); // Reset date when opening modal
                                      setShowDateModal(true);
                                    }}
                                    className="flex items-center px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white text-xs font-medium rounded-lg hover:from-green-700 hover:to-emerald-800 transition-colors shadow-md"
                                    title="Add to Task"
                                  >
                                    <PlusCircle className="h-3.5 w-3.5 mr-1" />
                                    Add to Tasks
                                  </button>
                                ) : (
                                  <button
                                    onClick={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsLoading(true);
                                      try {
                                        await removeFeatureFromTask({
                                          featureId: feature._id
                                        });
                                      } catch (err) {
                                        setError(err instanceof Error ? err.message : String(err));
                                      } finally {
                                        setIsLoading(false);
                                      }
                                    }}
                                    className="flex items-center px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-colors shadow-md"
                                    title="Remove from Task"
                                  >
                                    <MinusCircle className="h-3.5 w-3.5 mr-1" />
                                    Remove Task
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            {/* Expanded details */}
                            {expandedFeature === feature._id && (
                              <div className="p-5 bg-black/30 border-t border-gray-700/50">
                                <h5 className="font-semibold mb-3 flex items-center text-gray-100">
                                  <Code className="h-4 w-4 mr-2 text-pink-400" />
                                  Implementation Guide
                                </h5>
                                <p className="text-sm text-gray-300 mb-4">
                                  {feature.implementationDetails || "This feature can be implemented using modern web technologies. Start by creating the core functionality and then add user interface components."}
                                </p>
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-gray-400">Recommended Steps:</p>
                                  <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                                    <li>Define the feature requirements and scope</li>
                                    <li>Create wireframes and design mockups</li>
                                    <li>Implement core functionality</li>
                                    <li>Add user interface components</li>
                                    <li>Test and refine the implementation</li>
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 border border-gray-700 text-gray-400 rounded-lg shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-colors"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Previous Step
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoading(true);
                      setError(null);
                      try {
                        await setCurrentStep({ projectId: projectId as Id<"projects">, currentStep: 5 });
                      } catch (err) {
                        setError(err instanceof Error ? err.message : String(err));
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-700 text-white font-medium rounded-lg shadow-lg hover:from-pink-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next Step
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 5: Prompt Generation */}
          {project.currentStep === 5 && features && (
            <form onSubmit={(e) => {
              e.preventDefault();
              setIsLoading(true);
              setError(null);
              try {
                setCurrentStep({ projectId: projectId as Id<"projects">, currentStep: 6 });
              } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
              } finally {
                setIsLoading(false);
              }
            }} className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-800 rounded-full mb-4">
                  <MessageSquare className="h-8 w-8 text-amber-200" />
                </div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-500">
                  Generate AI Prompts
                </h2>
                <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                  Create AI prompts for your project or specific features to help with implementation.
                </p>
              </div>

              <div className="relative bg-gradient-to-b from-gray-900 to-amber-900/20 rounded-xl border border-amber-800/50 p-6 mb-8 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(245,158,11,0.15),transparent_50%)]" />
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold flex items-center text-transparent bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text mb-6">
                    <Sparkles className="h-6 w-6 mr-2 text-amber-400" />
                    Prompt Generation Options
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project-level prompt */}
                    <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-5 border border-amber-700/50 shadow-lg hover:shadow-amber-900/20 hover:border-amber-600/70 transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-start mb-4">
                        <div className="bg-gradient-to-br from-amber-600 to-yellow-700 rounded-full p-2 mr-4">
                          <Lightbulb className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-100">Project Prompt</h4>
                          <p className="text-sm text-gray-300 mt-1">
                            Generate a comprehensive prompt for the entire project that covers all aspects.
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleGeneratePrompt('project')}
                        disabled={isGeneratingPrompt}
                        className="w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-700 text-white font-medium rounded-lg shadow-lg hover:from-amber-700 hover:to-yellow-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {isGeneratingPrompt ? (
                          <>
                            <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Generate Project Prompt
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* Feature-level prompts */}
                    <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-5 border border-amber-700/50 shadow-lg hover:shadow-amber-900/20 hover:border-amber-600/70 transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-start mb-4">
                        <div className="bg-gradient-to-br from-amber-600 to-yellow-700 rounded-full p-2 mr-4">
                          <Target className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg text-gray-100">Feature Prompts</h4>
                          <p className="text-sm text-gray-300 mt-1">
                            Generate prompts for features added to tasks.
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {features && features.length > 0 ? (
                          features
                            .filter(feature => feature.addedToTask) // Only show features added to tasks
                            .map((feature) => (
                              <button
                                key={feature._id}
                                type="button"
                                onClick={() => handleGeneratePrompt('feature', feature._id)}
                                disabled={isGeneratingPrompt}
                                className="flex items-center justify-between px-3 py-1.5 bg-gray-800 text-gray-200 text-sm rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                              >
                                <span className="truncate mr-2">{feature.title}</span>
                                <Sparkles className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                              </button>
                            ))
                        ) : (
                          <p className="text-gray-400 text-sm col-span-2">No features added to tasks</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Generated Prompts Display - Compact Version */}
                  {generatedPrompts.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-amber-400 mb-3 flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Generated Prompts
                      </h4>
                      <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-2">
                          {generatedPrompts.map((prompt, index) => (
                            <details key={index} className="bg-gray-800/80 border border-amber-700/30 rounded-lg shadow-sm group">
                              <summary className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center">
                                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-700/50 mr-2">
                                    {prompt.type === 'project' ? <Lightbulb className="h-3.5 w-3.5 text-amber-200" /> : <Target className="h-3.5 w-3.5 text-amber-200" />}
                                  </span>
                                  <h5 className="font-medium text-sm text-gray-200">
                                    {prompt.type === 'project' ? 'Project Prompt' : `${features.find(f => f._id === prompt.featureId)?.title || 'Feature'}`}
                                  </h5>
                                </div>
                                <div className="flex items-center">
                                  <span className="text-xs text-gray-400 mr-2">
                                    {new Date(prompt.createdAt).toLocaleTimeString()}
                                  </span>
                                  <ChevronDown className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform" />
                                </div>
                              </summary>
                              <div className="bg-gray-900/70 rounded-b p-3 text-gray-300 text-xs whitespace-pre-wrap border-t border-amber-700/20 max-h-[200px] overflow-y-auto">
                                {prompt.content}
                              </div>
                            </details>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-gray-700 text-gray-400 rounded-lg shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-colors"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Previous Step
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-700 text-white font-medium rounded-lg shadow-lg hover:from-amber-700 hover:to-yellow-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next Step
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </form>
          )}

          {/* Step 6: Summary */}
          {project.currentStep === 6 && features && (
            <form onSubmit={handleSummarySubmit} className="space-y-8">
             
              
              {/* Project Mind Map / Tree Visualization */}
              <div className="relative bg-gradient-to-b from-gray-900 to-blue-900/30 rounded-xl p-6 border border-blue-800/50 mb-10 overflow-hidden min-h-[600px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.15),transparent_50%)]" />
                
                {/* Subtle grid background */}
                <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
                
                <div className="relative z-10">
                  <h3 className="font-semibold text-xl mb-8 flex items-center text-gray-100">
                    <GitBranch className="h-5 w-5 mr-2 text-blue-400" />
                    Project Architecture
                  </h3>
                  
                  {/* Mind Map / Tree Structure */}
                  <div className="flex justify-center">
                    {/* Root Node (Project) */}
                    <div className="flex flex-col items-center">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-xl border border-blue-400 shadow-lg shadow-blue-900/30 w-full max-w-md relative z-20 transform transition-transform hover:scale-105 hover:shadow-xl">
                        <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-blue-300">
                          Root
                        </div>
                        <h4 className="font-bold text-xl text-white">{project.name}</h4>
                        <p className="text-blue-100 mt-2 line-clamp-2">{project.description}</p>
                        <div className="mt-3 flex items-center space-x-3">
                          <span className="text-xs text-blue-100 bg-blue-700/70 px-2 py-1 rounded-md flex items-center">
                            <Target className="h-3 w-3 mr-1" /> {features.length} Features
                          </span>
                          <span className="text-xs text-emerald-100 bg-emerald-700/70 px-2 py-1 rounded-md flex items-center">
                            <CheckSquare className="h-3 w-3 mr-1" /> {features.filter(f => f.addedToTask).length} Tasks
                          </span>
                        </div>
                      </div>
                      
                      {/* Main Connector */}
                      <div className="h-16 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 relative my-1">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-purple-600 border-2 border-purple-300 flex items-center justify-center shadow-lg shadow-purple-900/30">
                          <ArrowDown className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      
                      {/* Category Branches */}
                      <div className="grid grid-cols-1 gap-8 w-full">
                        {/* Group features by category */}
                        {(() => {
                          const categories: Record<string, typeof features> = {};
                          features.forEach(feature => {
                            if (!categories[feature.category]) {
                              categories[feature.category] = [];
                            }
                            categories[feature.category].push(feature);
                          });
                          
                          return Object.entries(categories).map(([category, categoryFeatures], categoryIndex) => (
                            <div key={category} className="relative">
                              {/* Category Node */}
                              <div className="flex flex-col items-center">
                                <div className={`bg-gradient-to-r ${getCategoryNodeColor(category)} p-4 rounded-lg border ${getCategoryBorderColor(category)} shadow-lg w-full max-w-sm mx-auto relative z-10 transform transition-transform hover:scale-105`}>
                                  <h5 className="font-bold text-lg text-white flex items-center">
                                    {getCategoryIcon(category)}
                                    <span className="ml-2">{category}</span>
                                  </h5>
                                  <p className="text-sm text-gray-100 mt-1">{categoryFeatures.length} feature{categoryFeatures.length !== 1 ? 's' : ''}</p>
                                </div>
                                
                                {/* Branch Connector */}
                                <div className="h-12 w-0.5 bg-gradient-to-b from-purple-500 to-pink-500 relative my-1">
                                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-pink-600 border border-pink-300 flex items-center justify-center">
                                    <ArrowDown className="h-2 w-2 text-white" />
                                  </div>
                                </div>
                                
                                {/* Feature Nodes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                  {categoryFeatures.map((feature, featureIndex) => (
                                    <div key={feature._id} className="relative">
                                      {/* Feature Card */}
                                      <div 
                                        className={`bg-gradient-to-br ${feature.addedToTask ? 'from-emerald-900 to-green-800 border-emerald-500' : 'from-violet-900 to-indigo-800 border-violet-500'} 
                                        p-4 rounded-lg border shadow-lg h-full transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] relative z-10`}
                                      >
                                        {/* Priority Corner Badge */}
                                        <div className={`absolute -top-2 -right-2 ${getPriorityBadgeColor(feature.priority)} text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md`}>
                                          {feature.priority}
                                        </div>
                                        
                                        <div className="flex items-start justify-between mb-3">
                                          <h5 className="font-semibold text-gray-100 pr-12">{feature.title}</h5>
                                        </div>
                                        
                                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">{feature.description}</p>
                                        
                                        <div className="flex items-center justify-between">
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${getEffortBadgeColor(feature.effort)}`}>
                                            <Target className="h-3 w-3 mr-1" /> {feature.effort} Effort
                                          </span>
                                          
                                          {feature.addedToTask && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-800/60 text-green-200 border border-green-600">
                                              <CheckSquare className="h-3 w-3 mr-1" /> Task
                                            </span>
                                          )}
                                        </div>
                                        
                                        <button
                                          onClick={() => setExpandedFeature(expandedFeature === feature._id ? null : feature._id)}
                                          className="text-xs font-medium flex items-center text-blue-400 hover:text-blue-300 mt-3"
                                        >
                                          {expandedFeature === feature._id ? "Hide Details" : "View Details"}
                                          <ChevronRight className={`ml-1 h-3 w-3 transition-transform ${expandedFeature === feature._id ? "rotate-90" : ""}`} />
                                        </button>
                                        
                                        {expandedFeature === feature._id && (
                                          <div className="mt-4 pt-4 border-t border-gray-700/50">
                                            <h6 className="text-xs font-semibold mb-2 text-gray-200 flex items-center">
                                              <Code className="h-3 w-3 mr-1" /> Implementation Guide
                                            </h6>
                                            <p className="text-xs text-gray-300">
                                              {feature.implementationDetails || "This feature can be implemented using modern web technologies."}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Connecting lines between features (visible on larger screens) */}
                                      {featureIndex < categoryFeatures.length - 1 && featureIndex % 2 === 0 && (
                                        <div className="hidden md:block absolute top-1/2 right-0 w-4 h-0.5 bg-pink-500/50 transform translate-x-full" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Connecting lines between categories */}
                              {categoryIndex < Object.keys(categories).length - 1 && (
                                <div className="h-8 w-0.5 bg-blue-500/50 mx-auto my-4" />
                              )}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legend and Export */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-300">Blueprint Legend</h4>
                  
                  <div className="flex flex-col md:flex-row gap-2 mt-2 md:mt-0">
                    {/* Export Markdown Button */}
                    <button
                      onClick={handleExportMarkdown}
                      disabled={isGeneratingMarkdown || !features || features.length === 0}
                      className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                    >
                      {isGeneratingMarkdown ? (
                        <>
                          <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          Export as Markdown
                        </>
                      )}
                    </button>
                    
                    {/* Generate PDF Documentation Button */}
                    <button
                      onClick={handleGeneratePdfDocumentation}
                      disabled={isGeneratingPdf || !features || features.length === 0}
                      className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-amber-600 to-orange-700 text-white text-xs font-medium rounded-lg hover:from-amber-700 hover:to-orange-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                    >
                      {isGeneratingPdf ? (
                        <>
                          <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                          Generate PDF Documentation
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-xs text-gray-400">Project Root</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                    <span className="text-xs text-gray-400">Feature Categories</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs text-gray-400">Tasks</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                    <span className="text-xs text-gray-400">Features</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={handlePreviousStep}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-gray-700 text-gray-400 rounded-lg shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-colors"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  Previous Step
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white font-medium rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? <><Loader2 className="animate-spin mr-2 h-5 w-5" />Finalizing Blueprint...</> : <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Finalize Blueprint
                  </>}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* Date Selection Modal */}
      {showDateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-100 mb-4">Task Details</h3>
            <p className="text-sm text-gray-300 mb-6">Set a due date and assign a team member for this task.</p>
            
            <div className="mb-6">
              <label htmlFor="dueDate" className="block text-sm font-medium mb-2 text-gray-300">Due Date</label>
              <input
                id="dueDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="assignedMember" className="block text-sm font-medium mb-2 text-gray-300">Assign To</label>
              <select
                id="assignedMember"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                disabled={!projectMembers || projectMembers.length === 0}
              >
                <option value="">Not assigned</option>
                {projectMembers && projectMembers.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
              {!projectMembers && <p className="text-xs text-gray-400 mt-1">Loading members...</p>}
              {projectMembers && projectMembers.length === 0 && <p className="text-xs text-gray-400 mt-1">No project members available</p>}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDateModal(false)}
                className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (currentFeatureId) {
                    setIsLoading(true);
                    try {
                      // Convert selected date to ISO string and then to timestamp
                      let dueDateTimestamp: number | undefined = undefined;
                      if (selectedDate) {
                        const dateObj = new Date(selectedDate);
                        if (!isNaN(dateObj.getTime())) {
                          // Store as ISO string timestamp
                          dueDateTimestamp = dateObj.getTime();
                        }
                      }
                      
                      await addFeatureToTask({
                        featureId: currentFeatureId,
                        projectId: projectId as Id<"projects">,
                        dueDate: dueDateTimestamp,
                        assignedTo: selectedMember || undefined
                      });
                      
                      setShowDateModal(false);
                      setCurrentFeatureId(null);
                      setSelectedMember("");
                      setSelectedDate("");
                    } catch (err) {
                      setError(err instanceof Error ? err.message : String(err));
                    } finally {
                      setIsLoading(false);
                    }
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-lg hover:from-indigo-700 hover:to-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  'Add to Task'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
