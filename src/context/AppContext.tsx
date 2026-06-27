import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, collection, onSnapshot, query, orderBy, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { UserProfile, StudyNote, VideoLecture, Quiz, QuizAttempt, PlannerTask, StudentClass } from "../types";
import { seedDefaultData } from "../lib/dbSeeder";

interface AppContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  activeTab: "home" | "dashboard" | "admin";
  setActiveTab: (tab: "home" | "dashboard" | "admin") => void;
  
  // App-wide Filters
  selectedClass: StudentClass | "All";
  setSelectedClass: (cls: StudentClass | "All") => void;
  
  // Data State
  notes: StudyNote[];
  videos: VideoLecture[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  plannerTasks: PlannerTask[];
  
  // Dark Mode
  darkMode: boolean;
  toggleDarkMode: () => void;
  
  // Refresh & Operations
  refreshUserData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "dashboard" | "admin">("home");
  const [selectedClass, setSelectedClass] = useState<StudentClass | "All">("All");
  
  // Data lists loaded in real-time from Firestore
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [videos, setVideos] = useState<VideoLecture[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [plannerTasks, setPlannerTasks] = useState<PlannerTask[]>([]);
  
  // Dark Mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // Apply dark mode CSS class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Fetch or refresh user profile from Firestore
  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
    }
    return null;
  };

  const refreshUserData = async () => {
    if (currentUser) {
      const profile = await fetchUserProfile(currentUser.uid);
      if (profile) {
        setUserProfile(profile);
      }
    }
  };

  // Seed default data & Listen to Auth changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Attempt to seed default notes, videos, quizzes if collections are empty
        seedDefaultData();

        // Fetch custom profile details (role, name, class) from Firestore
        let profile = await fetchUserProfile(user.uid);
        
        if (!profile) {
          // If Firestore profile doesn't exist (e.g., social login fallback), create a default student profile
          const defaultProfile: UserProfile = {
            uid: user.uid,
            email: user.email || "",
            name: user.displayName || "Student",
            role: "student",
            studentClass: "10th", // Default class
            createdAt: serverTimestamp()
          };
          try {
            await setDoc(doc(db, "users", user.uid), defaultProfile);
            profile = defaultProfile;
          } catch (err) {
            console.error("Error creating default profile doc:", err);
          }
        }
        
        setUserProfile(profile);
        
        // If user is admin, set active tab options or retain state
        if (profile?.role === "admin") {
          // Keep active tab as admin or home
        } else {
          // Force non-admins off admin tab
          setActiveTab((prev) => prev === "admin" ? "dashboard" : prev);
        }
      } else {
        setUserProfile(null);
        setActiveTab("home");
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to Firestore general tables (Notes, Videos, Quizzes) real-time
  useEffect(() => {
    if (!currentUser) {
      setNotes([]);
      setVideos([]);
      setQuizzes([]);
      return;
    }

    // 1. Listen to Notes
    const qNotes = query(collection(db, "notes"), orderBy("createdAt", "desc"));
    const unsubNotes = onSnapshot(qNotes, (snapshot) => {
      const items: StudyNote[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as StudyNote);
      });
      setNotes(items);
    }, (err) => console.error("Error listening to notes:", err));

    // 2. Listen to Videos
    const qVideos = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const unsubVideos = onSnapshot(qVideos, (snapshot) => {
      const items: VideoLecture[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as VideoLecture);
      });
      setVideos(items);
    }, (err) => console.error("Error listening to videos:", err));

    // 3. Listen to Quizzes
    const qQuizzes = query(collection(db, "quizzes"), orderBy("createdAt", "desc"));
    const unsubQuizzes = onSnapshot(qQuizzes, (snapshot) => {
      const items: Quiz[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Quiz);
      });
      setQuizzes(items);
    }, (err) => console.error("Error listening to quizzes:", err));

    return () => {
      unsubNotes();
      unsubVideos();
      unsubQuizzes();
    };
  }, [currentUser]);

  // Listen to user-specific Firestore items (Attempts, Planner) when logged in
  useEffect(() => {
    if (!currentUser) {
      setAttempts([]);
      setPlannerTasks([]);
      return;
    }

    // 1. Listen to attempts
    const qAttempts = query(collection(db, "attempts"), orderBy("attemptedAt", "desc"));
    const unsubAttempts = onSnapshot(qAttempts, (snapshot) => {
      const items: QuizAttempt[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid === currentUser.uid) {
          items.push({ id: doc.id, ...data } as QuizAttempt);
        }
      });
      setAttempts(items);
    });

    // 2. Listen to Study Planner tasks
    const qPlanner = query(collection(db, "planner"));
    const unsubPlanner = onSnapshot(qPlanner, (snapshot) => {
      const items: PlannerTask[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.uid === currentUser.uid) {
          items.push({ id: doc.id, ...data } as PlannerTask);
        }
      });
      setPlannerTasks(items);
    });

    return () => {
      unsubAttempts();
      unsubPlanner();
    };
  }, [currentUser]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        activeTab,
        setActiveTab,
        selectedClass,
        setSelectedClass,
        notes,
        videos,
        quizzes,
        attempts,
        plannerTasks,
        darkMode,
        toggleDarkMode,
        refreshUserData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
