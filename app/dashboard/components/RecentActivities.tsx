"use client";

import { motion } from "framer-motion";
import { FolderPlus, CheckSquare, Star, Clock, ArrowRight } from "lucide-react";

interface Activity {
  type: string;
  timestamp: number;
  data: any;
  project?: any;
  task?: any;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project_created':
        return FolderPlus;
      case 'task_created':
        return CheckSquare;
      case 'feature_created':
        return Star;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'project_created':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-600 dark:text-blue-400',
          border: 'border-blue-200 dark:border-blue-800'
        };
      case 'task_created':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          text: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-800'
        };
      case 'feature_created':
        return {
          bg: 'bg-purple-100 dark:bg-purple-900/30',
          text: 'text-purple-600 dark:text-purple-400',
          border: 'border-purple-200 dark:border-purple-800'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-700',
          text: 'text-gray-600 dark:text-gray-400',
          border: 'border-gray-200 dark:border-gray-600'
        };
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Activities</h2>
          <div className="p-2 bg-slate-700/50 rounded-lg">
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-slate-400 text-center">
            No recent activities found
          </p>
          <p className="text-sm text-slate-500 text-center mt-1">
            Start creating projects and tasks to see activity here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Recent Activities</h2>
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Clock className="h-5 w-5 text-blue-400" />
        </div>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const colors = getActivityColor(activity.type);
          
          return (
            <motion.div
              key={`${activity.type}-${activity.timestamp}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group flex items-start space-x-4 p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 hover:shadow-md hover:bg-slate-700/50 transition-all duration-300"
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${colors.text}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-white">
                      {activity.type === 'project_created' && 'Project Created'}
                      {activity.type === 'task_created' && 'Task Created'}
                      {activity.type === 'feature_created' && 'Feature Created'}
                    </p>
                    <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                      {activity.type === 'project_created' && (
                        <>Created project <span className="font-semibold">{activity.data.name}</span></>
                      )}
                      {activity.type === 'task_created' && (
                        <>Added task <span className="font-semibold">{activity.data.title}</span></>
                      )}
                      {activity.type === 'feature_created' && (
                        <>Added feature <span className="font-semibold">{activity.data.title}</span></>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <span className="text-xs text-slate-400 font-medium">
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {activities.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-4 border-t border-slate-700/50 text-center"
        >
          <button className="inline-flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
            <span>View All Activities</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
