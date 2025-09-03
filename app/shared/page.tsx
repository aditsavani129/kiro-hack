"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";
import { 
  Users, 
  Share2, 
  Clock, 
  Calendar, 
  Crown, 
  Shield, 
  Eye, 
  User,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Activity,
  Star,
  ExternalLink
} from "lucide-react";

export default function SharedProjectsPage() {
  const router = useRouter();
  
  // Get projects shared with the current user
  const sharedProjects = useQuery(api.members.getSharedProjects) || [];
  
  // Function to format date
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner': return Crown;
      case 'admin': return Shield;
      case 'viewer': return Eye;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner': return 'bg-amber-600';
      case 'admin': return 'bg-purple-600';
      case 'viewer': return 'bg-emerald-600';
      default: return 'bg-blue-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500";
      case "completed": return "bg-blue-500";
      case "archived": return "bg-slate-500";
      default: return "bg-amber-500";
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 rounded-xl bg-blue-600 shadow-lg">
              <Share2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-blue-400">
                Shared Projects
              </h1>
              <p className="text-slate-400 mt-1">
                Collaborate on projects shared with you by team members
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Share2 className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{sharedProjects.length}</div>
                  <div className="text-sm text-slate-400">Shared Projects</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Activity className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {sharedProjects.filter(p => p.status === 'active').length}
                  </div>
                  <div className="text-sm text-slate-400">Active Projects</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {Math.round(sharedProjects.reduce((acc, p) => acc + (p.currentStep / p.totalSteps * 100), 0) / sharedProjects.length) || 0}%
                  </div>
                  <div className="text-sm text-slate-400">Avg Progress</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6"
        >
          {sharedProjects.length === 0 ? (
            <div className="text-center py-16">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                  <Share2 className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Shared Projects</h3>
                <p className="text-slate-400 mb-4 max-w-md">
                  You haven't been invited to any projects yet. When team members share projects with you, they'll appear here.
                </p>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Sparkles className="h-4 w-4" />
                  <span>Start collaborating with your team!</span>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sharedProjects.map((project, index) => {
                const percent = Math.min(
                  100,
                  Math.round((project.currentStep / project.totalSteps) * 100)
                );
                
                // Get the role from membersWithRole
                const membersWithRole = project.membersWithRole as Record<string, string> || {};
                const currentUserRole = Object.values(membersWithRole)[0] || "member";
                const RoleIcon = getRoleIcon(currentUserRole);
                
                return (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="group bg-slate-700/30 rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-500/10 relative overflow-hidden"
                    onClick={() => router.push(`/shared/${project._id}`)}
                  >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Role Badge */}
                    <div className={`absolute top-4 right-4 flex items-center space-x-1 px-3 py-1 rounded-full ${getRoleColor(currentUserRole)} text-white text-xs font-semibold shadow-lg`}>
                      <RoleIcon className="h-3 w-3" />
                      <span className="capitalize">{currentUserRole}</span>
                    </div>
                    
                    <div className="relative z-10">
                      {/* Project Header */}
                      <div className="mb-4 pr-20">
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
                          {project.name || "Untitled Project"}
                        </h3>
                        <div className="flex items-center text-sm text-slate-400 mt-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Created {formatDate(project.lastDraftSave)}</span>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="flex items-center mb-4">
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(project.status)} mr-2`} />
                        <span className="text-sm text-slate-300 capitalize">{project.status}</span>
                        <div className="ml-auto flex items-center text-xs text-slate-400">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          <span>{percent}%</span>
                        </div>
                      </div>
                      
                      {/* Description */}
                      {project.description && (
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                            className={`${getStatusColor(project.status)} h-full rounded-full relative`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full" />
                          </motion.div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>{project.currentStep} of {project.totalSteps} steps</span>
                          <span>{percent}% complete</span>
                        </div>
                      </div>
                      
                      {/* Action */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-slate-400">
                          <Users className="h-4 w-4 mr-1" />
                          <span>Collaborative</span>
                        </div>
                        <div className="flex items-center text-sm text-blue-400 group-hover:text-blue-300 font-medium">
                          <span>Open Project</span>
                          <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
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
