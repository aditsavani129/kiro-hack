"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertCircle, Play, Target } from "lucide-react";

interface TasksOverviewProps {
  totalTasks: number;
  tasksByStatus: {
    todo: number;
    in_progress: number;
    completed: number;
    blocked: number;
  };
}

export default function TasksOverview({
  totalTasks,
  tasksByStatus,
}: TasksOverviewProps) {
  const completionRate = totalTasks > 0 ? Math.round((tasksByStatus.completed / totalTasks) * 100) : 0;
  
  const taskData = [
    { 
      name: 'To Do', 
      value: tasksByStatus.todo, 
      color: 'bg-blue-500', 
      icon: Clock,
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    { 
      name: 'In Progress', 
      value: tasksByStatus.in_progress, 
      color: 'bg-amber-500', 
      icon: Play,
      textColor: 'text-amber-600 dark:text-amber-400'
    },
    { 
      name: 'Completed', 
      value: tasksByStatus.completed, 
      color: 'bg-emerald-500', 
      icon: CheckCircle,
      textColor: 'text-emerald-600 dark:text-emerald-400'
    },
    { 
      name: 'Blocked', 
      value: tasksByStatus.blocked, 
      color: 'bg-red-500', 
      icon: AlertCircle,
      textColor: 'text-red-600 dark:text-red-400'
    },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Tasks Overview</h2>
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <Target className="h-5 w-5 text-emerald-400" />
        </div>
      </div>
      
      {/* Total Tasks Display */}
      <div className="text-center mb-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="text-4xl font-bold text-white mb-2"
        >
          {totalTasks}
        </motion.div>
        <p className="text-sm text-slate-400">Total Tasks</p>
      </div>
      
      {/* Task Status Bars */}
      <div className="space-y-5">
        {taskData.map((task, index) => {
          const Icon = task.icon;
          const percentage = totalTasks > 0 ? (task.value / totalTasks) * 100 : 0;
          
          return (
            <motion.div
              key={task.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${task.textColor}`} />
                  <span className="text-sm font-medium text-slate-300">
                    {task.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-white">
                    {task.value}
                  </span>
                  <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
                    ({Math.round(percentage)}%)
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  className={`${task.color} h-full rounded-full relative`}
                >
                  {percentage > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full"></div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Completion Rate Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 pt-6 border-t border-slate-700/50"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-slate-300">
              Completion Rate
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-400">
              {completionRate}%
            </div>
          </div>
        </div>
        
        {/* Completion Rate Progress */}
        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1.5, delay: 1 }}
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full"
          />
        </div>
        
        <div className="mt-2 text-xs text-slate-400 text-center">
          {tasksByStatus.completed} of {totalTasks} tasks completed
        </div>
      </motion.div>
    </div>
  );
}
