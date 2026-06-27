import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { StudentClass, Subject, StudyNote, VideoLecture, Quiz, QuizQuestion } from "../types";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  ShieldAlert, 
  FileText, 
  Video, 
  HelpCircle, 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  PlusCircle, 
  Check, 
  Trash, 
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  RefreshCw,
  LogOut,
  AlertCircle
} from "lucide-react";

export const AdminPanel: React.FC = () => {
  const { userProfile, notes, videos, quizzes, loading } = useApp();

  // Redirect or guard if user is not Admin
  if (!loading && userProfile?.role !== "admin") {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto shadow-md">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
          Admin Access Restricted
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          You do not have permission to access the Study Hub administration suite. Please sign in as an Administrator.
        </p>
      </div>
    );
  }

  // Active admin section
  const [activeTab, setActiveTab] = useState<"notes" | "videos" | "quizzes" | "students">("notes");

  // General Filter
  const [selectedClass, setSelectedClass] = useState<StudentClass | "All">("All");
  const [selectedSubject, setSelectedSubject] = useState<Subject | "All">("All");

  // Dynamic Students List from Firestore
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Notes Form State
  const [noteTitle, setNoteTitle] = useState("");
  const [noteClass, setNoteClass] = useState<StudentClass>("10th");
  const [noteSubject, setNoteSubject] = useState<Subject>("Physics");
  const [notePdfUrl, setNotePdfUrl] = useState("");
  const [notePdfName, setNotePdfName] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Videos Form State
  const [videoTitle, setVideoTitle] = useState("");
  const [videoClass, setVideoClass] = useState<StudentClass>("10th");
  const [videoSubject, setVideoSubject] = useState<Subject>("Physics");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoName, setVideoName] = useState("");
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  // Quizzes Form State
  const [quizTitle, setQuizTitle] = useState("");
  const [quizClass, setQuizClass] = useState<StudentClass>("10th");
  const [quizSubject, setQuizSubject] = useState<Subject>("Physics");
  const [quizChapter, setQuizChapter] = useState("");
  const [quizTimer, setQuizTimer] = useState(5);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 }
  ]);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);

  // Fetch all registered students from firestore
  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const q = query(collection(db, "users"), where("role", "==", "student"));
      const querySnapshot = await getDocs(q);
      const studentList: any[] = [];
      querySnapshot.forEach((doc) => {
        studentList.push({ id: doc.id, ...doc.data() });
      });
      setStudents(studentList);
    } catch (e) {
      console.error("Error fetching students:", e);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "students") {
      fetchStudents();
    }
  }, [activeTab]);

  // Handle Note Submit (Create / Edit)
  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !notePdfUrl.trim()) return;
    setFormSubmitting(true);
    setAdminMessage(null);
    try {
      const payload = {
        title: noteTitle.trim(),
        studentClass: noteClass,
        subject: noteSubject,
        pdfUrl: notePdfUrl.trim(),
        pdfName: notePdfName.trim() || "document.pdf",
        uploadedBy: "Admin",
        createdAt: serverTimestamp()
      };

      if (editingNoteId) {
        // Edit existing Note
        await updateDoc(doc(db, "notes", editingNoteId), payload);
        setAdminMessage("Revision Notes updated successfully.");
        setEditingNoteId(null);
      } else {
        // Upload new Note
        await addDoc(collection(db, "notes"), payload);
        setAdminMessage("New Revision Notes uploaded successfully.");
      }
      
      // Reset form
      setNoteTitle("");
      setNotePdfUrl("");
      setNotePdfName("");
    } catch (error: any) {
      console.error(error);
      setAdminMessage("Error: " + error.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditNoteTrigger = (note: StudyNote) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteClass(note.studentClass);
    setNoteSubject(note.subject);
    setNotePdfUrl(note.pdfUrl);
    setNotePdfName(note.pdfName);
  };

  const handleDeleteNote = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this study notes PDF?")) return;
    try {
      await deleteDoc(doc(db, "notes", id));
      setAdminMessage("Note deleted successfully.");
    } catch (error: any) {
      console.error(error);
    }
  };

  // Handle Video Submit (Create / Edit)
  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) return;
    setFormSubmitting(true);
    setAdminMessage(null);
    try {
      // Check YouTube URL or format
      let formattedUrl = videoUrl.trim();
      if (formattedUrl.includes("youtube.com/watch?v=")) {
        const vidId = formattedUrl.split("v=")[1]?.split("&")[0];
        if (vidId) {
          formattedUrl = `https://www.youtube.com/embed/${vidId}`;
        }
      } else if (formattedUrl.includes("youtu.be/")) {
        const vidId = formattedUrl.split("youtu.be/")[1]?.split("?")[0];
        if (vidId) {
          formattedUrl = `https://www.youtube.com/embed/${vidId}`;
        }
      }

      const payload = {
        title: videoTitle.trim(),
        studentClass: videoClass,
        subject: videoSubject,
        videoUrl: formattedUrl,
        videoName: videoName.trim() || "lecture",
        uploadedBy: "Admin",
        createdAt: serverTimestamp()
      };

      if (editingVideoId) {
        await updateDoc(doc(db, "videos", editingVideoId), payload);
        setAdminMessage("Video Lecture updated successfully.");
        setEditingVideoId(null);
      } else {
        await addDoc(collection(db, "videos"), payload);
        setAdminMessage("New Video Lecture uploaded successfully.");
      }

      // Reset
      setVideoTitle("");
      setVideoUrl("");
      setVideoName("");
    } catch (error: any) {
      console.error(error);
      setAdminMessage("Error: " + error.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditVideoTrigger = (vid: VideoLecture) => {
    setEditingVideoId(vid.id);
    setVideoTitle(vid.title);
    setVideoClass(vid.studentClass);
    setVideoSubject(vid.subject);
    setVideoUrl(vid.videoUrl);
    setVideoName(vid.videoName || "");
  };

  const handleDeleteVideo = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this lecture video?")) return;
    try {
      await deleteDoc(doc(db, "videos", id));
      setAdminMessage("Video Lecture deleted successfully.");
    } catch (error) {
      console.error(error);
    }
  };

  // Handle Quiz Submit (Create / Edit)
  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim() || !quizChapter.trim()) return;
    setFormSubmitting(true);
    setAdminMessage(null);
    try {
      const payload = {
        title: quizTitle.trim(),
        studentClass: quizClass,
        subject: quizSubject,
        chapter: quizChapter.trim(),
        timerMinutes: Number(quizTimer) || 5,
        questions: quizQuestions,
        createdAt: serverTimestamp()
      };

      if (editingQuizId) {
        await updateDoc(doc(db, "quizzes", editingQuizId), payload);
        setAdminMessage("Quiz updated successfully.");
        setEditingQuizId(null);
      } else {
        await addDoc(collection(db, "quizzes"), payload);
        setAdminMessage("New Quiz added successfully.");
      }

      // Reset
      setQuizTitle("");
      setQuizChapter("");
      setQuizTimer(5);
      setQuizQuestions([{ questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 }]);
    } catch (error: any) {
      console.error(error);
      setAdminMessage("Error: " + error.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleAddQuestionField = () => {
    setQuizQuestions((prev) => [
      ...prev,
      { questionText: "", options: ["", "", "", ""], correctAnswerIndex: 0 }
    ]);
  };

  const handleRemoveQuestionField = (idx: number) => {
    if (quizQuestions.length <= 1) return;
    setQuizQuestions((prev) => prev.filter((_, qIdx) => qIdx !== idx));
  };

  const handleQuizQuestionChange = (idx: number, field: string, val: any) => {
    setQuizQuestions((prev) => {
      const copy = [...prev];
      if (field === "questionText") {
        copy[idx].questionText = val;
      } else if (field === "correctAnswerIndex") {
        copy[idx].correctAnswerIndex = Number(val);
      }
      return copy;
    });
  };

  const handleQuizOptionChange = (qIdx: number, optIdx: number, val: string) => {
    setQuizQuestions((prev) => {
      const copy = [...prev];
      copy[qIdx].options[optIdx] = val;
      return copy;
    });
  };

  const handleEditQuizTrigger = (qz: Quiz) => {
    setEditingQuizId(qz.id);
    setQuizTitle(qz.title);
    setQuizClass(qz.studentClass);
    setQuizSubject(qz.subject);
    setQuizChapter(qz.chapter);
    setQuizTimer(qz.timerMinutes);
    setQuizQuestions(qz.questions);
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this chapter quiz?")) return;
    try {
      await deleteDoc(doc(db, "quizzes", id));
      setAdminMessage("Quiz deleted successfully.");
    } catch (error) {
      console.error(error);
    }
  };

  // Manage Students Actions
  const handleDeleteStudent = async (uid: string) => {
    if (!window.confirm("Are you sure you want to remove this student? This is irreversible.")) return;
    try {
      await deleteDoc(doc(db, "users", uid));
      setAdminMessage("Student profile removed successfully.");
      fetchStudents();
    } catch (e: any) {
      console.error(e);
      setAdminMessage("Error removing student: " + e.message);
    }
  };

  const handleUpgradeStudentClass = async (uid: string, currentCls: StudentClass) => {
    const nextClsMap: Record<StudentClass, StudentClass> = {
      "9th": "10th",
      "10th": "11th",
      "11th": "12th",
      "12th": "12th"
    };
    const nextCls = nextClsMap[currentCls];
    try {
      await updateDoc(doc(db, "users", uid), {
        studentClass: nextCls
      });
      setAdminMessage("Student promoted to next class successfully.");
      fetchStudents();
    } catch (e: any) {
      console.error(e);
    }
  };

  // Filtration logic for admin resources list
  const filteredNotes = notes.filter((item) => {
    const matchesClass = selectedClass === "All" || item.studentClass === selectedClass;
    const matchesSubject = selectedSubject === "All" || item.subject === selectedSubject;
    return matchesClass && matchesSubject;
  });

  const filteredVideos = videos.filter((item) => {
    const matchesClass = selectedClass === "All" || item.studentClass === selectedClass;
    const matchesSubject = selectedSubject === "All" || item.subject === selectedSubject;
    return matchesClass && matchesSubject;
  });

  const filteredQuizzes = quizzes.filter((item) => {
    const matchesClass = selectedClass === "All" || item.studentClass === selectedClass;
    const matchesSubject = selectedSubject === "All" || item.subject === selectedSubject;
    return matchesClass && matchesSubject;
  });

  const subjectsList: Subject[] = ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Social Science"];
  const classesList: StudentClass[] = ["9th", "10th", "11th", "12th"];

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full w-fit">
            <ShieldAlert className="w-3.5 h-3.5" />
            ADMINISTRATION MODE ACTIVED
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mt-2.5">
            Study Hub Control Panel
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Publish educational PDFs, stream video links, manage students or build automated quizzes.
          </p>
        </div>

        <button
          onClick={() => {
            setNoteTitle("");
            setNotePdfUrl("");
            setEditingNoteId(null);
            setEditingVideoId(null);
            setEditingQuizId(null);
            setAdminMessage("Admin forms reset.");
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700/60"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Form State
        </button>
      </div>

      {/* 2. Admin tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: "notes", label: "Manage Notes", icon: FileText },
          { id: "videos", label: "Manage Videos", icon: Video },
          { id: "quizzes", label: "Manage Quizzes", icon: HelpCircle },
          { id: "students", label: "Students Registry", icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setAdminMessage(null);
              }}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
              }`}
              id={`tab-admin-${tab.id}`}
            >
              <Icon className="w-4.5 h-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {adminMessage && (
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 p-4 rounded-2xl text-sm border border-blue-100 dark:border-blue-900/40">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>{adminMessage}</span>
        </div>
      )}

      {/* 3. Tab Grid Panel Layout (Split: Forms Left, Lists Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ADD / EDIT FORMS */}
        {activeTab !== "students" && (
          <div className="xl:col-span-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 h-fit space-y-6">
            
            <div className="flex items-center gap-1">
              <PlusCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                {activeTab === "notes" && (editingNoteId ? "Edit Revision Note" : "Upload Revision Note")}
                {activeTab === "videos" && (editingVideoId ? "Edit Video Lecture" : "Upload Video Lecture")}
                {activeTab === "quizzes" && (editingQuizId ? "Edit Chapter Quiz" : "Build Chapter Quiz")}
              </h3>
            </div>

            {/* FORM 1: Revision Notes */}
            {activeTab === "notes" && (
              <form onSubmit={handleNoteSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">PDF Title</label>
                  <input
                    type="text"
                    required
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g., Electromagnetic Induction Formula Sheet"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                    id="admin-note-title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Grade</label>
                    <select
                      value={noteClass}
                      onChange={(e) => setNoteClass(e.target.value as StudentClass)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm outline-none focus:border-blue-500"
                    >
                      {classesList.map((cls) => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Subject Category</label>
                    <select
                      value={noteSubject}
                      onChange={(e) => setNoteSubject(e.target.value as Subject)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm outline-none focus:border-blue-500"
                    >
                      {subjectsList.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">PDF Web Link (URL)</label>
                  <input
                    type="url"
                    required
                    value={notePdfUrl}
                    onChange={(e) => setNotePdfUrl(e.target.value)}
                    placeholder="https://example.com/syllabus.pdf"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm focus:border-blue-500 outline-none"
                    id="admin-note-pdfurl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">PDF File Name (optional)</label>
                  <input
                    type="text"
                    value={notePdfName}
                    onChange={(e) => setNotePdfName(e.target.value)}
                    placeholder="class12_physics_induct.pdf"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10"
                  id="admin-note-submit"
                >
                  {formSubmitting ? "Uploading..." : editingNoteId ? "Update Study Note" : "Publish Study Note"}
                </button>
              </form>
            )}

            {/* FORM 2: Video Lectures */}
            {activeTab === "videos" && (
              <form onSubmit={handleVideoSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lecture Title</label>
                  <input
                    type="text"
                    required
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="e.g., Balancing Organic Reactions Masterclass"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Grade</label>
                    <select
                      value={videoClass}
                      onChange={(e) => setVideoClass(e.target.value as StudentClass)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm outline-none focus:border-blue-500"
                    >
                      {classesList.map((cls) => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Subject Category</label>
                    <select
                      value={videoSubject}
                      onChange={(e) => setVideoSubject(e.target.value as Subject)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm outline-none focus:border-blue-500"
                    >
                      {subjectsList.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">YouTube Watch URL or Embed Link</label>
                  <input
                    type="url"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm focus:border-blue-500 outline-none"
                    id="admin-video-url"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Video Topic Tag (optional)</label>
                  <input
                    type="text"
                    value={videoName}
                    onChange={(e) => setVideoName(e.target.value)}
                    placeholder="Chemical Reactions Balancing"
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10"
                >
                  {formSubmitting ? "Uploading..." : editingVideoId ? "Update Lecture Video" : "Stream Lecture Video"}
                </button>
              </form>
            )}

            {/* FORM 3: Automated Quizzes builder */}
            {activeTab === "quizzes" && (
              <form onSubmit={handleQuizSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quiz Challenge Title</label>
                  <input
                    type="text"
                    required
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="e.g., Electrostatics Foundation Quiz"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Grade Target</label>
                    <select
                      value={quizClass}
                      onChange={(e) => setQuizClass(e.target.value as StudentClass)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm outline-none focus:border-blue-500"
                    >
                      {classesList.map((cls) => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Subject Target</label>
                    <select
                      value={quizSubject}
                      onChange={(e) => setQuizSubject(e.target.value as Subject)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm outline-none focus:border-blue-500"
                    >
                      {subjectsList.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Chapter / Description</label>
                    <input
                      type="text"
                      required
                      value={quizChapter}
                      onChange={(e) => setQuizChapter(e.target.value)}
                      placeholder="e.g., Chapter 1"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Timer Limit (Minutes)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={60}
                      value={quizTimer}
                      onChange={(e) => setQuizTimer(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Sub-questions area */}
                <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quiz Questions ({quizQuestions.length})</h4>
                    <button
                      type="button"
                      onClick={handleAddQuestionField}
                      className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      + Add Question
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                    {quizQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2.5 relative">
                        {quizQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionField(qIdx)}
                            className="absolute top-2 right-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1 rounded-md"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        )}
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Question {qIdx+1} Text</label>
                          <input
                            type="text"
                            required
                            value={q.questionText}
                            onChange={(e) => handleQuizQuestionChange(qIdx, "questionText", e.target.value)}
                            placeholder="State Newton's First law of motion..."
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Four Multiple Choice Options</label>
                          {q.options.map((opt, optIdx) => (
                            <input
                              key={optIdx}
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => handleQuizOptionChange(qIdx, optIdx, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 dark:text-white"
                            />
                          ))}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Correct Answer Code</label>
                          <select
                            value={q.correctAnswerIndex}
                            onChange={(e) => handleQuizQuestionChange(qIdx, "correctAnswerIndex", e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-900 dark:text-white"
                          >
                            <option value={0}>Option A is Correct</option>
                            <option value={1}>Option B is Correct</option>
                            <option value={2}>Option C is Correct</option>
                            <option value={3}>Option D is Correct</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/10"
                >
                  {formSubmitting ? "Compiling..." : editingQuizId ? "Update Chapter Quiz" : "Publish Chapter Quiz"}
                </button>
              </form>
            )}

          </div>
        )}

        {/* RIGHT COLUMN: RESOURCE MANAGEMENT & LISTS */}
        <div className={`${activeTab === "students" ? "xl:col-span-3" : "xl:col-span-2"} space-y-6`}>
          
          {/* Quick class / subject sorting for admin */}
          {activeTab !== "students" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl flex flex-wrap gap-4 items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">Search Filters:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-xs outline-none"
              >
                <option value="All">All Grades (Class 9-12)</option>
                <option value="9th">Class 9th</option>
                <option value="10th">Class 10th</option>
                <option value="11th">Class 11th</option>
                <option value="12th">Class 12th</option>
              </select>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-xs outline-none"
              >
                <option value="All">All Subjects</option>
                {subjectsList.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}

          {/* LIST tab: Notes panel */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Revision Notes Library ({filteredNotes.length})</h3>
              
              {filteredNotes.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No PDFs matched the search filters.</p>
              ) : (
                <div className="space-y-3">
                  {filteredNotes.map((note) => (
                    <div 
                      key={note.id}
                      className="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800/85 rounded-2xl flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-lg">{note.subject} • Class {note.studentClass}</span>
                        <h4 className="text-sm font-semibold text-slate-850 dark:text-white mt-1.5">{note.title}</h4>
                        <span className="text-[10px] text-slate-400 block mt-1">URL: <code className="text-slate-500 font-mono">{note.pdfUrl.substring(0, 50)}...</code></span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEditNoteTrigger(note)}
                          className="p-2 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/30 text-slate-500 hover:text-blue-600 dark:text-slate-400 rounded-lg transition-colors"
                          title="Edit Document"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-2 bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/30 text-slate-300 hover:text-rose-600 dark:text-slate-400 rounded-lg transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LIST tab: Video Lectures panel */}
          {activeTab === "videos" && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Active Video Tutorials ({filteredVideos.length})</h3>
              
              {filteredVideos.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No video tutorials matched filters.</p>
              ) : (
                <div className="space-y-3">
                  {filteredVideos.map((vid) => (
                    <div 
                      key={vid.id}
                      className="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800/85 rounded-2xl flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-lg">{vid.subject} • Class {vid.studentClass}</span>
                        <h4 className="text-sm font-semibold text-slate-850 dark:text-white mt-1.5">{vid.title}</h4>
                        <span className="text-[10px] text-slate-400 block mt-1">Embed Link: <code className="text-slate-500 font-mono">{vid.videoUrl.substring(0, 50)}...</code></span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEditVideoTrigger(vid)}
                          className="p-2 bg-slate-50 hover:bg-blue-50 dark:bg-slate-850 dark:hover:bg-blue-950/30 text-slate-500 hover:text-blue-600 dark:text-slate-400 rounded-lg transition-colors"
                          title="Edit Video"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="p-2 bg-slate-50 hover:bg-rose-50 dark:bg-slate-850 dark:hover:bg-rose-950/30 text-slate-300 hover:text-rose-600 dark:text-slate-400 rounded-lg transition-colors"
                          title="Delete Video"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LIST tab: Quizzes panel */}
          {activeTab === "quizzes" && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Active Board Quizzes ({filteredQuizzes.length})</h3>
              
              {filteredQuizzes.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">No active quizzes matched filters.</p>
              ) : (
                <div className="space-y-3">
                  {filteredQuizzes.map((qz) => (
                    <div 
                      key={qz.id}
                      className="bg-white dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800/85 rounded-2xl flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded-lg">{qz.subject} • Class {qz.studentClass} • {qz.chapter}</span>
                        <h4 className="text-sm font-semibold text-slate-850 dark:text-white mt-1.5">{qz.title}</h4>
                        <span className="text-[10px] text-slate-400 block mt-1">{qz.questions.length} multiple choice questions • {qz.timerMinutes} mins timebox</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleEditQuizTrigger(qz)}
                          className="p-2 bg-slate-50 hover:bg-blue-50 dark:bg-slate-850 dark:hover:bg-blue-950/30 text-slate-500 hover:text-blue-600 dark:text-slate-400 rounded-lg transition-colors"
                          title="Edit Quiz"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(qz.id)}
                          className="p-2 bg-slate-50 hover:bg-rose-50 dark:bg-slate-850 dark:hover:bg-rose-950/30 text-slate-300 hover:text-rose-600 dark:text-slate-400 rounded-lg transition-colors"
                          title="Delete Quiz"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Students Registry */}
          {activeTab === "students" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">Registered Student Profiles</h3>
                  <p className="text-xs text-slate-400">Manage pupil class targets and monitor student registration.</p>
                </div>
                
                <button
                  onClick={fetchStudents}
                  className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                  title="Refresh Student Grid"
                >
                  <RefreshCw className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {studentsLoading ? (
                <p className="text-sm text-slate-400 text-center py-10">Querying registered users database...</p>
              ) : students.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-slate-400 text-sm mt-3">No student profiles registered in the database yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase text-slate-400">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email Address</th>
                        <th className="pb-3">Enrolled Grade</th>
                        <th className="pb-3">Registration ID</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b border-slate-100/50 dark:border-slate-800/50 hover:bg-slate-50/30">
                          <td className="py-4 font-semibold text-slate-800 dark:text-white">{student.name}</td>
                          <td className="py-4 text-slate-500">{student.email}</td>
                          <td className="py-4">
                            <span className="px-2.5 py-1 text-xs font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 rounded-lg">
                              Class {student.studentClass || "N/A"}
                            </span>
                          </td>
                          <td className="py-4 font-mono text-[11px] text-slate-400">{student.uid}</td>
                          <td className="py-4 text-right space-x-2">
                            <button
                              onClick={() => handleUpgradeStudentClass(student.uid, student.studentClass || "9th")}
                              className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 hover:bg-emerald-100/60 rounded-xl transition-all"
                              title="Promote Class"
                            >
                              Promote
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.uid)}
                              className="text-xs font-semibold px-3 py-1 bg-rose-50 text-rose-500 hover:bg-rose-100/60 rounded-xl transition-all"
                              title="Delete Student Profile"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
