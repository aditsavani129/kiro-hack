"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2, TrendingUp, Users, Calendar, Zap } from "lucide-react";
import { motion } from "framer-motion";

// Dashboard components
import ProjectsOverview from "./components/ProjectsOverview";
import TasksOverview from "./components/TasksOverview";
import RecentActivities from "./components/RecentActivities";
import ProjectsByCategory from "./components/ProjectsByCategory";
import FeatureStats from "./components/FeatureStats";

export default function Dashboard() {
    const { user, isLoaded: isUserLoaded } = useUser();
    const [userId, setUserId] = useState<string | null>(null);
    
    useEffect(() => {
        if (isUserLoaded && user) {
            setUserId(user.id);
        }
    }, [isUserLoaded, user]);
    
    // Fetch dashboard stats only when we have a userId
    const dashboardStats = useQuery(
        api.dashboard.getDashboardStats, 
        userId ? { userId } : "skip"
    );
    
    const recentActivities = useQuery(
        api.dashboard.getRecentActivities, 
        userId ? { userId, limit: 5 } : "skip"
    );
    
    const projectStatsByCategory = useQuery(
        api.dashboard.getProjectStatsByCategory, 
        userId ? { userId } : "skip"
    );
    
    const featureStats = useQuery(
        api.dashboard.getFeatureStats, 
        userId ? { userId } : "skip"
    );
    
    const isLoading = !isUserLoaded || !userId || !dashboardStats || !recentActivities || !projectStatsByCategory || !featureStats;
    
    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                                Dashboard
                            </h1>
                            <p className="text-slate-400 mt-2">
                                Welcome back! Here's what's happening with your projects.
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}</span>
                        </div>
                    </div>
                </motion.div>
                
                {isLoading ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center h-96"
                    >
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-violet-200/30 rounded-full animate-pulse"></div>
                                <Loader2 className="h-8 w-8 animate-spin text-violet-400 absolute top-4 left-4" />
                            </div>
                            <div className="text-lg font-medium text-slate-200">
                                {!isUserLoaded || !userId ? "Loading user data..." : "Loading dashboard data..."}
                            </div>
                            <div className="text-sm text-slate-400">
                                Preparing your personalized insights...
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-8"
                    >
                        {/* Quick Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-400">Total Projects</p>
                                        <p className="text-3xl font-bold text-white mt-2">
                                            {dashboardStats.totalProjects}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-violet-500/20 rounded-xl">
                                        <TrendingUp className="h-6 w-6 text-violet-400" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-emerald-400 font-medium">
                                        {dashboardStats.projectsByStatus.active} active
                                    </span>
                                    <span className="text-slate-400 ml-2">projects</span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-400">Total Tasks</p>
                                        <p className="text-3xl font-bold text-white mt-2">
                                            {dashboardStats.totalTasks}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                                        <Zap className="h-6 w-6 text-emerald-400" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-cyan-400 font-medium">
                                        {Math.round((dashboardStats.tasksByStatus.completed / dashboardStats.totalTasks) * 100) || 0}%
                                    </span>
                                    <span className="text-slate-400 ml-2">completed</span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-400">Collaborating</p>
                                        <p className="text-3xl font-bold text-white mt-2">
                                            {dashboardStats.memberProjectsCount}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-orange-500/20 rounded-xl">
                                        <Users className="h-6 w-6 text-orange-400" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-orange-400 font-medium">
                                        Team projects
                                    </span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-slate-400">Completed</p>
                                        <p className="text-3xl font-bold text-white mt-2">
                                            {dashboardStats.projectsByStatus.completed}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-cyan-500/20 rounded-xl">
                                        <TrendingUp className="h-6 w-6 text-cyan-400" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center text-sm">
                                    <span className="text-cyan-400 font-medium">
                                        Projects done
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Main Dashboard Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Projects Overview - Takes 2 columns */}
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="lg:col-span-2"
                            >
                                <ProjectsOverview 
                                    totalProjects={dashboardStats.totalProjects}
                                    projectsByStatus={dashboardStats.projectsByStatus}
                                    memberProjectsCount={dashboardStats.memberProjectsCount}
                                />
                            </motion.div>
                            
                            {/* Tasks Overview */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <TasksOverview 
                                    totalTasks={dashboardStats.totalTasks}
                                    tasksByStatus={dashboardStats.tasksByStatus}
                                />
                            </motion.div>
                        </div>

                        {/* Second Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Recent Activities - Takes 2 columns */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="lg:col-span-2"
                            >
                                <RecentActivities activities={recentActivities} />
                            </motion.div>
                            
                            {/* Projects by Category */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <ProjectsByCategory categories={projectStatsByCategory} />
                            </motion.div>
                        </div>

                        {/* Feature Stats - Full Width */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <FeatureStats stats={featureStats} />
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}