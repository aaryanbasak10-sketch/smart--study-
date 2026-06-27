export type UserRole = "student" | "admin";

export type StudentClass = "9th" | "10th" | "11th" | "12th";

export type Subject = 
  | "Physics" 
  | "Chemistry" 
  | "Mathematics" 
  | "Biology" 
  | "English" 
  | "Social Science";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  studentClass?: StudentClass;
  createdAt: any;
}

export interface StudyNote {
  id: string;
  title: string;
  studentClass: StudentClass;
  subject: Subject;
  pdfUrl: string;
  pdfName: string;
  uploadedBy: string;
  createdAt: any;
}

export interface VideoLecture {
  id: string;
  title: string;
  studentClass: StudentClass;
  subject: Subject;
  videoUrl: string; // YouTube watch link, embed link or Firebase storage URL
  videoName?: string;
  uploadedBy: string;
  createdAt: any;
}

export interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  studentClass: StudentClass;
  subject: Subject;
  chapter: string;
  timerMinutes: number;
  questions: QuizQuestion[];
  createdAt: any;
}

export interface QuizAttempt {
  id: string;
  uid: string;
  quizId: string;
  quizTitle: string;
  subject: Subject;
  score: number;
  maxScore: number;
  attemptedAt: any;
}

export interface PlannerTask {
  id: string;
  uid: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  subject: Subject;
  completed: boolean;
}
