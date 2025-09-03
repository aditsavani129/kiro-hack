"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  Users,
  User,
  Shield,
  Eye,
  Crown,
  Loader2,
  Search,
  Filter,
  ChevronDown,
  Mail,
  Briefcase,
  Clock,
  Calendar,
  MoreHorizontal,
  Plus,
  UserPlus,
  Settings,
  TrendingUp,
  Activity,
  Star,
  Zap,
  Globe,
  MapPin,
  Phone,
  ExternalLink,
} from "lucide-react";

// Define types for member data
type UserProfile = {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  userId: string;
};

type ProjectInfo = {
  id: Id<"projects">;
  name: string;
};

type MemberWithRole = {
  userId: string;
  roles: Record<string, string>;
  projects: Record<string, ProjectInfo>;
  profile: UserProfile | null;
};

// Role badge component
const RoleBadge = ({ role }: { role: string }) => {
  const getRoleBadgeStyles = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "member":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "viewer":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return <Crown className="h-3 w-3 mr-1" />;
      case "admin":
        return <Shield className="h-3 w-3 mr-1" />;
      case "member":
        return <User className="h-3 w-3 mr-1" />;
      case "viewer":
        return <Eye className="h-3 w-3 mr-1" />;
      default:
        return <User className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeStyles(
        role
      )}`}
    >
      {getRoleIcon(role)}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
};

export default function Workspace() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [showRoleFilter, setShowRoleFilter] = useState(false);

  // Fetch all members with their roles
  const members = useQuery(api.workspace.getAllMembersWithRoles) as MemberWithRole[] | undefined;

  // Redirect if not signed in
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) router.push("/sign-in");
  }, [isSignedIn, isLoaded, router]);

  // Filter members based on search term and role filter
  const filteredMembers = members
    ? members.filter((member: MemberWithRole) => {
        const profile = member.profile;
        const fullName = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
        const email = profile?.email || "";
        const company = profile?.company || "";
        
        // Search filter
        const matchesSearch =
          searchTerm === "" ||
          fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Role filter
        const matchesRole =
          !roleFilter ||
          Object.values(member.roles).some(
            (role: string) => role.toLowerCase() === roleFilter.toLowerCase()
          );
        
        return matchesSearch && matchesRole;
      })
    : [];

  // Get unique roles for filter dropdown
  const uniqueRoles = members
    ? [...new Set(members.flatMap((member: MemberWithRole) => Object.values(member.roles) as string[]))]
    : [];

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-200/30 rounded-full animate-pulse"></div>
            <Loader2 className="h-8 w-8 animate-spin text-violet-400 absolute top-4 left-4" />
          </div>
          <div className="text-lg font-medium text-slate-200">Loading workspace...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-orange-600 shadow-lg">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-orange-400">
                  My Workspace
                </h1>
                <p className="text-slate-400 mt-1">
                  Manage your projects, teams, and collaborations
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl text-sm font-medium transition-colors border border-slate-700/50"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
              >
                <UserPlus className="h-4 w-4" />
                <span>Invite Members</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              title: "My Projects",
              value: members && members.length > 0 ? Object.keys(members[0].projects).length : 0,
              icon: Building,
              color: "bg-blue-600",
              bgColor: "bg-blue-500/20",
              trend: "+12%"
            },
            {
              title: "Team Members",
              value: filteredMembers.length,
              icon: Users,
              color: "bg-emerald-600",
              bgColor: "bg-emerald-500/20",
              trend: "+5%"
            },
            {
              title: "Admin Roles",
              value: members && members.length > 0
                ? Object.values(members[0].roles).filter((role: string) => role.toLowerCase() === "admin").length
                : 0,
              icon: Shield,
              color: "bg-purple-600",
              bgColor: "bg-purple-500/20",
              trend: "0%"
            },
            {
              title: "Owner Roles",
              value: members && members.length > 0
                ? Object.values(members[0].roles).filter((role: string) => role.toLowerCase() === "owner").length
                : 0,
              icon: Crown,
              color: "bg-amber-600",
              bgColor: "bg-amber-500/20",
              trend: "+2%"
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  {stat.trend}
                </span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.title}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search members, projects, or companies..."
                className="block w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 placeholder-slate-400 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <button
                className="flex items-center justify-between w-full lg:w-48 px-4 py-3 border border-slate-600/50 rounded-xl shadow-sm bg-slate-700/50 text-sm font-medium text-slate-200 hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
                onClick={() => setShowRoleFilter(!showRoleFilter)}
              >
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-slate-400" />
                  {roleFilter || "Filter by role"}
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showRoleFilter ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showRoleFilter && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 mt-2 w-full bg-slate-800/90 backdrop-blur-sm shadow-xl rounded-xl py-2 border border-slate-700/50"
                  >
                    <div
                      className="cursor-pointer hover:bg-slate-700/50 px-4 py-2 text-sm text-slate-200 transition-colors"
                      onClick={() => {
                        setRoleFilter(null);
                        setShowRoleFilter(false);
                      }}
                    >
                      All Roles
                    </div>
                    {uniqueRoles.map((role: string) => (
                      <div
                        key={role}
                        className="cursor-pointer hover:bg-slate-700/50 px-4 py-2 text-sm text-slate-200 transition-colors"
                        onClick={() => {
                          setRoleFilter(role);
                          setShowRoleFilter(false);
                        }}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Members Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 overflow-hidden"
        >
          {filteredMembers.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
              {filteredMembers.map((member: MemberWithRole, index) => {
                const profile = member.profile;
                const fullName = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "Unknown User";
                const email = profile?.email || "No email";
                const company = profile?.company || "Not specified";

                return (
                  <motion.div
                    key={member.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 hover:shadow-lg group"
                  >
                    {/* Member Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        {profile?.firstName ? (
                          <div className="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold text-white">
                              {profile.firstName.charAt(0)}
                              {profile.lastName ? profile.lastName.charAt(0) : ""}
                            </span>
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-slate-600 flex items-center justify-center">
                            <User className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-700"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate">{fullName}</h3>
                        <div className="flex items-center text-sm text-slate-400">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{email}</span>
                        </div>
                      </div>
                      
                      <button className="p-2 rounded-lg hover:bg-slate-600/50 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Company */}
                    <div className="flex items-center text-sm text-slate-400 mb-4">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span>{company}</span>
                    </div>

                    {/* Projects and Roles */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-slate-300">Projects & Roles</h4>
                      <div className="space-y-2">
                        {Object.entries(member.roles).map(([projectId, role]: [string, string]) => {
                          const project = member.projects[projectId];
                          return (
                            <div 
                              key={projectId}
                              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-600/30"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white truncate">
                                  {project?.name || "Unknown Project"}
                                </div>
                              </div>
                              <RoleBadge role={role} />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-600/30">
                      <button className="flex items-center space-x-2 text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors">
                        <Eye className="h-4 w-4" />
                        <span>View Profile</span>
                      </button>
                      <button className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white font-medium transition-colors">
                        <ExternalLink className="h-4 w-4" />
                        <span>Contact</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No members found</h3>
              <p className="text-slate-400 text-center max-w-md">
                {members && members.length > 0
                  ? "No members match your current filters. Try adjusting your search criteria."
                  : "Your workspace is empty. Invite team members to get started."}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
              >
                <UserPlus className="h-4 w-4" />
                <span>Invite Members</span>
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}