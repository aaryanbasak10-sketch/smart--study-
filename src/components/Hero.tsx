import React from "react";
import { useApp } from "../context/AppContext";
import { StudentClass } from "../types";
import { 
  GraduationCap, 
  Sparkles, 
  FileText, 
  Video, 
  Clock, 
  Search, 
  Flame, 
  BookOpen, 
  ArrowRight,
  Code
} from "lucide-react";

interface HeroProps {
  onOpenAuth: (isAdmin: boolean) => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth }) => {
  const { currentUser, userProfile, setActiveTab, setSelectedClass, notes, videos, quizzes } = useApp();

  const handleClassSelect = (cls: StudentClass) => {
    setSelectedClass(cls);
    if (currentUser) {
      setActiveTab("dashboard");
    } else {
      // Trigger student login
      onOpenAuth(false);
    }
  };

  const classesList: { id: StudentClass; desc: string; color: string; bg: string }[] = [
    { id: "9th", desc: "Foundation & Core Principles", color: "text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50", bg: "bg-emerald-50/50 dark:bg-emerald-950/20" },
    { id: "10th", desc: "Board Exams Preparation", color: "text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50", bg: "bg-blue-50/50 dark:bg-blue-950/20" },
    { id: "11th", desc: "Advanced Concepts & Streams", color: "text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/50", bg: "bg-purple-50/50 dark:bg-purple-950/20" },
    { id: "12th", desc: "Syllabus, Boards & Competitive Entry", color: "text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50", bg: "bg-amber-50/50 dark:bg-amber-950/20" }
  ];

  const featuredSubjects = [
    { title: "Mathematics", icon: "📐", topics: ["Algebra", "Calculus", "Geometry", "Trigonometry"] },
    { title: "Physics", icon: "⚡", topics: ["Mechanics", "Electrostatics", "Optics", "Thermodynamics"] },
    { title: "Chemistry", icon: "🧪", topics: ["Organic Chemistry", "Inorganic", "Physical", "Equations"] },
    { title: "Biology", icon: "🧬", topics: ["Genetics", "Human Physiology", "Plant Biology", "Ecology"] },
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30 rounded-3xl p-8 sm:p-12 md:p-16 border border-blue-100/30 dark:border-slate-800/60 shadow-xl shadow-blue-500/5">
        
        {/* Floating gradient ornaments */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-blue-400/10 dark:bg-blue-500/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-indigo-400/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100/60 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            CLASS 9TH TO 12TH EXCLUSIVE LEARNING HUB
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Unlock Your Academic Potential with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Study Hub</span>
          </h1>
          
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Your premium, all-in-one education ecosystem. Master complex topics with subject-wise PDFs, interactive video lectures, chapter quizzes with active timers, a personalized study planner, and real-time AI guidance.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            {currentUser ? (
              <button
                onClick={() => setActiveTab("dashboard")}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-2 transition-all"
                id="hero-go-dashboard"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth(false)}
                  className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 flex items-center gap-2 transition-all"
                  id="hero-student-sign"
                >
                  Get Started (Student Sign In)
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onOpenAuth(true)}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 transition-all"
                  id="hero-admin-access"
                >
                  Admin Access
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 2. Class-Wise Selection */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Select Your Grade to Start Learning
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Tailored study materials, video content, and Chapter Quizzes mapped strictly to your board syllabus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {classesList.map((cls) => (
            <div
              key={cls.id}
              onClick={() => handleClassSelect(cls.id)}
              className={`group cursor-pointer rounded-2xl border border-slate-100 dark:border-slate-800 p-6 ${cls.bg} hover:border-blue-300 dark:hover:border-blue-900 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1`}
              id={`hero-class-card-${cls.id}`}
            >
              <div className="flex items-center justify-between">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm">
                  <GraduationCap className={`w-6 h-6 ${cls.color}`} />
                </div>
                <span className={`text-xs font-semibold uppercase px-2.5 py-1 rounded-full border ${cls.color}`}>
                  Class {cls.id}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mt-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Grade {cls.id} Suite
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5 leading-relaxed">
                {cls.desc}
              </p>
              <div className="mt-5 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 gap-1 opacity-0 group-hover:opacity-100 transition-all">
                Access Content <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Featured Courses / Subjects Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Featured Subjects
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {featuredSubjects.map((sub, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{sub.icon}</span>
                  <h3 className="font-display font-bold text-lg text-slate-950 dark:text-white">{sub.title}</h3>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sub.topics.map((t, tIdx) => (
                    <span 
                      key={tIdx} 
                      className="text-xs bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Latest Board Updates Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 p-2 rounded-xl">
                <Flame className="w-5 h-5" />
              </div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                Latest Learning Updates
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3 text-sm pb-3 border-b border-slate-100 dark:border-slate-800">
                <FileText className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400">Class 12 • Physics</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Electrostatics notes with Gauss derivation added.</p>
                </div>
              </div>
              
              <div className="flex gap-3 text-sm pb-3 border-b border-slate-100 dark:border-slate-800">
                <Video className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400">Class 10 • Mathematics</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Quadratic Equations full lecture video uploaded.</p>
                </div>
              </div>

              <div className="flex gap-3 text-sm">
                <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400">Class 9 • All Boards</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Foundation chapter quizzes now have 5 min timers.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl p-3 text-xs text-slate-500 dark:text-slate-400 text-center">
              Total resources: <strong className="text-blue-600 dark:text-blue-400">{notes.length} notes</strong>, <strong className="text-blue-600 dark:text-blue-400">{videos.length} lectures</strong>, and <strong className="text-blue-600 dark:text-blue-400">{quizzes.length} quizzes</strong> active.
            </div>
          </div>

        </div>
      </section>

      {/* 5. AI Powered Feature Showcasing */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            POWERED BY GEMINI 2.5 FLASH
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
            Stuck on a tricky board problem? Chat with Study Hub AI Tutor!
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Our intelligent AI chat companion is trained specifically to explain CBSE, ICSE, and Board syllabus topics for Classes 9-12. Break down complex math formulas or review history timelines instantaneously!
          </p>
        </div>
        
        <div className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl px-6 py-4 shadow-lg shadow-blue-500/10 cursor-pointer flex items-center gap-2 transition-all self-stretch md:self-auto justify-center" onClick={() => currentUser ? setActiveTab("dashboard") : onOpenAuth(false)}>
          Chat with Tutor Now
          <ArrowRight className="w-5 h-5" />
        </div>
      </section>

    </div>
  );
};
