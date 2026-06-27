import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { StudentClass, Subject, StudyNote, VideoLecture, Quiz, PlannerTask } from "../types";
import { collection, addDoc, deleteDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  FileText, 
  Video, 
  HelpCircle, 
  CalendarDays, 
  TrendingUp, 
  Search, 
  BookOpen, 
  Download, 
  Eye, 
  Play, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Plus, 
  Trash2, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  ExternalLink,
  X
} from "lucide-react";

interface DashboardProps {
  onStartQuiz: (quiz: Quiz) => void;
  onOpenChat: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onStartQuiz, onOpenChat }) => {
  const { 
    currentUser, 
    userProfile, 
    notes, 
    videos, 
    quizzes, 
    attempts, 
    plannerTasks,
    selectedClass,
    setSelectedClass
  } = useApp();

  // Active dashboard view tab
  const [activeTab, setActiveTab] = useState<"notes" | "videos" | "quizzes" | "planner" | "progress">("notes");
  
  // Filtering and Searching
  const [selectedSubject, setSelectedSubject] = useState<Subject | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // PDF Viewer Modal State
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfTitle, setActivePdfTitle] = useState("");

  // Video Player state
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState("");

  // Study Planner states
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState<Subject>("Mathematics");
  const [plannerLoading, setPlannerLoading] = useState(false);

  // Set initial class filter to student's enrolled class if they are logged in
  React.useEffect(() => {
    if (userProfile?.studentClass) {
      setSelectedClass(userProfile.studentClass);
    }
  }, [userProfile]);

  // Handlers for Study Planner
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDate || !currentUser) return;
    setPlannerLoading(true);
    try {
      const taskData = {
        uid: currentUser.uid,
        title: newTaskTitle.trim(),
        date: newTaskDate,
        time: newTaskTime || "09:00",
        subject: newTaskSubject,
        completed: false,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db, "planner"), taskData);
      setNewTaskTitle("");
      setNewTaskDate("");
      setNewTaskTime("");
    } catch (e) {
      console.error("Error adding task:", e);
    } finally {
      setPlannerLoading(false);
    }
  };

  const handleToggleTask = async (id: string, currentCompleted: boolean) => {
    try {
      await updateDoc(doc(db, "planner", id), {
        completed: !currentCompleted
      });
    } catch (e) {
      console.error("Error toggling task:", e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, "planner", id));
    } catch (e) {
      console.error("Error deleting task:", e);
    }
  };

  // Filtration logic
  const filteredNotes = notes.filter((item) => {
    const matchesClass = selectedClass === "All" || item.studentClass === selectedClass;
    const matchesSubject = selectedSubject === "All" || item.subject === selectedSubject;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSubject && matchesSearch;
  });

  const filteredVideos = videos.filter((item) => {
    const matchesClass = selectedClass === "All" || item.studentClass === selectedClass;
    const matchesSubject = selectedSubject === "All" || item.subject === selectedSubject;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSubject && matchesSearch;
  });

  const filteredQuizzes = quizzes.filter((item) => {
    const matchesClass = selectedClass === "All" || item.studentClass === selectedClass;
    const matchesSubject = selectedSubject === "All" || item.subject === selectedSubject;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSubject && matchesSearch;
  });

  const subjectsList: Subject[] = ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Social Science"];
  const classesList: StudentClass[] = ["9th", "10th", "11th", "12th"];

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-16 items-start w-full transition-colors duration-300">
      
      {/* ==================== 1. SIDEBAR NAVIGATION (LEFT COLUMN) ==================== */}
      <aside className="w-full lg:w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col gap-6 shrink-0 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Menu</p>
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "notes"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
            id="tab-sidebar-notes"
          >
            <span className="text-base">🏠</span> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "notes"
                ? "bg-blue-50/70 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
            id="tab-sidebar-notes-all"
          >
            <span className="text-base">📚</span> Subject Notes
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "videos"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
            id="tab-sidebar-videos"
          >
            <span className="text-base">🎥</span> Video Lectures
          </button>
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "quizzes"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
            id="tab-sidebar-quizzes"
          >
            <span className="text-base">⏱️</span> Live Quizzes
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Planning</p>
          <button
            onClick={() => setActiveTab("planner")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "planner"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
            id="tab-sidebar-planner"
          >
            <span className="text-base">📅</span> Time Table
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "progress"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
            id="tab-sidebar-progress"
          >
            <span className="text-base">📈</span> Progress Logs
          </button>
        </div>

        {/* AI Assistant card */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white shadow-md">
            <p className="text-[10px] opacity-80 mb-1 font-bold uppercase tracking-wider">AI Assistant</p>
            <p className="text-xs font-semibold mb-3">Ask questions or review test results with Gemini tutor.</p>
            <button 
              onClick={onOpenChat}
              className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold backdrop-blur-sm transition-colors uppercase tracking-wider"
            >
              Start Chat
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== 2. CENTER CONTENT AREA ==================== */}
      <div className="flex-1 space-y-6 w-full">
        
        {/* Welcome Hero Banner */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
          <div className="relative z-10 max-w-lg">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2 font-display">
              Welcome back, {userProfile?.name || currentUser?.displayName || "Student"}! 👋
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              You've completed {plannerTasks.length > 0 ? Math.round((plannerTasks.filter(t => t.completed).length / plannerTasks.length) * 100) : 75}% of your study planner schedule. Today's goal: Electrostatics Chapter Quiz.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onOpenChat}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-md shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all uppercase tracking-wider"
              >
                Resume Learning
              </button>
              <button
                onClick={() => setActiveTab("planner")}
                className="px-5 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold text-xs bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all uppercase tracking-wider"
              >
                View Planner
              </button>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 sm:w-64 sm:h-64 bg-blue-50 dark:bg-blue-950/10 rounded-full opacity-60 pointer-events-none"></div>
          
          <div className="absolute right-8 top-8 hidden sm:block">
            <div className="flex flex-col items-end">
              <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400">
                {attempts.length > 0 
                  ? `${Math.round((attempts.reduce((acc, curr) => acc + (curr.score / curr.maxScore), 0) / attempts.length) * 100)}%`
                  : "92%"
                }
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Attendance Rate</span>
            </div>
          </div>
        </section>

        {/* Filters and Grade selection menu */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm transition-all space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              {activeTab === "notes" && "Active Revision Course Material"}
              {activeTab === "videos" && "Board Video Masterclasses"}
              {activeTab === "quizzes" && "Syllabus chapter practice runs"}
              {activeTab === "planner" && "Daily Task Scheduler"}
              {activeTab === "progress" && "Academic Performance Portfolio"}
            </h2>
            
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedClass("All")}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                  selectedClass === "All"
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                All Classes
              </button>
              {classesList.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                    selectedClass === cls
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                  }`}
                  id={`dashboard-class-${cls}`}
                >
                  Class {cls}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-xs shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-xs outline-none focus:border-blue-500 transition-all"
                id="search-input-dashboard"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full justify-start md:justify-end">
              <button
                onClick={() => setSelectedSubject("All")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                  selectedSubject === "All"
                    ? "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900/40 dark:text-blue-400 font-bold"
                    : "bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400"
                }`}
              >
                All Subjects
              </button>
              {subjectsList.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    selectedSubject === sub
                      ? "bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900/40 dark:text-blue-400 font-bold"
                      : "bg-slate-50 border-slate-100 dark:bg-slate-800/50 dark:border-slate-800/50 text-slate-500 dark:text-slate-400"
                  }`}
                  id={`dashboard-subject-${sub}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab content renders inside the active area */}
        <div className="min-h-[400px]">
          
          {/* TAB 1: Revision Notes */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  PDF Subject Notes ({filteredNotes.length})
                </h3>
              </div>
              
              {filteredNotes.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 mt-4">No Notes Available</h4>
                  <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center gap-4 cursor-pointer"
                      onClick={() => {
                        setActivePdfUrl(note.pdfUrl);
                        setActivePdfTitle(note.title);
                      }}
                      id={`note-card-${note.id}`}
                    >
                      <div className="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 rounded-lg flex items-center justify-center text-2xl">
                        📚
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-bold text-blue-600 dark:text-blue-400">
                            {note.subject}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold">
                            Class {note.studentClass}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate mt-1">
                          {note.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Click to view derivation document</span>
                      </div>
                      <a
                        href={note.pdfUrl}
                        download={note.pdfName || "document.pdf"}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Video Lectures */}
          {activeTab === "videos" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Active Board Streams ({filteredVideos.length})
              </h3>

              {filteredVideos.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Video className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 mt-4">No Video Lectures</h4>
                  <p className="text-slate-400 text-sm mt-1">Try another grade or search filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVideos.map((vid) => (
                    <div
                      key={vid.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center gap-4 cursor-pointer"
                      onClick={() => {
                        setActiveVideoUrl(vid.videoUrl);
                        setActiveVideoTitle(vid.title);
                      }}
                      id={`video-card-${vid.id}`}
                    >
                      <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg flex items-center justify-center text-2xl">
                        🎥
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-bold text-blue-600 dark:text-blue-400">
                            {vid.subject}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold">
                            Class {vid.studentClass}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate mt-1">
                          {vid.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Click to play stream masterclass</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Online Quizzes */}
          {activeTab === "quizzes" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Practice Chapter Quizzes ({filteredQuizzes.length})
              </h3>

              {filteredQuizzes.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-850 dark:text-slate-200 mt-4">No Quizzes Active</h4>
                  <p className="text-slate-400 text-sm mt-1">Check back later or change Class grades above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all flex items-center gap-4 cursor-pointer"
                      onClick={() => onStartQuiz(quiz)}
                      id={`quiz-card-${quiz.id}`}
                    >
                      <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 rounded-lg flex items-center justify-center text-2xl">
                        ⏱️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                          <span className="text-blue-600 dark:text-blue-400">{quiz.subject}</span>
                          <span>Class {quiz.studentClass}</span>
                        </div>
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate mt-1">
                          {quiz.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {quiz.chapter} • {quiz.questions.length} questions • {quiz.timerMinutes} mins
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Study Planner */}
          {activeTab === "planner" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Form card */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 h-fit space-y-4 shadow-sm">
                <h4 className="font-display font-extrabold text-base text-slate-800 dark:text-white uppercase tracking-wider">
                  Log Study task
                </h4>
                <p className="text-xs text-slate-400">Log a future revision, homework review, or mock exam.</p>

                <form onSubmit={handleAddTask} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Task Title</label>
                    <input
                      type="text"
                      required
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="e.g., Revise Gauss Derivation"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-xs outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
                      <input
                        type="date"
                        required
                        value={newTaskDate}
                        onChange={(e) => setNewTaskDate(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-[11px] outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Time</label>
                      <input
                        type="time"
                        value={newTaskTime}
                        onChange={(e) => setNewTaskTime(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-[11px] outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Subject Category</label>
                    <select
                      value={newTaskSubject}
                      onChange={(e) => setNewTaskSubject(e.target.value as Subject)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-xs outline-none focus:border-blue-500"
                    >
                      {subjectsList.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={plannerLoading}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm transition-colors disabled:opacity-50 uppercase tracking-wider"
                    id="btn-add-planner-task"
                  >
                    <Plus className="w-4.5 h-4.5" />
                    {plannerLoading ? "Adding..." : "Log Scheduled Task"}
                  </button>
                </form>
              </div>

              {/* Tasks list */}
              <div className="xl:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
                <h4 className="font-display font-extrabold text-base text-slate-800 dark:text-white uppercase tracking-wider">
                  Planner Tasks & Revision List
                </h4>

                {plannerTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-slate-450 dark:text-slate-455 text-xs mt-3">Your schedule is currently empty. Add tasks to start planning!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                    {plannerTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                          task.completed 
                            ? "bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-850 opacity-60" 
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        }`}
                        id={`planner-task-${task.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleTask(task.id, task.completed)}
                            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                              task.completed 
                                ? "bg-emerald-500 border-emerald-500 text-white" 
                                : "border-slate-300 dark:border-slate-700 hover:border-blue-500"
                            }`}
                            id={`btn-toggle-task-${task.id}`}
                          >
                            {task.completed && <CheckCircle className="w-3.5 h-3.5" />}
                          </button>
                          
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                              {task.subject}
                            </span>
                            <span className={`text-xs font-semibold text-slate-800 dark:text-white ${task.completed ? "line-through text-slate-400" : ""}`}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-3 text-[9px] text-slate-400 font-semibold mt-0.5">
                              <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {task.date}</span>
                              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {task.time}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                          id={`btn-delete-task-${task.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: Progress Tracker */}
          {activeTab === "progress" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Personal Progress Logs
              </h3>

              {/* Overall Analytics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-md">
                  <span className="text-blue-100 text-[10px] font-bold uppercase tracking-wider">Completed Quizzes</span>
                  <strong className="text-3xl font-black block mt-1">{attempts.length}</strong>
                  <p className="text-[10px] text-blue-200 mt-2">Practice runs saved securely in cloud database.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                  <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Average Performance</span>
                  <strong className="text-3xl font-black block mt-1 text-slate-850 dark:text-white">
                    {attempts.length > 0 
                      ? `${Math.round((attempts.reduce((acc, curr) => acc + (curr.score / curr.maxScore), 0) / attempts.length) * 100)}%`
                      : "0%"
                    }
                  </strong>
                  <p className="text-[10px] text-slate-400 mt-2">Overall grade calculation from board quizzes.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Study Buddy</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Need help explaining tricky topics?</p>
                  </div>
                  <button
                    onClick={onOpenChat}
                    className="mt-3 w-full py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-lg font-bold flex items-center justify-center gap-1 transition-colors uppercase tracking-wider"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask AI Tutor
                  </button>
                </div>
              </div>

              {/* List of attempts */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
                <h4 className="font-display font-bold text-sm text-slate-850 dark:text-white uppercase tracking-wider">
                  Detailed Practice History
                </h4>

                {attempts.length === 0 ? (
                  <div className="text-center py-10">
                    <TrendingUp className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
                    <p className="text-slate-400 text-xs mt-3">You haven't attempted any quizzes yet. Start a quiz to populate history!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                          <th className="pb-3">Quiz Name</th>
                          <th className="pb-3">Subject</th>
                          <th className="pb-3">Accuracy</th>
                          <th className="pb-3">Final Score</th>
                          <th className="pb-3">Attempted At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.map((att) => {
                          const scorePercent = Math.round((att.score / att.maxScore) * 100);
                          return (
                            <tr key={att.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                              <td className="py-3 font-semibold text-slate-800 dark:text-white">{att.quizTitle}</td>
                              <td className="py-3 font-medium text-slate-400">{att.subject}</td>
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  scorePercent >= 75 
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400"
                                    : scorePercent >= 45
                                    ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400"
                                    : "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400"
                                }`}>
                                  {scorePercent}%
                                </span>
                              </td>
                              <td className="py-3 font-mono font-bold text-slate-700 dark:text-slate-200">{att.score} / {att.maxScore}</td>
                              <td className="py-3 text-slate-450 dark:text-slate-500">
                                {att.attemptedAt && att.attemptedAt.seconds 
                                  ? new Date(att.attemptedAt.seconds * 1000).toLocaleDateString()
                                  : new Date(att.attemptedAt).toLocaleDateString()
                                }
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ==================== 3. STATS & PLANNER (RIGHT COLUMN) ==================== */}
      <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        
        {/* Goal Progress Wheel card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center shadow-sm">
          <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider w-full text-left">Goal Progress</h3>
          
          <div className="relative w-32 h-32 flex items-center justify-center my-6">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" stroke="#f1f5f9" className="dark:stroke-slate-800" strokeWidth="10" fill="transparent"/>
                <circle 
                  cx="64" 
                  cy="64" 
                  r="54" 
                  stroke="#2563eb" 
                  strokeWidth="10" 
                  fill="transparent" 
                  strokeDasharray={`${2 * Math.PI * 54}`} 
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - (plannerTasks.length > 0 ? (plannerTasks.filter(t => t.completed).length / plannerTasks.length) : 0.75))}`} 
                  strokeLinecap="round"
                />
             </svg>
             <div className="absolute flex flex-col items-center">
               <span className="text-2xl font-black text-slate-800 dark:text-white">
                 {plannerTasks.length > 0 
                   ? `${Math.round((plannerTasks.filter(t => t.completed).length / plannerTasks.length) * 100)}%` 
                   : "75%"
                 }
               </span>
               <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Tasks Done</span>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full border-t border-slate-100 dark:border-slate-800 pt-5">
            <div className="text-center">
              <p className="text-lg font-black text-slate-800 dark:text-white">
                {notes.length}
              </p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">Notes Active</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-slate-800 dark:text-white">
                {attempts.length}
              </p>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">Tests Taken</p>
            </div>
          </div>
        </div>

        {/* Study Planner timeline card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex-1 shadow-sm w-full">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Today's Schedule</h3>
            <span className="text-[9px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 dark:text-slate-400 font-bold uppercase">
              {new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {/* If there are real upcoming tasks, render them first! otherwise fallback */}
            {plannerTasks.filter(t => !t.completed).length > 0 ? (
              plannerTasks.filter(t => !t.completed).slice(0, 4).map((task, index) => (
                <div key={task.id} className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">{task.time}</span>
                    {index < 3 && <div className="w-0.5 flex-1 bg-blue-100 dark:bg-blue-950"></div>}
                  </div>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-2.5 rounded flex-1">
                    <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase truncate">{task.subject}</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 truncate mt-0.5">{task.title}</p>
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Visual beautiful fallbacks for complete aesthetic */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">09:00</span>
                    <div className="w-0.5 flex-1 bg-blue-100 dark:bg-blue-950"></div>
                  </div>
                  <div className="bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-2.5 rounded flex-1">
                    <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase">Physics Lecture</p>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">Optics Basics Video</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-400">11:30</span>
                    <div className="w-0.5 flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="bg-slate-50 border-l-4 border-slate-300 dark:bg-slate-900 dark:border-slate-700 p-2.5 rounded flex-1 opacity-60">
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase">Maths Quiz</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Chapter 2: Matrices</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-400">14:00</span>
                    <div className="w-0.5 flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="bg-slate-50 border-l-4 border-slate-300 dark:bg-slate-900 dark:border-slate-700 p-2.5 rounded flex-1 opacity-60">
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase">Break Time</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Refreshment Break</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-slate-400">15:30</span>
                  </div>
                  <div className="bg-slate-50 border-l-4 border-slate-300 dark:bg-slate-900 dark:border-slate-700 p-2.5 rounded flex-1 opacity-60">
                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase">Bio Revision</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">NCERT Chapter Notes</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </aside>

      {/* 5. Embedded PDF Viewer Dialog */}
      {activePdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col h-[85vh]">
            
            {/* PDF Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-400" />
                <h4 className="font-display font-bold text-sm truncate max-w-[500px]">{activePdfTitle}</h4>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activePdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300 hover:text-white flex items-center gap-1"
                >
                  Open in New Tab <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => {
                    setActivePdfUrl(null);
                    setActivePdfTitle("");
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PDF Render iframe */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950">
              <iframe
                src={activePdfUrl}
                title={activePdfTitle}
                className="w-full h-full border-none"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. Embedded Video Player Dialog */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
            
            {/* Video Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-400" />
                <h4 className="font-display font-bold text-sm truncate max-w-[400px]">{activeVideoTitle}</h4>
              </div>
              <button
                onClick={() => {
                  setActiveVideoUrl(null);
                  setActiveVideoTitle("");
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video embed iframe */}
            <div className="aspect-video bg-black">
              <iframe
                src={activeVideoUrl}
                title={activeVideoTitle}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
            
            {/* Video Assist actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Class {selectedClass} • Board Level Tutorial</span>
              <button
                onClick={() => {
                  setActiveVideoUrl(null);
                  setActiveVideoTitle("");
                  onOpenChat();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask questions about this video
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
