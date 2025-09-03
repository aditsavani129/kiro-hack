"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Archive } from "lucide-react";

interface ProjectsOverviewProps {
  totalProjects: number;
  projectsByStatus: {
    draft: number;
    active: number;
    completed: number;
    archived: number;
  };
  memberProjectsCount: number;
}

export default function ProjectsOverview({
  totalProjects,
  projectsByStatus,
  memberProjectsCount,
}: ProjectsOverviewProps) {
  const statusData = [
    { 
      name: 'Active', 
      value: projectsByStatus.active, 
      color: 'bg-emerald-500', 
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      icon: TrendingUp
    },
    { 
      name: 'Draft', 
      value: projectsByStatus.draft, 
      color: 'bg-amber-500', 
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      textColor: 'text-amber-600 dark:text-amber-400',
      icon: BarChart3
    },
    { 
      name: 'Completed', 
      value: projectsByStatus.completed, 
      color: 'bg-blue-500', 
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      icon: TrendingUp
    },
    { 
      name: 'Archived', 
      value: projectsByStatus.archived, 
      color: 'bg-gray-500', 
      bgColor: 'bg-gray-50 dark:bg-gray-700/40',
      textColor: 'text-gray-600 dark:text-gray-400',
      icon: Archive
    },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Projects Overview</h2>
        <div className="p-2 bg-violet-500/20 rounded-lg">
          <BarChart3 className="h-5 w-5 text-violet-400" />
        </div>
      </div>
      
      {/* Status Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statusData.map((status, index) => {
          const Icon = status.icon;
          return (
            <motion.div
              key={status.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30 hover:shadow-md hover:bg-slate-700/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-4 w-4 ${status.textColor}`} />
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {status.name}
                </span>
              </div>
              <div className={`text-2xl font-bold ${status.textColor}`}>
                {status.value}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Progress Visualization */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-white">Status Distribution</h3>
            <span className="text-sm text-slate-400">
              {totalProjects} total projects
            </span>
          </div>
          
          {/* Animated Progress Bar */}
          <div className="relative h-3 w-full bg-slate-700/50 rounded-full overflow-hidden">
            {totalProjects > 0 && (
              <>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(projectsByStatus.active / totalProjects) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full"
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(projectsByStatus.draft / totalProjects) * 100}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="absolute h-full bg-amber-500 rounded-full"
                  style={{ 
                    left: `${(projectsByStatus.active / totalProjects) * 100}%`
                  }}
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(projectsByStatus.completed / totalProjects) * 100}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="absolute h-full bg-blue-500 rounded-full"
                  style={{ 
                    left: `${((projectsByStatus.active + projectsByStatus.draft) / totalProjects) * 100}%`
                  }}
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(projectsByStatus.archived / totalProjects) * 100}%` }}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="absolute h-full bg-gray-500 rounded-full"
                  style={{ 
                    left: `${((projectsByStatus.active + projectsByStatus.draft + projectsByStatus.completed) / totalProjects) * 100}%`
                  }}
                />
              </>
            )}
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4">
            {statusData.map((status) => (
              <motion.div 
                key={status.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-2"
              >
                <div className={`w-3 h-3 ${status.color} rounded-full`}></div>
                <span className="text-sm text-slate-300">
                  {status.name} ({status.value})
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Collaboration Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="pt-4 border-t border-slate-700/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-slate-300">
                Team Collaboration
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-orange-400">
                {memberProjectsCount}
              </div>
              <div className="text-xs text-slate-400">
                projects
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
