"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { 
  Loader2, 
  Plus, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  KanbanSquare,
  Activity,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Zap,
  BarChart3,
  Filter,
  Search,
  Grid3X3,
  List
} from "lucide-react";

// Define project type
type Project = {
  _id: Id<"projects">;
  name: string;
  description?: string;
  status: string;
  // Add other fields as needed
};

// Define task counts type
type TaskCounts = {
  todo: number;
  in_progress: number;
  completed: number;
  blocked: number;
  total: number;
};

export default function KanbanProjectList() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Fetch all projects for the user
  const projects = useQuery(api.projects.getUserProjects);
  
  // Fetch all tasks for all projects at once (more efficient)
  const allTasks = useQuery(api.tasks.getAllTasks);
  
  // Calculate task counts for all projects
  const projectTaskCounts = useMemo(() => {
    if (!projects || !allTasks) return {};
    
    const counts: Record<string, TaskCounts> = {};
    
    // Initialize counts for all projects
    projects.forEach(project => {
      counts[project._id] = { todo: 0, in_progress: 0, completed: 0, blocked: 0, total: 0 };
    });
    
    // Define task type
    type Task = {
      _id: Id<"tasks">;
      projectId: Id<"projects">;
      status: string;
      title: string;
      description?: string;
      // Add other fields as needed
    };
    
    // Count tasks by project and status
    allTasks.forEach((task: Task) => {
      if (counts[task.projectId]) {
        counts[task.projectId][task.status as keyof Omit<TaskCounts, 'total'>]++;
        counts[task.projectId].total++;
      }
    });
    
    return counts;
  }, [projects, allTasks]);
  
  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    } else if (isLoaded && projects) {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, router, projects]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-200/30 rounded-full animate-pulse"></div>
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400 absolute top-4 left-4" />
          </div>
          <div className="text-lg font-medium text-slate-200">Loading projects...</div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-emerald-600 shadow-lg">
                <KanbanSquare className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-emerald-400">
                  Task Boards
                </h1>
                <p className="text-slate-400 mt-1">
                  Manage your projects with powerful Kanban boards
                </p>
              </div>
            </div>
            
            <div className="flex items-center bg-slate-800/50 rounded-xl p-1 self-start">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{projects?.length || 0}</div>
                  <div className="text-sm text-slate-400">Total Projects</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Target className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {Object.values(projectTaskCounts).reduce((acc, counts) => acc + counts.total, 0)}
                  </div>
                  <div className="text-sm text-slate-400">Total Tasks</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <Activity className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {Object.values(projectTaskCounts).reduce((acc, counts) => acc + counts.in_progress, 0)}
                  </div>
                  <div className="text-sm text-slate-400">In Progress</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {Object.values(projectTaskCounts).reduce((acc, counts) => acc + counts.completed, 0)}
                  </div>
                  <div className="text-sm text-slate-400">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Projects Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6"
        >
          {projects && projects.length > 0 ? (
            viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: Project, index) => {
                  const taskCounts = projectTaskCounts[project._id] || { todo: 0, in_progress: 0, completed: 0, blocked: 0, total: 0 };
                  const completionRate = taskCounts.total > 0 ? Math.round((taskCounts.completed / taskCounts.total) * 100) : 0;
                  
                  return (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="group bg-slate-700/30 rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10 relative overflow-hidden"
                      onClick={() => router.push(`/tasks/${project._id}`)}
                    >
                      {/* Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Status Indicator */}
                      <div className="absolute top-4 right-4 flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${
                          project.status === 'active' ? 'bg-emerald-500' :
                          project.status === 'completed' ? 'bg-blue-500' :
                          project.status === 'archived' ? 'bg-slate-500' : 'bg-amber-500'
                        }`} />
                        <span className="text-xs text-slate-400 capitalize">{project.status}</span>
                      </div>
                      
                      <div className="relative z-10">
                        {/* Project Header */}
                        <div className="mb-4 pr-16">
                          <h2 className="text-xl font-semibold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                            {project.name}
                          </h2>
                          <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                            {project.description || "No description provided"}
                          </p>
                        </div>
                        
                        {/* Task Statistics */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30">
                            <div className="flex items-center space-x-2 mb-1">
                              <Clock className="h-4 w-4 text-blue-400" />
                              <span className="text-xs text-slate-400">To Do</span>
                            </div>
                            <div className="text-lg font-bold text-white">{taskCounts.todo}</div>
                          </div>
                          
                          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30">
                            <div className="flex items-center space-x-2 mb-1">
                              <Activity className="h-4 w-4 text-amber-400" />
                              <span className="text-xs text-slate-400">In Progress</span>
                            </div>
                            <div className="text-lg font-bold text-white">{taskCounts.in_progress}</div>
                          </div>
                          
                          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30">
                            <div className="flex items-center space-x-2 mb-1">
                              <CheckCircle className="h-4 w-4 text-emerald-400" />
                              <span className="text-xs text-slate-400">Completed</span>
                            </div>
                            <div className="text-lg font-bold text-white">{taskCounts.completed}</div>
                          </div>
                          
                          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30">
                            <div className="flex items-center space-x-2 mb-1">
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                              <span className="text-xs text-slate-400">Blocked</span>
                            </div>
                            <div className="text-lg font-bold text-white">{taskCounts.blocked}</div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-slate-400">Progress</span>
                            <span className="text-sm font-semibold text-emerald-400">{completionRate}%</span>
                          </div>
                          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${completionRate}%` }}
                              transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                              className="bg-emerald-500 h-full rounded-full relative"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full" />
                            </motion.div>
                          </div>
                        </div>
                        
                        {/* Action */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-slate-400">
                            <KanbanSquare className="h-4 w-4 mr-1" />
                            <span>{taskCounts.total} tasks</span>
                          </div>
                          <div className="flex items-center text-sm text-emerald-400 group-hover:text-emerald-300 font-medium">
                            <span>Open Board</span>
                            <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              // List View
              <div className="space-y-3">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-700/30 rounded-lg text-sm font-medium text-slate-300">
                  <div className="col-span-4">Project Name</div>
                  <div className="col-span-1 text-center">Status</div>
                  <div className="col-span-4 text-center">Tasks</div>
                  <div className="col-span-2 text-center">Progress</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                
                {/* Project Rows */}
                {projects.map((project: Project, index) => {
                  const taskCounts = projectTaskCounts[project._id] || { todo: 0, in_progress: 0, completed: 0, blocked: 0, total: 0 };
                  const completionRate = taskCounts.total > 0 ? Math.round((taskCounts.completed / taskCounts.total) * 100) : 0;
                  
                  return (
                    <motion.div
                      key={project._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200 group cursor-pointer"
                      onClick={() => router.push(`/tasks/${project._id}`)}
                    >
                      {/* Project Name */}
                      <div className="col-span-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-emerald-500/20 flex-shrink-0">
                            <KanbanSquare className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="font-medium text-white group-hover:text-emerald-300 transition-colors">
                              {project.name}
                            </h3>
                            <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                              {project.description || "No description provided"}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="col-span-1 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          project.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          project.status === 'archived' ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' : 
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          <span className="capitalize">{project.status}</span>
                        </span>
                      </div>
                      
                      {/* Task Counts */}
                      <div className="col-span-4">
                        <div className="grid grid-cols-4 gap-2">
                          <div className="flex flex-col items-center">
                            <div className="text-xs text-slate-400 mb-1">Todo</div>
                            <div className="text-sm font-medium text-white bg-blue-500/20 rounded-md px-2 py-1 w-full text-center">
                              {taskCounts.todo}
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-xs text-slate-400 mb-1">In Prog</div>
                            <div className="text-sm font-medium text-white bg-amber-500/20 rounded-md px-2 py-1 w-full text-center">
                              {taskCounts.in_progress}
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-xs text-slate-400 mb-1">Done</div>
                            <div className="text-sm font-medium text-white bg-emerald-500/20 rounded-md px-2 py-1 w-full text-center">
                              {taskCounts.completed}
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="text-xs text-slate-400 mb-1">Blocked</div>
                            <div className="text-sm font-medium text-white bg-red-500/20 rounded-md px-2 py-1 w-full text-center">
                              {taskCounts.blocked}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress */}
                      <div className="col-span-2">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-24 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${completionRate}%` }}
                              transition={{ duration: 1, delay: index * 0.05 + 0.2 }}
                              className="bg-emerald-500 h-full rounded-full"
                            />
                          </div>
                          <span className="text-xs font-medium text-emerald-400">{completionRate}%</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-end">
                        <button
                          className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-all"
                          title="Open Board"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                  <KanbanSquare className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
                <p className="text-slate-400 mb-6 max-w-md">
                  Create your first project to start organizing tasks with powerful Kanban boards
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/createProject")}
                  className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Project</span>
                </motion.button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}