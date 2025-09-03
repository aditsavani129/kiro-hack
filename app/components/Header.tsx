"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  HelpCircle,
  Home,
  PlusCircle,
  KanbanSquare,
  Settings,
  Calendar,
  Command,
  Sparkles,
  Zap
} from "lucide-react";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Don't show header on sign-in page
  if (pathname === "/signin" || pathname === "/sign-in") {
    return null;
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search for:", searchQuery);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl px-4 md:px-6 shadow-2xl"
    >
      {/* Left section - Logo and Search */}
      <div className="flex items-center gap-6 flex-1">
        {/* Logo - hidden on mobile when sidebar is present */}
        <div className="md:hidden flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-slate-700/70 border border-slate-600">
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>
          <span className="text-lg font-semibold text-slate-100 tracking-wide">
            ProjectFlow
          </span>
        </div>

       
      </div>

      {/* Right section - Actions and User */}
      <div className="flex items-center gap-2">
        <SignedIn>
          {/* Quick Actions */}
          <div className="hidden sm:flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-violet-500/20 text-slate-400 hover:text-violet-400 transition-all duration-200 border border-slate-700/50 hover:border-violet-500/30"
            >
              <PlusCircle className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 rounded-xl bg-slate-800/50 hover:bg-orange-500/20 text-slate-400 hover:text-orange-400 transition-all duration-200 border border-slate-700/50 hover:border-orange-500/30"
          >
            <Bell className="h-4 w-4" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-2 border-slate-900"></div>
          </motion.button>

          {/* Help */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-all duration-200 border border-slate-700/50 hover:border-blue-500/30"
          >
            <HelpCircle className="h-4 w-4" />
          </motion.button>

          {/* User Profile */}
          <div className="ml-3 relative">
            <div className="p-0.5 rounded-xl bg-slate-700/60 border border-slate-600">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 rounded-lg",
                    userButtonPopoverCard: "bg-slate-800 border-slate-700",
                    userButtonPopoverActionButton: "hover:bg-slate-700"
                  }
                }}
              />
            </div>
          </div>
        </SignedIn>

        <SignedOut>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/sign-in"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-violet-500/25 flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Sign In
            </Link>
          </motion.div>
        </SignedOut>
      </div>
    </motion.header>
  );
}
