"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  X,
  Calendar,
  Clock,
  Tag,
  Layers,
  Users,
  AlertCircle,
  Check
} from "lucide-react";

interface CreateTaskModalProps {
  onClose: () => void;
  selectedDate?: Date;
  projectId?: Id<"projects">;
}

export default function CreateTaskModal({ onClose, selectedDate, projectId }: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [effort, setEffort] = useState("Medium");
  const [category, setCategory] = useState("Core");
  const [status, setStatus] = useState<"todo" | "in_progress" | "completed" | "blocked">("todo");
  const [dueDate, setDueDate] = useState<string>("");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const createTask = useMutation(api.tasks.createTask);
  const projects = useQuery(api.projects.getUserProjects) || [];
  const [selectedProject, setSelectedProject] = useState<Id<"projects"> | undefined>(projectId);
  const projectMembers = useQuery(api.projectMembers.getProjectMembers, 
    selectedProject ? { projectId: selectedProject } : "skip"
  ) || [];
  
  // Initialize due date from selectedDate prop if provided
  useEffect(() => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setDueDate(`${year}-${month}-${day}`);
    }
  }, [selectedDate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      setError("Title is required");
      return;
    }
    
    if (!selectedProject) {
      setError("Please select a project");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      // Convert date string to timestamp
      let dueDateTimestamp: number | undefined = undefined;
      if (dueDate) {
        dueDateTimestamp = new Date(dueDate).getTime();
      }
      
      await createTask({
        projectId: selectedProject,
        title,
        description,
        priority,
        effort,
        category,
        status,
        dueDate: dueDateTimestamp,
        assignedTo: assignedTo || undefined
      });
      
      setSuccess(true);
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div 
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700/50 animate-in slide-in-from-bottom-4 duration-300"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)"
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl z-10 flex justify-between items-center p-6 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text">
              Create New Task
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-green-200 text-sm">Task created successfully!</p>
            </div>
          )}
          
          {/* Project Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Project</label>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={selectedProject as string || ""}
              onChange={(e) => setSelectedProject(e.target.value as Id<"projects">)}
              required
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Task title"
              required
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
              placeholder="Task description"
            />
          </div>
          
          {/* Due Date */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Status, Priority, Effort */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "todo" | "in_progress" | "completed" | "blocked")}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Effort</label>
              <select
                value={effort}
                onChange={(e) => setEffort(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          
          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Core">Core</option>
              <option value="UI">UI</option>
              <option value="Backend">Backend</option>
              <option value="Bug">Bug</option>
              <option value="Enhancement">Enhancement</option>
              <option value="Documentation">Documentation</option>
            </select>
          </div>
          
          {/* Assigned To */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Assign To
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!selectedProject}
            >
              <option value="">Unassigned</option>
              {projectMembers.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name || member.email}
                </option>
              ))}
            </select>
            {!selectedProject && (
              <p className="text-xs text-slate-400">Select a project to see available members</p>
            )}
          </div>
          
          {/* Footer */}
          <div className="pt-4 border-t border-slate-700/50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || success}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Clock className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : success ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Created!
                </>
              ) : (
                "Create Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
