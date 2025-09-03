"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Don't show sidebar or header on sign-in page
  const isSignInPage = pathname === "/signin";
  const isSignUpPage = pathname === "/signup";
  const isLandingPage = pathname === "/";
  
  const showLayout = !isSignInPage && !isSignUpPage && !isLandingPage;
  
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {showLayout && <Header />}
      <div className="flex flex-1 relative">
        {showLayout && <Sidebar />}
        <main className={`flex-1 relative ${showLayout ? "md:pl-72" : ""}`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 min-h-full"
          >
            <div className={`${showLayout ? 'container mx-auto p-4 md:p-6' : ''}`}>
              {children}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
