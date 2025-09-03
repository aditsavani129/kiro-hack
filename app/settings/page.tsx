"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { 
  Loader2, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Mail, 
  Building, 
  Globe, 
  Shield, 
  Bell, 
  Palette, 
  Key,
  Trash2,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  Crown,
  Zap
} from "lucide-react";

export default function Settings() {
    const router = useRouter();
    const { user, isSignedIn, isLoaded } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
    
    // Form state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        timezone: "UTC",
    });
    
    // Get user profile from Convex
    const userProfile = useQuery(api.userProfiles.getCurrentUserProfile);
    
    // Update user profile mutation
    const updateProfile = useMutation(api.userProfiles.updateUserProfile);
    
    // Redirect if not signed in
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push("/sign-in");
        } else if (isLoaded && userProfile) {
            setIsLoading(false);
        }
    }, [isLoaded, isSignedIn, router, userProfile]);
    
    // Populate form with user profile data when available
    useEffect(() => {
        if (userProfile) {
            setFormData({
                firstName: userProfile.firstName || "",
                lastName: userProfile.lastName || "",
                email: userProfile.email || "",
                company: userProfile.company || "",
                timezone: userProfile.timezone || "UTC",
            });
        }
    }, [userProfile]);
    
    // Handle form input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveStatus("idle");
        
        try {
            await updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                company: formData.company,
                timezone: formData.timezone,
            });
            setSaveStatus("success");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            setSaveStatus("error");
        } finally {
            setIsSaving(false);
        }
    };
    
    // Loading state
    if (isLoading) {
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
                    <div className="text-lg font-medium text-slate-200">Loading settings...</div>
                </motion.div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 rounded-xl bg-violet-600 shadow-lg">
                            <SettingsIcon className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-violet-400">
                            Settings
                        </h1>
                    </div>
                    <p className="text-slate-400 ml-14">
                        Manage your account settings and preferences
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Settings Navigation */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-6 sticky top-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Settings Menu</h2>
                            <nav className="space-y-2">
                                {[
                                    { name: 'Profile', icon: User, active: true },
                                    { name: 'Account', icon: Shield, active: false },
                                    { name: 'Notifications', icon: Bell, active: false },
                                    { name: 'Appearance', icon: Palette, active: false },
                                    { name: 'Security', icon: Key, active: false },
                                ].map((item) => (
                                    <button
                                        key={item.name}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                                            item.active 
                                                ? 'bg-violet-500/20 text-white border border-violet-500/30' 
                                                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span className="font-medium">{item.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
                                    <p className="text-slate-400 mt-1">Update your personal information</p>
                                </div>
                                <div className="p-3 bg-violet-500/20 rounded-xl">
                                    <User className="h-6 w-6 text-violet-400" />
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Profile Picture Section */}
                                <div className="flex items-center space-x-6 p-6 bg-slate-700/30 rounded-xl border border-slate-600/30">
                                    <div className="relative">
                                        {user?.imageUrl ? (
                                            <img 
                                                src={user.imageUrl} 
                                                alt="Profile" 
                                                className="h-20 w-20 rounded-xl object-cover border-2 border-violet-500/50 shadow-lg"
                                            />
                                        ) : (
                                            <div className="h-20 w-20 rounded-xl bg-violet-600 flex items-center justify-center shadow-lg">
                                                <span className="text-2xl font-bold text-white">
                                                    {formData.firstName?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-800"></div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white">Profile Picture</h3>
                                        <p className="text-sm text-slate-400 mb-3">This will be displayed on your profile</p>
                                        <div className="flex space-x-3">
                                            <button 
                                                type="button"
                                                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Change Photo
                                            </button>
                                            <button 
                                                type="button"
                                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="firstName" className="flex items-center text-sm font-medium text-slate-300 mb-3">
                                            <User className="h-4 w-4 mr-2 text-violet-400" />
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                                            placeholder="Enter your first name"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="lastName" className="flex items-center text-sm font-medium text-slate-300 mb-3">
                                            <User className="h-4 w-4 mr-2 text-violet-400" />
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label htmlFor="email" className="flex items-center text-sm font-medium text-slate-300 mb-3">
                                        <Mail className="h-4 w-4 mr-2 text-violet-400" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="company" className="flex items-center text-sm font-medium text-slate-300 mb-3">
                                        <Building className="h-4 w-4 mr-2 text-violet-400" />
                                        Company
                                    </label>
                                    <input
                                        type="text"
                                        id="company"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                                        placeholder="Enter your company name"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="timezone" className="flex items-center text-sm font-medium text-slate-300 mb-3">
                                        <Globe className="h-4 w-4 mr-2 text-violet-400" />
                                        Timezone
                                    </label>
                                    <select
                                        id="timezone"
                                        name="timezone"
                                        value={formData.timezone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200"
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="America/New_York">Eastern Time (ET)</option>
                                        <option value="America/Chicago">Central Time (CT)</option>
                                        <option value="America/Denver">Mountain Time (MT)</option>
                                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                        <option value="Asia/Kolkata">India Standard Time (IST)</option>
                                        <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                                        <option value="Europe/Paris">Central European Time (CET)</option>
                                        <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                                        <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                                    </select>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
                                    <div className="flex items-center space-x-4">
                                        {saveStatus === "success" && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex items-center text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                <span className="text-sm font-medium">Profile updated successfully!</span>
                                            </motion.div>
                                        )}
                                        
                                        {saveStatus === "error" && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex items-center text-red-400 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20"
                                            >
                                                <AlertCircle className="h-4 w-4 mr-2" />
                                                <span className="text-sm font-medium">Error updating profile</span>
                                            </motion.div>
                                        )}
                                    </div>
                                    
                                    <div className="flex space-x-3">
                                        <button
                                            type="button"
                                            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <motion.button
                                            type="submit"
                                            disabled={isSaving}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                                isSaving 
                                                    ? 'bg-slate-600 cursor-not-allowed' 
                                                    : 'bg-violet-600 hover:bg-violet-500 shadow-lg hover:shadow-violet-500/25'
                                            }`}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    <span>Save Changes</span>
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Danger Zone */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-8 bg-red-500/5 backdrop-blur-sm rounded-2xl shadow-lg border border-red-500/20 p-8"
                        >
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Danger Zone</h3>
                                    <p className="text-sm text-slate-400">Irreversible and destructive actions</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                <div>
                                    <h4 className="font-medium text-white">Delete Account</h4>
                                    <p className="text-sm text-slate-400">Permanently delete your account and all data</p>
                                </div>
                                <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete Account</span>
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}