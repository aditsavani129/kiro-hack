"use client";

import { motion } from "framer-motion";
import { PieChart, Folder } from "lucide-react";

interface ProjectsByCategoryProps {
  categories: Record<string, number>;
}

export default function ProjectsByCategory({ categories }: ProjectsByCategoryProps) {
  // Enhanced color palette with gradients
  const getColorClasses = (index: number) => {
    const colorOptions = [
      { bg: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600', text: 'text-blue-600 dark:text-blue-400' },
      { bg: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', text: 'text-emerald-600 dark:text-emerald-400' },
      { bg: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600', text: 'text-amber-600 dark:text-amber-400' },
      { bg: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600', text: 'text-purple-600 dark:text-purple-400' },
      { bg: 'bg-pink-500', gradient: 'from-pink-500 to-pink-600', text: 'text-pink-600 dark:text-pink-400' },
      { bg: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600', text: 'text-indigo-600 dark:text-indigo-400' },
      { bg: 'bg-red-500', gradient: 'from-red-500 to-red-600', text: 'text-red-600 dark:text-red-400' },
      { bg: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600', text: 'text-orange-600 dark:text-orange-400' },
    ];
    return colorOptions[index % colorOptions.length];
  };

  // Calculate total for percentages
  const total = Object.values(categories).reduce((sum, count) => sum + count, 0);

  // Convert to array for easier rendering
  const categoriesArray = Object.entries(categories).map(([name, count], index) => ({
    name,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    colors: getColorClasses(index),
  }));

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Projects by Category</h2>
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <PieChart className="h-5 w-5 text-purple-400" />
        </div>
      </div>
      
      {categoriesArray.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Folder className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No categories found
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-1">
            Create projects with categories to see distribution
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {categoriesArray.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${category.colors.bg} rounded-full shadow-sm`}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {category.count}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {category.percentage}%
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${category.percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                  className={`bg-gradient-to-r ${category.colors.gradient} h-full rounded-full relative group-hover:shadow-lg transition-shadow duration-300`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full"></div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Folder className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Total Categories
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {categoriesArray.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {total} projects
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
