import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { AuthModal } from "./components/AuthModal";
import { Dashboard } from "./components/Dashboard";
import { AdminPanel } from "./components/AdminPanel";
import { AIChat } from "./components/AIChat";
import { QuizModal } from "./components/QuizModal";
import { Quiz } from "./types";
import { Loader2, BookOpen, GraduationCap, ShieldCheck } from "lucide-react";

function StudyHubApp() {
  const { 
    currentUser, 
    userProfile, 
    loading, 
    activeTab, 
    setActiveTab 
  } = useApp();

  // Auth Modal state
  const [authOpen, setAuthOpen] = useState(false);
  const [authIsAdmin, setAuthIsAdmin] = useState(false);

  // AI Chat drawer state
  const [chatOpen, setChatOpen] = useState(false);

  // Active Quiz Modal state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  const handleOpenAuth = (isAdmin: boolean) => {
    setAuthIsAdmin(isAdmin);
    setAuthOpen(true);
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-lg flex items-center justify-center animate-bounce">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="font-display font-semibold tracking-wide">Securing Study Hub Vault...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 flex flex-col transition-colors duration-300">
      
      {/* Navbar Section */}
      <Navbar 
        onOpenAuth={handleOpenAuth} 
        onOpenChat={() => setChatOpen(true)} 
      />

      {/* Main Body Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "home" && (
          <Hero onOpenAuth={handleOpenAuth} />
        )}

        {activeTab === "dashboard" && (
          <Dashboard 
            onStartQuiz={handleStartQuiz} 
            onOpenChat={() => setChatOpen(true)} 
          />
        )}

        {activeTab === "admin" && (
          <AdminPanel />
        )}
      </main>

      {/* Global Modals & Drawers */}
      
      {/* 1. Sign In & Registration Panel */}
      <AuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
        initialIsAdmin={authIsAdmin}
      />

      {/* 2. Slide Out AI Chat Companion */}
      <AIChat 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
      />

      {/* 3. Interactive Practice Quiz Runner */}
      {activeQuiz && (
        <QuizModal 
          quiz={activeQuiz} 
          isOpen={!!activeQuiz} 
          onClose={() => setActiveQuiz(null)} 
        />
      )}

      {/* Footer Design */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 py-6 text-center text-xs text-slate-400 transition-colors">
        <p>© 2026 Study Hub Ecosystem. All educational materials CBSE / ICSE mapped for Classes 9 to 12.</p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-slate-500 font-semibold">
          <GraduationCap className="w-4 h-4 text-blue-500" />
          Educating Minds • Building Future
        </p>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <StudyHubApp />
    </AppProvider>
  );
}
