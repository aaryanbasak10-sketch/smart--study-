import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { 
  BookOpen, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  Home, 
  ShieldAlert,
  MessageSquare
} from "lucide-react";

interface NavbarProps {
  onOpenAuth: (isAdmin: boolean) => void;
  onOpenChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenChat }) => {
  const { 
    currentUser, 
    userProfile, 
    activeTab, 
    setActiveTab, 
    darkMode, 
    toggleDarkMode 
  } = useApp();
  
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    ...(currentUser ? [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
    ...(userProfile?.role === "admin" ? [{ id: "admin", label: "Admin Panel", icon: ShieldAlert }] : []),
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("home")} id="brand-logo">
            <div className="bg-blue-600 dark:bg-blue-500 text-white p-2 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              Study <span className="text-blue-600 dark:text-blue-400">Hub</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  id={`nav-${item.id}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* AI Chat Button for active users */}
            {currentUser && (
              <button
                onClick={onOpenChat}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/10 transition-all duration-200"
                id="btn-ai-chat"
              >
                <MessageSquare className="w-4 h-4" />
                AI Tutor
              </button>
            )}

            {/* Dark Mode Switch */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
              id="btn-theme-toggle"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>

            {/* Auth State */}
            {currentUser ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-100 dark:border-slate-800">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white max-w-[120px] truncate">
                    {userProfile?.name || currentUser.displayName || "Student"}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {userProfile?.role === "admin" ? "Administrator" : `Class ${userProfile?.studentClass || '9th-12th'}`}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Logout"
                  id="btn-logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onOpenAuth(false)}
                  className="px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-all"
                  id="btn-login-student"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth(true)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                  id="btn-login-admin"
                >
                  Admin Access
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400"
              id="btn-theme-toggle-mobile"
            >
              {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              id="btn-menu-mobile"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}

          {currentUser && (
            <button
              onClick={() => {
                onOpenChat();
                setIsOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-4 py-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-semibold"
            >
              <MessageSquare className="w-5 h-5" />
              AI Tutor Chat
            </button>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {currentUser ? (
              <div className="space-y-3">
                <div className="px-4 py-1.5 flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {userProfile?.name || currentUser.displayName}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {userProfile?.role === "admin" ? "Administrator" : `Class ${userProfile?.studentClass}`}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-4 py-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl font-semibold"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-2">
                <button
                  onClick={() => {
                    onOpenAuth(false);
                    setIsOpen(false);
                  }}
                  className="px-4 py-2.5 text-center text-sm font-semibold text-white bg-blue-600 rounded-xl"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth(true);
                    setIsOpen(false);
                  }}
                  className="px-4 py-2.5 text-center text-sm font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  Admin
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
