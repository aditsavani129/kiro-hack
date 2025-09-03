"use client";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  PlusCircle, 
  KanbanSquare, 
  Settings, 
  LogOut, 
  ChevronRight,
  Menu,
  X,
  Users,
  Building,
  Calendar,
  Sparkles,
  Crown,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get user profile and plan from Convex
  const userProfile = useQuery(api.userProfiles.getCurrentUserProfile);
  const userPlan = useQuery(api.userPlans.getCurrentUserPlan);
  
  // Don't show sidebar on sign-in page
  if (pathname === "/signin" || pathname === "/sign-in") {
    return null;
  }
  
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      gradient: "from-violet-500 to-purple-600",
      bgHover: "hover:bg-violet-500/10",
    },
    {
      name: "Projects",
      href: "/createProject",
      icon: <PlusCircle className="h-5 w-5" />,
      gradient: "from-blue-500 to-cyan-600",
      bgHover: "hover:bg-blue-500/10",
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: <KanbanSquare className="h-5 w-5" />,
      gradient: "from-emerald-500 to-teal-600",
      bgHover: "hover:bg-emerald-500/10",
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
      gradient: "from-pink-500 to-rose-600",
      bgHover: "hover:bg-pink-500/10",
    }, 
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      gradient: "from-gray-500 to-slate-600",
      bgHover: "hover:bg-gray-500/10",
    },
    {
      type: "divider",
      label: "Collaboration"
    },
    {
      name: "Shared",
      href: "/shared",
      icon: <Users className="h-5 w-5" />,
      gradient: "from-orange-500 to-red-600",
      bgHover: "hover:bg-orange-500/10",
    },
   
    {
      name: "Workspace",
      href: "/workspace",
      icon: <Building className="h-5 w-5" />,
      gradient: "from-indigo-500 to-blue-600",
      bgHover: "hover:bg-indigo-500/10",
    },
    
  ];

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Sidebar content
  const sidebarContent = (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-r border-slate-700/50"
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-700/50 px-6 bg-slate-800/50">
        <Link href="/" className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-700/70 border border-slate-600 shadow-lg">
            <Sparkles className="h-5 w-5 text-amber-400" />
          </div>
          <span className="text-xl font-semibold text-slate-100 tracking-wide">
            ProjectFlow
          </span>
        </Link>
        <button 
          className="md:hidden p-2 rounded-xl hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-200"
          onClick={toggleMobileMenu}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 overflow-auto py-6">
        <nav className="px-4 space-y-2">
          {navItems.map((item, index) => {
            // Handle divider item
            if ('type' in item && item.type === 'divider') {
              return (
                <motion.div
                  key={`divider-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="my-3 px-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-slate-700/70 flex-grow"></div>
                    {item.label && (
                      <span className="text-xs font-medium text-slate-500 px-1">{item.label}</span>
                    )}
                    <div className="h-px bg-slate-700/70 flex-grow"></div>
                  </div>
                </motion.div>
              );
            }
            
            // Handle regular nav item
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <motion.div
                key={item.href || `nav-item-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href || "#"}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-white shadow-lg border border-violet-500/30"
                      : `text-slate-300 ${item.bgHover} hover:text-white hover:shadow-md`
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  {/* Icon with gradient */}
                  <div className={`relative z-10 p-1.5 rounded-lg ${isActive ? `bg-gradient-to-r ${item.gradient}` : 'bg-slate-700/50 group-hover:bg-slate-600/50'} transition-all duration-200`}>
                    <div className="text-white">
                      {item.icon}
                    </div>
                  </div>
                  
                  <span className="relative z-10 font-medium">{item.name}</span>
                  
                  {/* Hover arrow */}
                  <ChevronRight className={`relative z-10 h-4 w-4 ml-auto transition-all duration-200 ${
                    isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                  }`} />
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* User Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-4 border-t border-slate-700/50 bg-slate-800/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-shrink-0">
            {user?.imageUrl ? (
              <img 
                src={user.imageUrl} 
                alt="Profile" 
                className="h-12 w-12 rounded-xl object-cover border-2 border-violet-500/50 shadow-lg"
              />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-slate-700 flex items-center justify-center shadow-lg border border-slate-600">
                <span className="text-lg font-bold text-amber-300">
                  {userProfile?.firstName?.charAt(0) || user?.firstName?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-800"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}` : user?.fullName || 'User'}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {userProfile?.email || user?.emailAddresses?.[0]?.emailAddress || ''}
            </p>
          </div>
        </div>
        
        {/* Credits Display */}
        {userPlan && (
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-600/30 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-semibold text-slate-300">Credits</span>
              </div>
              <span className="text-sm font-bold text-emerald-400">{userPlan.creditsRemaining}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (userPlan.creditsRemaining / (userPlan.creditsRemaining + userPlan.creditsUsed)) * 100)}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="bg-emerald-500 h-full rounded-full shadow-sm"
              />
            </div>
            <div className="flex justify-between mt-2">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-violet-400" />
                <span className="text-xs text-slate-400">{userPlan.planType || 'Free'}</span>
              </div>
              <span className="text-xs text-slate-400">{userPlan.creditsUsed} used</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
  
  // Mobile menu button (only visible on mobile)
  const mobileMenuButton = (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="md:hidden fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-2xl hover:shadow-violet-500/25 transition-all duration-300"
      onClick={toggleMobileMenu}
    >
      <Menu className="h-6 w-6 text-white" />
    </motion.button>
  );
  
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen w-72 flex-col fixed inset-y-0 z-50 shadow-2xl">
        {sidebarContent}
      </div>
      
      {/* Mobile sidebar (overlay) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" 
            onClick={toggleMobileMenu}
          >
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-72 h-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {sidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile menu button */}
      {!isMobileMenuOpen && mobileMenuButton}
    </>
  );
}
