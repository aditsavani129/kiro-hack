"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import CreateTaskModal from "../components/CreateTaskModal";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Tag,
  Target,
  CheckCircle,
  AlertCircle,
  X,
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Search,
  Grid3X3,
  List,
  Star,
  Zap,
  TrendingUp,
  Eye,
  Edit,
  MoreVertical,
  Users,
  Bell,
  Check,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  Activity,
  Sparkles,
} from "lucide-react";

// Enhanced Task Modal Component
function TaskModal({ task, onClose }: { task: any; onClose: () => void }) {
  if (!task) return null;
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>(task.assignedTo || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const updateTaskAssignment = useMutation(api.tasks.updateTaskAssignment);
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const projectMembers = useQuery(
    api.projectMembers.getProjectMembers, 
    task.projectId ? { projectId: task.projectId } : "skip"
  ) || [];
  
  const assignedUser = projectMembers.find(member => member.userId === task.assignedTo);
  
  const handleAssignmentUpdate = async () => {
    if (selectedMember === task.assignedTo) {
      setIsEditing(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateTaskAssignment({
        taskId: task._id,
        assignedTo: selectedMember || undefined
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task assignment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "Low": return "bg-green-500";
      case "Medium": return "bg-blue-500";
      case "High": return "bg-rose-500";
      case "Critical": return "bg-rose-600";
      default: return "bg-slate-500";
    }
  };
  
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "todo": return "bg-slate-500 text-slate-50";
      case "in_progress": return "bg-blue-500 text-slate-50";
      case "completed": return "bg-green-500 text-slate-50";
      case "blocked": return "bg-rose-500 text-slate-50";
      default: return "bg-slate-500 text-slate-50";
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-700"
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-800 z-10 flex justify-between items-center p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${getPriorityColor(task.priority)} animate-pulse`}></div>
              <h2 className="text-xl font-bold text-white">{task.title}</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                <div className="text-sm text-slate-400 mb-2 flex items-center">
                  <Zap className="h-4 w-4 mr-1" />
                  Priority
                </div>
                <div className="flex items-center">
                  <div className={`h-3 w-3 rounded-full ${getPriorityColor(task.priority)} mr-2`}></div>
                  <span className="font-semibold text-white">{task.priority || "Medium"}</span>
                </div>
              </div>
              
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                <div className="text-sm text-slate-400 mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Status
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {(task.status || "todo").replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                <div className="text-sm text-slate-400 mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  Effort
                </div>
                <div className="font-semibold text-white">{task.effort || "Medium"}</div>
              </div>
              
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                <div className="text-sm text-slate-400 mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Category
                </div>
                <div className="font-semibold text-white">{task.category || "Core"}</div>
              </div>
            </div>
            
            {task.dueDate && (
              <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                <div className="text-sm text-blue-300 mb-2 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Due Date
                </div>
                <div className="font-semibold text-white">{formatDate(task.dueDate)}</div>
              </div>
            )}
            
            {/* Description */}
            <div className="space-y-3">
              <div className="text-sm text-slate-400 flex items-center">
                <List className="h-4 w-4 mr-1" />
                Description
              </div>
              <div className="bg-slate-700 border border-slate-600 p-4 rounded-xl min-h-[100px]">
                <p className="text-slate-300 leading-relaxed">
                  {task.description || "No description provided."}
                </p>
              </div>
            </div>
            
            {/* Assignment Section */}
            <div className="space-y-3">
              <div className="text-sm text-slate-400 flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Assigned To
                </div>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Change
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={handleAssignmentUpdate}
                      disabled={isSubmitting}
                      className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Save
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedMember(task.assignedTo || "");
                      }}
                      className="text-xs text-slate-400 hover:text-slate-300 flex items-center"
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {!isEditing ? (
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                  {task.assignedTo && assignedUser ? (
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full mr-3 bg-blue-500 flex items-center justify-center text-white font-medium">
                        {assignedUser.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="text-white font-medium">{assignedUser.name}</div>
                        <div className="text-xs text-slate-400">{assignedUser.role}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic">Unassigned</div>
                  )}
                </div>
              ) : (
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.name || member.email}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t border-slate-700 p-6 flex justify-between items-center bg-slate-800">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Clock className="h-4 w-4" />
              <span>Created: {new Date(task._creationTime).toLocaleDateString()}</span>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Mini Calendar Component
function MiniCalendar({ currentDate, onDateChange }: { currentDate: Date; onDateChange: (date: Date) => void }) {
  const [miniDate, setMiniDate] = useState(new Date());
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const generateMiniCalendar = () => {
    const year = miniDate.getFullYear();
    const month = miniDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const today = new Date();
    const selectedDay = currentDate.getDate();
    const selectedMonth = currentDate.getMonth();
    const selectedYear = currentDate.getFullYear();
    
    const days = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
      const isSelected = selectedDay === day && selectedMonth === month && selectedYear === year;
      
      days.push(
        <button
          key={`day-${day}`}
          onClick={() => onDateChange(new Date(year, month, day))}
          className={`h-8 w-8 text-sm rounded-lg transition-all duration-200 hover:bg-slate-700 ${
            isToday ? 'bg-blue-500 text-white font-bold' : 
            isSelected ? 'bg-rose-500 text-white border border-rose-500' :
            'text-slate-300 hover:text-white'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };
  
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setMiniDate(new Date(miniDate.getFullYear(), miniDate.getMonth() - 1, 1))}
          className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-semibold text-slate-50">
          {miniDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </h3>
        <button
          onClick={() => setMiniDate(new Date(miniDate.getFullYear(), miniDate.getMonth() + 1, 1))}
          className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="h-6 flex items-center justify-center text-xs text-slate-400 font-medium">
            {day.charAt(0)}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {generateMiniCalendar()}
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, color, trend }: { 
  title: string; 
  value: number; 
  icon: any; 
  color: string;
  trend?: number;
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        {trend && (
          <span className={`text-xs px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500 text-white' : 'bg-rose-500 text-white'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-50 mb-1">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
    </div>
  );
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedDateForNewTask, setSelectedDateForNewTask] = useState<Date | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  const tasks = useQuery(api.tasks.getAllTasks) || [];
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus && task.dueDate;
  });
  
  // Calculate stats
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.status === "completed").length;
  const inProgressTasks = filteredTasks.filter(task => task.status === "in_progress").length;
  const overdueTasks = filteredTasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed"
  ).length;
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const getPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const getNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  const formatDateYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const getTasksForDate = (year: number, month: number, day: number) => {
    const startOfDay = new Date(year, month, day, 0, 0, 0).getTime();
    const endOfDay = new Date(year, month, day, 23, 59, 59, 999).getTime();
    
    return filteredTasks.filter(task => {
      const taskDate = task.dueDate;
      return taskDate !== undefined && taskDate >= startOfDay && taskDate <= endOfDay;
    });
  };
  
  const getPriorityGradient = (priority: string | undefined) => {
    switch (priority) {
      case "Low": return "bg-green-500";
      case "Medium": return "bg-blue-500";
      case "High": return "bg-rose-500";
      case "Critical": return "bg-rose-600";
      default: return "bg-slate-500";
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-slate-500";
      case "in_progress": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case "blocked": return "bg-rose-500";
      default: return "bg-slate-500";
    }
  };
  
  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "todo": return <AlertCircle className="h-3 w-3" />;
      case "in_progress": return <Clock className="h-3 w-3" />;
      case "completed": return <CheckCircle className="h-3 w-3" />;
      case "blocked": return <AlertCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };
  
  const generateCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-40 border border-slate-700 bg-slate-900"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = formatDateYYYYMMDD(date) === formatDateYYYYMMDD(new Date());
      const tasksForDay = getTasksForDate(year, month, day);
      const hasOverdue = tasksForDay.some(task => 
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed"
      );
      
      days.push(
        <motion.div 
          key={`day-${day}`} 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: day * 0.01 }}
          className={`h-40 border border-slate-700 bg-slate-800 p-3 overflow-hidden transition-all duration-200 hover:bg-slate-700 hover:border-slate-600 group ${
            isToday ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''
          } ${hasOverdue ? 'ring-1 ring-rose-500' : ''}`}
        >
          <div className="flex justify-between items-center mb-3">
            <span 
              className={`text-lg font-bold transition-colors ${
                isToday ? 'text-blue-400' : 'text-slate-300'
              } cursor-pointer hover:text-blue-300 flex items-center`}
              onClick={() => {
                setSelectedDateForNewTask(new Date(year, month, day));
                setShowCreateTaskModal(true);
              }}
              title="Create task for this day"
            >
              {day}
              <Plus className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 hover:opacity-100" />
            </span>
            <div className="flex items-center space-x-1">
              {hasOverdue && <div className="h-2 w-2 bg-rose-500 rounded-full animate-pulse"></div>}
              {tasksForDay.length > 0 && (
                <span className="text-xs px-2 py-1 bg-slate-800 rounded-full text-slate-300 border border-slate-600">
                  {tasksForDay.length}
                </span>
              )}
              <button 
                className="p-1 rounded-full bg-slate-800 hover:bg-blue-500 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 hover:opacity-100 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDateForNewTask(new Date(year, month, day));
                  setShowCreateTaskModal(true);
                }}
                title="Add task"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
          
          <div className="space-y-2 overflow-y-auto max-h-28 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
            {tasksForDay.slice(0, 3).map(task => (
              <motion.div 
                key={task._id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-2.5 rounded-lg ${getPriorityGradient(task.priority)} shadow-lg text-white text-xs transform transition-all duration-200 hover:scale-105 cursor-pointer relative overflow-hidden group border border-white/10`}
                onClick={() => setSelectedTask(task)}
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold truncate flex-1 mr-2">{task.title}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(task.status || 'todo')} ring-1 ring-white/30 flex-shrink-0`}></span>
                  </div>
                  <div className="flex items-center gap-1 text-white/80 text-[10px]">
                    {getStatusIcon(task.status)}
                    <span className="capitalize">{task.status?.replace('_', ' ') || 'todo'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {tasksForDay.length > 3 && (
              <div className="text-center">
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
                  +{tasksForDay.length - 3} more
                </span>
              </div>
            )}
          </div>
        </motion.div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="min-h-screen">
      {selectedTask && <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
      {showCreateTaskModal && (
        <CreateTaskModal 
          onClose={() => setShowCreateTaskModal(false)} 
          selectedDate={selectedDateForNewTask}
          projectId={tasks.length > 0 ? tasks[0].projectId : undefined}
        />
      )}
      
      <div className="flex">
        {/* Enhanced Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              className="w-80 bg-slate-800 border-r border-slate-700 p-6 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-blue-500 shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">Calendar</h2>
                </div>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatsCard 
                  title="Total Tasks" 
                  value={totalTasks} 
                  icon={List} 
                  color="bg-blue-500" 
                  trend={5}
                />
                <StatsCard 
                  title="Completed" 
                  value={completedTasks} 
                  icon={CheckCircle} 
                  color="bg-emerald-500" 
                  trend={12}
                />
                <StatsCard 
                  title="In Progress" 
                  value={inProgressTasks} 
                  icon={Clock} 
                  color="bg-amber-500" 
                  trend={-3}
                />
                <StatsCard 
                  title="Overdue" 
                  value={overdueTasks} 
                  icon={AlertCircle} 
                  color="bg-red-500" 
                  trend={-8}
                />
              </div>
              
              {/* Mini Calendar */}
              <MiniCalendar currentDate={currentDate} onDateChange={setCurrentDate} />
              
              {/* Filters */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Priority</label>
                    <select 
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Priorities</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-400 mb-2 block">Status</label>
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-4">
              {!sidebarOpen && (
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                  <Calendar className="h-5 w-5" />
                </button>
              )}
              
              <div className="flex items-center space-x-4">
                <button 
                  onClick={getPreviousMonth}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                
                <h1 className="text-3xl font-bold text-slate-50">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h1>
                
                <button 
                  onClick={getNextMonth}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-slate-800 rounded-xl p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateTaskModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </motion.button>
            </div>
          </motion.div>
          
          {/* Calendar Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden"
          >
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 bg-slate-800">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="p-4 text-center font-semibold text-slate-300 border-b border-slate-700">
                  <div className="hidden sm:block">{day}</div>
                  <div className="sm:hidden">{day.slice(0, 3)}</div>
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {generateCalendarGrid()}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}