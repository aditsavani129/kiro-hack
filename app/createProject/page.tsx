"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  X, 
  UserPlus, 
  Edit2, 
  Check, 
  UserMinus, 
  Trash2,
  Plus,
  Sparkles,
  FolderPlus,
  Calendar,
  Activity,
  TrendingUp,
  Crown,
  Shield,
  Eye,
  User,
  Settings,
  ArrowRight,
  Zap,
  Grid3X3,
  List
} from "lucide-react";
import { toast, Toaster } from "sonner";

export default function CreateProjectPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("member");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const modalRef = useRef<HTMLDivElement>(null);

  const projects = useQuery(api.projects.getProjectsByStatuses, {
    statuses: ["draft", "active", "completed"],
  }) || [];

  const createProject = useMutation(api.projects.createProject);
  const addMember = useMutation(api.members.addMemberToProject);
  const removeMember = useMutation(api.members.removeMemberFromProject);

  const handleCreateProject = async () => {
    setIsCreating(true);
    try {
      const projectId = await createProject();
      router.push(`/createProject/${projectId}`);
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Find the selected project from projects list
  useEffect(() => {
    if (selectedProjectId && projects) {
      const project = projects.find(p => p._id === selectedProjectId);
      setSelectedProject(project);
    }
  }, [selectedProjectId, projects]);
  
  // Get member profiles if we have a selected project
  const membersWithRole = selectedProject?.membersWithRole as Record<string, string> || {};
  const memberIds = Object.keys(membersWithRole);
  const memberProfiles = useQuery(api.userProfiles.getUserProfilesByIds, { userIds: memberIds }) || [];
  
  const openAddMemberModal = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setSelectedProjectId(projectId);
    setMemberEmail("");
    setMemberRole("member");
    setErrorMessage("");
    setEditingMemberId(null);
    setShowModal(true);
  };

  // Handle remove member
  const handleRemoveMember = async (memberId: string) => {
    if (!selectedProjectId) return;
    
    try {
      await removeMember({ 
        projectId: selectedProjectId as any, 
        memberUserId: memberId 
      });
      toast.success("Member removed successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    }
  };
  
  // Handle update role
  const handleUpdateRole = async (memberId: string) => {
    if (!selectedProjectId) return;
    
    try {
      // Use the new updateMemberRole mutation
      const { api } = await import("@/convex/_generated/api");
      await useMutation(api.members.updateMemberRole)({ 
        projectId: selectedProjectId as any, 
        memberUserId: memberId,
        newRole: editingRole 
      });
      
      setEditingMemberId(null);
      toast.success("Role updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update role");
    }
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedProjectId(null);
    setSelectedProject(null);
    setMemberEmail("");
    setMemberRole("member");
    setErrorMessage("");
    setEditingMemberId(null);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail) {
      setErrorMessage("Please enter an email address");
      return;
    }

    if (!selectedProjectId) {
      setErrorMessage("No project selected");
      return;
    }

    setIsAddingMember(true);
    setErrorMessage("");

    try {
      await addMember({
        projectId: selectedProjectId as any, // Type assertion for Convex ID
        memberEmail,
        role: memberRole,
      });
      toast.success("Member added successfully");
      setMemberEmail("");
    } catch (error: any) {
      console.error("Failed to add member:", error);
      setErrorMessage(error.message || "Failed to add member");
      toast.error(error.message || "Failed to add member");
    } finally {
      setIsAddingMember(false);
    }
  };

  // Close modal when clicking outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && e.target instanceof Node && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "from-emerald-500 to-emerald-600";
      case "completed": return "from-blue-500 to-blue-600";
      case "archived": return "from-slate-500 to-slate-600";
      default: return "from-amber-500 to-amber-600";
    }
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
      case 'owner': return 'from-amber-500 to-orange-600';
      case 'admin': return 'from-purple-500 to-indigo-600';
      case 'viewer': return 'from-emerald-500 to-teal-600';
      default: return 'from-blue-500 to-cyan-600';
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
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-purple-600 shadow-lg">
                <FolderPlus className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-purple-400">
                  Your Projects
                </h1>
                <p className="text-slate-400 mt-1">
                  Create and manage your project ideas with AI assistance
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-slate-800/50 rounded-xl p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateProject}
                disabled={isCreating}
                className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    <span>Create New Project</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <FolderPlus className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{projects.length}</div>
                  <div className="text-sm text-slate-400">Total Projects</div>
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
                    {projects.filter(p => p.status === 'active').length}
                  </div>
                  <div className="text-sm text-slate-400">Active Projects</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + (p.currentStep / p.totalSteps * 100), 0) / projects.length) : 0}%
                  </div>
                  <div className="text-sm text-slate-400">Avg Progress</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Projects Container */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6"
        >
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6">
                  <FolderPlus className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
                <p className="text-slate-400 mb-6 max-w-md">
                  Start your journey by creating your first project. Our AI will help you plan and organize everything.
                </p>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Sparkles className="h-4 w-4" />
                  <span>AI-powered project planning</span>
                </div>
              </motion.div>
            </div>
          ) : viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => {
                const percent = Math.min(
                  100,
                  Math.round((project.currentStep / project.totalSteps) * 100)
                );
                
                return (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="group bg-slate-700/30 rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-purple-500/10 relative overflow-hidden"
                    onClick={() => router.push(`/createProject/${project._id}`)}
                  >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Status Indicator */}
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${
                        project.status === 'active' ? 'bg-emerald-500' :
                        project.status === 'completed' ? 'bg-blue-500' :
                        project.status === 'archived' ? 'bg-slate-500' : 'bg-amber-500'
                      }`} />
                      <span className="text-xs text-slate-400 capitalize">{project.status}</span>
                    </div>
                    
                    <div className="relative z-10">
                      {/* Project Header */}
                      <div className="mb-4 pr-16">
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                          {project.name || "Untitled Project"}
                        </h3>
                        <div className="flex items-center text-sm text-slate-400 mt-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Step {project.currentStep} of {project.totalSteps}</span>
                        </div>
                      </div>
                      
                      {/* Progress Section */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-400">Progress</span>
                          <span className="text-sm font-semibold text-purple-400">{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                            className={`${
                              project.status === 'active' ? 'bg-emerald-500' :
                              project.status === 'completed' ? 'bg-blue-500' :
                              project.status === 'archived' ? 'bg-slate-500' : 'bg-amber-500'
                            } h-full rounded-full relative`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 rounded-full" />
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => openAddMemberModal(e, project._id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-700/50 hover:bg-purple-600/20 rounded-lg text-sm text-slate-400 hover:text-purple-300 transition-all duration-200 border border-slate-600/30 hover:border-purple-500/30"
                          title="Manage Members"
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>Members</span>
                        </button>
                        
                        <div className="flex items-center text-sm text-purple-400 group-hover:text-purple-300 font-medium">
                          <span>Continue</span>
                          <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            // List View
            <div className="space-y-3">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-700/30 rounded-lg text-sm font-medium text-slate-300">
                <div className="col-span-5">Project Name</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-center">Progress</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              
              {/* Project Rows */}
              {projects.map((project, index) => {
                const percent = Math.min(
                  100,
                  Math.round((project.currentStep / project.totalSteps) * 100)
                );
                
                return (
                  <motion.div
                    key={project._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-slate-700/30 rounded-lg border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200 group cursor-pointer"
                    onClick={() => router.push(`/createProject/${project._id}`)}
                  >
                    {/* Project Name */}
                    <div className="col-span-5">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-purple-500/20 flex-shrink-0">
                          <FolderPlus className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors">
                            {project.name || "Untitled Project"}
                          </h3>
                          <div className="text-xs text-slate-400 mt-1">
                            Step {project.currentStep} of {project.totalSteps}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status */}
                    <div className="col-span-2 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white ${
                        project.status === 'active' ? 'bg-emerald-500' :
                        project.status === 'completed' ? 'bg-blue-500' :
                        project.status === 'archived' ? 'bg-slate-500' : 'bg-amber-500'
                      }`}>
                        <span className="capitalize">{project.status}</span>
                      </span>
                    </div>
                    
                    {/* Progress */}
                    <div className="col-span-2">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-24 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1, delay: index * 0.05 + 0.2 }}
                            className={`${
                              project.status === 'active' ? 'bg-emerald-500' :
                              project.status === 'completed' ? 'bg-blue-500' :
                              project.status === 'archived' ? 'bg-slate-500' : 'bg-amber-500'
                            } h-full rounded-full`}
                          />
                        </div>
                        <span className="text-xs font-medium text-purple-400">{percent}%</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="col-span-3 flex items-center justify-end space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddMemberModal(e, project._id);
                        }}
                        className="p-2 rounded-lg hover:bg-slate-600/50 text-slate-400 hover:text-purple-300 transition-all"
                        title="Manage Members"
                      >
                        <UserPlus className="h-4 w-4" />
                      </button>
                      
                      <button
                        className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg text-sm text-purple-400 hover:text-purple-300 transition-all border border-purple-500/30"
                      >
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Enhanced Member Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleClickOutside}
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-700/50 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-slate-800/95 backdrop-blur-xl z-10 flex justify-between items-center p-6 border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-purple-600 shadow-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Project Members</h3>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-xl hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            
              <div className="p-6 space-y-6">
                {/* Current members list */}
                {memberProfiles.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2 text-purple-400" />
                      Current Members
                    </h4>
                    <div className="space-y-3">
                      {/* Project owner */}
                      {selectedProject && (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between bg-slate-700/30 rounded-xl p-4 border border-slate-600/30"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-amber-600 shadow-lg">
                              <Crown className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-semibold">Project Owner</p>
                              <p className="text-slate-400 text-sm">{selectedProject.userId}</p>
                            </div>
                          </div>
                          <span className="bg-amber-600 text-xs font-semibold text-white px-3 py-1 rounded-full">
                            Owner
                          </span>
                        </motion.div>
                      )}
                      
                      {/* Other members */}
                      {memberProfiles.map((profile, index) => {
                        const role = membersWithRole[profile.userId];
                        const RoleIcon = getRoleIcon(role);
                        
                        return (
                          <motion.div 
                            key={profile.userId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.1 }}
                            className="flex items-center justify-between bg-slate-700/30 rounded-xl p-4 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-xl bg-blue-600 shadow-lg">
                                <RoleIcon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-semibold">
                                  {`${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Unknown User"}
                                </p>
                                <p className="text-slate-400 text-sm">{profile.email}</p>
                              </div>
                            </div>
                            
                            {editingMemberId === profile.userId ? (
                              <div className="flex items-center space-x-2">
                                <select 
                                  value={editingRole} 
                                  onChange={(e) => setEditingRole(e.target.value)}
                                  className="bg-slate-700/50 border border-slate-600/50 text-white text-sm rounded-lg px-3 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                  <option value="member">Member</option>
                                  <option value="admin">Admin</option>
                                  <option value="viewer">Viewer</option>
                                </select>
                                <button 
                                  onClick={() => handleUpdateRole(profile.userId)}
                                  className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => setEditingMemberId(null)}
                                  className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-3">
                                <span className={`text-xs font-semibold text-white px-3 py-1 rounded-full capitalize ${
                                  role.toLowerCase() === 'owner' ? 'bg-amber-600' :
                                  role.toLowerCase() === 'admin' ? 'bg-purple-600' :
                                  role.toLowerCase() === 'viewer' ? 'bg-emerald-600' : 'bg-blue-600'
                                }`}>
                                  {role}
                                </span>
                                
                                <button 
                                  onClick={() => {
                                    setEditingMemberId(profile.userId);
                                    setEditingRole(role);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-slate-600/50 text-slate-400 hover:text-blue-400 transition-all"
                                  title="Edit role"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleRemoveMember(profile.userId)}
                                  className="p-1.5 rounded-lg hover:bg-slate-600/50 text-slate-400 hover:text-red-400 transition-all"
                                  title="Remove member"
                                >
                                  <UserMinus className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add new member form */}
                <div className={memberProfiles.length > 0 ? "border-t border-slate-700/50 pt-6" : ""}>
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-purple-400" />
                    Add New Member
                  </h4>
                  <form onSubmit={handleAddMember} className="space-y-4">
                    <div>
                      <label htmlFor="memberEmail" className="block text-sm font-medium text-slate-300 mb-2">
                        Member Email
                      </label>
                      <input
                        type="email"
                        id="memberEmail"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        placeholder="Enter email address"
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="memberRole" className="block text-sm font-medium text-slate-300 mb-2">
                        Role
                      </label>
                      <select
                        id="memberRole"
                        value={memberRole}
                        onChange={(e) => setMemberRole(e.target.value)}
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>

                    {errorMessage && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                      >
                        {errorMessage}
                      </motion.div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      >
                        Close
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isAddingMember}
                        className="flex items-center space-x-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                      >
                        {isAddingMember ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            <span>Add Member</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster position="top-right" richColors />
    </div>
  );
}
