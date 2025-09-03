"use client";

import { motion } from "framer-motion";
import { Zap, AlertTriangle, Clock, Tag, TrendingUp } from "lucide-react";

interface FeatureStatsProps {
  stats: {
    byPriority: Record<string, number>;
    byEffort: Record<string, number>;
    byCategory: Record<string, number>;
  };
}

export default function FeatureStats({ stats }: FeatureStatsProps) {
  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Feature Statistics</h2>
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Zap className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No feature statistics available
          </p>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalByPriority = Object.values(stats.byPriority).reduce((sum, count) => sum + count, 0);
  const totalByEffort = Object.values(stats.byEffort).reduce((sum, count) => sum + count, 0);
  const totalByCategory = Object.values(stats.byCategory).reduce((sum, count) => sum + count, 0);

  // Get priority order with enhanced styling
  const priorityOrder = ["Critical", "High", "Medium", "Low"];
  const effortOrder = ["Small", "Medium", "Large", "XL"];

  // Enhanced color maps with gradients and icons
  const priorityConfig: Record<string, { color: string; gradient: string; icon: any; textColor: string }> = {
    Critical: { 
      color: "bg-red-500", 
      gradient: "from-red-500 to-red-600", 
      icon: AlertTriangle,
      textColor: "text-red-600 dark:text-red-400"
    },
    High: { 
      color: "bg-orange-500", 
      gradient: "from-orange-500 to-orange-600", 
      icon: TrendingUp,
      textColor: "text-orange-600 dark:text-orange-400"
    },
    Medium: { 
      color: "bg-amber-500", 
      gradient: "from-amber-500 to-amber-600", 
      icon: Clock,
      textColor: "text-amber-600 dark:text-amber-400"
    },
    Low: { 
      color: "bg-blue-500", 
      gradient: "from-blue-500 to-blue-600", 
      icon: Clock,
      textColor: "text-blue-600 dark:text-blue-400"
    },
  };

  const effortConfig: Record<string, { color: string; gradient: string; textColor: string }> = {
    Small: { 
      color: "bg-emerald-500", 
      gradient: "from-emerald-500 to-emerald-600",
      textColor: "text-emerald-600 dark:text-emerald-400"
    },
    Medium: { 
      color: "bg-blue-500", 
      gradient: "from-blue-500 to-blue-600",
      textColor: "text-blue-600 dark:text-blue-400"
    },
    Large: { 
      color: "bg-purple-500", 
      gradient: "from-purple-500 to-purple-600",
      textColor: "text-purple-600 dark:text-purple-400"
    },
    XL: { 
      color: "bg-red-500", 
      gradient: "from-red-500 to-red-600",
      textColor: "text-red-600 dark:text-red-400"
    },
  };

  // Generate colors for categories
  const getCategoryConfig = (index: number) => {
    const configs = [
      { color: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600', textColor: 'text-blue-600 dark:text-blue-400' },
      { color: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', textColor: 'text-emerald-600 dark:text-emerald-400' },
      { color: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600', textColor: 'text-amber-600 dark:text-amber-400' },
      { color: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600', textColor: 'text-purple-600 dark:text-purple-400' },
      { color: 'bg-pink-500', gradient: 'from-pink-500 to-pink-600', textColor: 'text-pink-600 dark:text-pink-400' },
      { color: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600', textColor: 'text-indigo-600 dark:text-indigo-400' },
      { color: 'bg-red-500', gradient: 'from-red-500 to-red-600', textColor: 'text-red-600 dark:text-red-400' },
      { color: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600', textColor: 'text-orange-600 dark:text-orange-400' },
    ];
    return configs[index % configs.length];
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold text-white">Feature Statistics</h2>
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Zap className="h-5 w-5 text-purple-400" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Priority Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">By Priority</h3>
          </div>
          
          {totalByPriority === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
              <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No priority data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {priorityOrder.map((priority, index) => {
                const config = priorityConfig[priority];
                const Icon = config.icon;
                const count = stats.byPriority[priority] || 0;
                const percentage = Math.round((count / totalByPriority) * 100);
                
                return (
                  <motion.div
                    key={priority}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${config.textColor}`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{priority}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.4 }}
                        className={`bg-gradient-to-r ${config.gradient} h-full rounded-full relative`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full"></div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
        
        {/* Effort Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">By Effort</h3>
          </div>
          
          {totalByEffort === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No effort data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {effortOrder.map((effort, index) => {
                const config = effortConfig[effort];
                const count = stats.byEffort[effort] || 0;
                const percentage = Math.round((count / totalByEffort) * 100);
                
                return (
                  <motion.div
                    key={effort}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{effort}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                        className={`bg-gradient-to-r ${config.gradient} h-full rounded-full relative`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full"></div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
        
        {/* Category Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">By Category</h3>
          </div>
          
          {totalByCategory === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-8">
              <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No category data available</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {Object.entries(stats.byCategory).map(([category, count], index) => {
                const config = getCategoryConfig(index);
                const percentage = Math.round((count / totalByCategory) * 100);
                
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                        {category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{count}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.6 }}
                        className={`bg-gradient-to-r ${config.gradient} h-full rounded-full relative`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full"></div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
