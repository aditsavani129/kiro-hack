"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "../../../convex/_generated/dataModel";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Loader2,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  Edit,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

// Define task status types
type TaskStatus = "todo" | "in_progress" | "completed" | "blocked";

// Define task type
type Task = {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: TaskStatus;
  position: number;
  priority?: string;
  effort?: string;
  category?: string;
  projectId: Id<"projects">;
  featureId: Id<"features">;
};

// Define column type
type Column = {
  id: TaskStatus;
  title: string;
  tasks: Task[];
};

export default function KanbanBoard() {
  const { projectId } = useParams();
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  
  // State for tasks and columns
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Fetch project data
  const project = useQuery(api.projects.getProject, {
    projectId: projectId as Id<"projects">,
  });
  
  // Fetch tasks for the project
  const tasks = useQuery(api.tasks.getProjectTasks, 
    project ? { projectId: projectId as Id<"projects"> } : "skip"
  );
  
  // Mutations
  const updateTaskStatus = useMutation(api.tasks.updateTaskStatus);
  const updateTaskPosition = useMutation(api.tasks.updateTaskPosition);
  
  // Initialize columns when tasks are loaded
  useEffect(() => {
    if (tasks) {
      setIsLoading(false);
      
      // Group tasks by status
      const todoTasks = tasks.filter(task => task.status === "todo").sort((a, b) => a.position - b.position);
      const inProgressTasks = tasks.filter(task => task.status === "in_progress").sort((a, b) => a.position - b.position);
      const completedTasks = tasks.filter(task => task.status === "completed").sort((a, b) => a.position - b.position);
      const blockedTasks = tasks.filter(task => task.status === "blocked").sort((a, b) => a.position - b.position);
      
      // Create columns
      setColumns([
        { id: "todo", title: "To Do", tasks: todoTasks },
        { id: "in_progress", title: "In Progress", tasks: inProgressTasks },
        { id: "completed", title: "Completed", tasks: completedTasks },
        { id: "blocked", title: "Blocked", tasks: blockedTasks },
      ]);
    }
  }, [tasks]);
  
  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);
  
  // Handle drag end event
  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;
    
    // If no destination or same position, do nothing
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Find the task that was dragged
    const taskId = draggableId;
    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);
    
    if (!sourceColumn || !destColumn) return;
    
    // Create a new array of columns
    const newColumns = [...columns];
    
    // If moving within the same column
    if (source.droppableId === destination.droppableId) {
      const column = newColumns.find(col => col.id === source.droppableId);
      if (!column) return;
      
      // Reorder tasks in the column
      const newTasks = Array.from(column.tasks);
      const [movedTask] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, movedTask);
      
      // Update positions
      const updatedTasks = newTasks.map((task, index) => ({
        ...task,
        position: index
      }));
      
      // Update column
      column.tasks = updatedTasks;
      setColumns(newColumns);
      
      // Update task position in database
      try {
        await updateTaskPosition({
          taskId: taskId as Id<"tasks">,
          newPosition: destination.index
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    } 
    // If moving to a different column
    else {
      // Find the task
      const sourceColumnTasks = Array.from(sourceColumn.tasks);
      const [movedTask] = sourceColumnTasks.splice(source.index, 1);
      
      // Update source column
      sourceColumn.tasks = sourceColumnTasks.map((task, index) => ({
        ...task,
        position: index
      }));
      
      // Update destination column
      const destColumnTasks = Array.from(destColumn.tasks);
      destColumnTasks.splice(destination.index, 0, {
        ...movedTask,
        status: destination.droppableId as TaskStatus
      });
      
      destColumn.tasks = destColumnTasks.map((task, index) => ({
        ...task,
        position: index
      }));
      
      // Update columns state
      setColumns(newColumns);
      
      // Update task status and position in database
      try {
        await updateTaskStatus({
          taskId: taskId as Id<"tasks">,
          newStatus: destination.droppableId as TaskStatus,
          newPosition: destination.index
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  };
  
  // Open task modal
  const openTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };
  
  // Close task modal
  const closeTaskModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(false);
  };
  
  // Update task status from modal
  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!selectedTask) return;
    
    try {
      await updateTaskStatus({
        taskId: selectedTask._id,
        newStatus,
        newPosition: 0 // Add to the top of the new column
      });
      
      // Close modal after update
      closeTaskModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return <Clock className="h-4 w-4 text-blue-400" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "blocked":
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };
  
  // Get status color
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return "bg-blue-900/20 border-blue-700";
      case "in_progress":
        return "bg-yellow-900/20 border-yellow-700";
      case "completed":
        return "bg-green-900/20 border-green-700";
      case "blocked":
        return "bg-red-900/20 border-red-700";
      default:
        return "bg-gray-800 border-gray-700";
    }
  };
  
  // Get column header color
  const getColumnHeaderColor = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return "bg-blue-900/30 border-blue-700";
      case "in_progress":
        return "bg-yellow-900/30 border-yellow-700";
      case "completed":
        return "bg-green-900/30 border-green-700";
      case "blocked":
        return "bg-red-900/30 border-red-700";
      default:
        return "bg-gray-800 border-gray-700";
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading Kanban board...</span>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{project?.name || "Project"} Kanban Board</h1>
          <p className="text-gray-400">{project?.description || "Task management board"}</p>
        </div>
        <button
          onClick={() => router.push(`/shared/`)}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg flex items-center text-sm font-medium transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Project
        </button>
      </div>
      
      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <div key={column.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
              {/* Column Header */}
              <div className={`p-4 ${getColumnHeaderColor(column.id as TaskStatus)} border-b flex items-center justify-between`}>
                <div className="flex items-center">
                  {getStatusIcon(column.id as TaskStatus)}
                  <h3 className="font-semibold ml-2">{column.title}</h3>
                  <span className="ml-2 bg-gray-700 text-xs px-2 py-1 rounded-full">{column.tasks.length}</span>
                </div>
              </div>
              
              {/* Column Content - Droppable */}
              <Droppable droppableId={column.id}>
                {(provided: any, snapshot: any) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 overflow-y-auto ${snapshot.isDraggingOver ? "bg-gray-700/30" : ""}`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided: any, snapshot: any) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 p-4 rounded-lg border ${getStatusColor(task.status)} ${snapshot.isDragging ? "shadow-xl ring-2 ring-blue-500" : ""} cursor-grab`}
                            onClick={() => openTaskModal(task)}
                          >
                            <h4 className="font-medium mb-2">{task.title}</h4>
                            <p className="text-sm text-gray-400 line-clamp-2">
                              {task.description || "No description provided"}
                            </p>
                            
                            {/* Task Metadata */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {task.priority && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                                  {task.priority}
                                </span>
                              )}
                              {task.effort && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                                  {task.effort}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
      
      {/* Task Detail Modal */}
      {isTaskModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold">Task Details</h3>
              <button onClick={closeTaskModal} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedTask.title}</h2>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                <p className="bg-gray-900 rounded-lg p-4">
                  {selectedTask.description || "No description provided"}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Status</h4>
                  <div className="flex items-center">
                    {getStatusIcon(selectedTask.status)}
                    <span className="ml-2">{selectedTask.status.replace("_", " ").charAt(0).toUpperCase() + selectedTask.status.replace("_", " ").slice(1)}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Priority</h4>
                  <span>{selectedTask.priority || "Not set"}</span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Effort</h4>
                  <span>{selectedTask.effort || "Not set"}</span>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Category</h4>
                  <span>{selectedTask.category || "Not set"}</span>
                </div>
              </div>
              
              {/* Status Change */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Change Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleStatusChange("todo")}
                    className={`p-2 rounded-lg flex items-center justify-center ${selectedTask.status === "todo" ? "bg-blue-700 text-white" : "bg-gray-700 hover:bg-gray-600"}`}
                  >
                    <Clock className="h-4 w-4 mr-1" /> To Do
                  </button>
                  <button
                    onClick={() => handleStatusChange("in_progress")}
                    className={`p-2 rounded-lg flex items-center justify-center ${selectedTask.status === "in_progress" ? "bg-yellow-700 text-white" : "bg-gray-700 hover:bg-gray-600"}`}
                  >
                    <Clock className="h-4 w-4 mr-1" /> In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange("completed")}
                    className={`p-2 rounded-lg flex items-center justify-center ${selectedTask.status === "completed" ? "bg-green-700 text-white" : "bg-gray-700 hover:bg-gray-600"}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Completed
                  </button>
                  <button
                    onClick={() => handleStatusChange("blocked")}
                    className={`p-2 rounded-lg flex items-center justify-center ${selectedTask.status === "blocked" ? "bg-red-700 text-white" : "bg-gray-700 hover:bg-gray-600"}`}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" /> Blocked
                  </button>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end p-4 border-t border-gray-700 bg-gray-900">
              <button
                onClick={closeTaskModal}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg mr-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}