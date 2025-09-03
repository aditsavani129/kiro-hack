"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Send, Loader2, X, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

type ChatMessage = {
  _id: Id<"chatMessages">;
  projectId: Id<"projects">;
  userId: string;
  content: string;
  timestamp: number;
  userName?: string;
  userImageUrl?: string;
};

interface ProjectChatProps {
  projectId: Id<"projects">;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectChat({ projectId, isOpen, onClose }: ProjectChatProps) {
  const { user, isSignedIn } = useUser();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch messages for the project
  const messages = useQuery(api.chat.getProjectMessages, {
    projectId,
    limit: 100,
  });

  // Mutations
  const sendMessage = useMutation(api.chat.sendMessage);

  // Scroll to bottom when messages change or when opened
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when chat is opened and add keyboard listener for Escape key
  useEffect(() => {
    if (isOpen) {
      // Focus the input field
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 300);
      }
      
      // Add keyboard event listener for Escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      // Clean up event listener
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  // Handle message submission
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isSignedIn || !user) return;

    setIsLoading(true);
    try {
      await sendMessage({
        projectId,
        content: message.trim(),
        userId: user.id,
        userName: user.fullName || user.username || "User",
        userImageUrl: user.imageUrl,
      });
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if message is from current user
  const isCurrentUser = (userId: string) => {
    return user?.id === userId;
  };

  // Format date for message groups
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with click indicator */}
          <motion.div 
            className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <div 
              className="hidden md:flex items-center justify-center px-3 py-2 bg-gray-800/80 backdrop-blur-sm rounded-lg text-gray-300 text-sm pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              <X className="h-4 w-4 mr-2" />
              Click outside to close
            </div>
          </motion.div>
          
          {/* Chat Sheet */}
          <motion.div
            className="fixed right-0 top-0 z-50 h-full w-full sm:w-96 bg-gray-800 shadow-xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Chat Header */}
            <div className="bg-gray-900 p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-blue-400 mr-2" />
                <h2 className="text-lg font-semibold text-white">Project Chat</h2>
              </div>
              <div className="flex items-center">
                <span className="text-xs text-gray-400 mr-2 hidden sm:inline">ESC to close</span>
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-gray-700 transition-colors group relative"
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5 text-gray-400 group-hover:text-white" />
                  <span className="absolute -bottom-8 right-0 bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Close chat</span>
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages === undefined ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-8 space-y-4">
                  <MessageSquare className="h-12 w-12 text-gray-500 opacity-50" />
                  <div>
                    <p className="font-medium text-lg">No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    // Check if we should show date header
                    const showDateHeader = index === 0 || 
                      formatDate(msg.timestamp) !== formatDate(messages[index - 1].timestamp);
                    
                    return (
                      <div key={msg._id} className="space-y-2">
                        {showDateHeader && (
                          <div className="flex justify-center my-4">
                            <div className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                              {formatDate(msg.timestamp)}
                            </div>
                          </div>
                        )}
                        <div
                          className={clsx("flex", {
                            "justify-end": isCurrentUser(msg.userId),
                            "justify-start": !isCurrentUser(msg.userId)
                          })}
                        >
                          <div
                            className={clsx("max-w-[85%] rounded-lg p-3", {
                              "bg-blue-600 text-white rounded-tr-none": isCurrentUser(msg.userId),
                              "bg-gray-700 text-white rounded-tl-none": !isCurrentUser(msg.userId)
                            })}
                          >
                            {!isCurrentUser(msg.userId) && (
                              <div className="flex items-center mb-1">
                                <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs font-medium mr-2">
                                  {msg.userName ? msg.userName.charAt(0) : "U"}
                                </div>
                                <span className="text-sm font-medium">{msg.userName || "User"}</span>
                              </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                            <div
                              className={clsx("text-xs mt-1 text-right", {
                                "text-blue-200": isCurrentUser(msg.userId),
                                "text-gray-400": !isCurrentUser(msg.userId)
                              })}
                            >
                              {formatTimestamp(msg.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="bg-gray-900 p-3 border-t border-gray-700 flex items-center"
            >
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-l-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || !isSignedIn}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-4 py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !message.trim() || !isSignedIn}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
