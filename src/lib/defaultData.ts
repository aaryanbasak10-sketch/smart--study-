import { StudyNote, VideoLecture, Quiz, Subject, StudentClass } from "../types";

export const DEFAULT_NOTES: Omit<StudyNote, "id" | "createdAt">[] = [
  {
    title: "Force and Laws of Motion - Revision Notes",
    studentClass: "9th",
    subject: "Physics",
    pdfUrl: "https://www.orimi.com/pdf-test.pdf", // Standard public PDF for testing
    pdfName: "class9_physics_force.pdf",
    uploadedBy: "Admin"
  },
  {
    title: "Number Systems - Core Concepts",
    studentClass: "9th",
    subject: "Mathematics",
    pdfUrl: "https://www.orimi.com/pdf-test.pdf",
    pdfName: "class9_math_numbers.pdf",
    uploadedBy: "Admin"
  },
  {
    title: "Chemical Reactions and Equations - Complete Notes",
    studentClass: "10th",
    subject: "Chemistry",
    pdfUrl: "https://www.orimi.com/pdf-test.pdf",
    pdfName: "class10_chem_reactions.pdf",
    uploadedBy: "Admin"
  },
  {
    title: "Quadratic Equations - Practice Problems",
    studentClass: "10th",
    subject: "Mathematics",
    pdfUrl: "https://www.orimi.com/pdf-test.pdf",
    pdfName: "class10_math_quadratic.pdf",
    uploadedBy: "Admin"
  },
  {
    title: "Laws of Motion & Vector Algebra",
    studentClass: "11th",
    subject: "Physics",
    pdfUrl: "https://www.orimi.com/pdf-test.pdf",
    pdfName: "class11_physics_laws.pdf",
    uploadedBy: "Admin"
  },
  {
    title: "Organic Chemistry: Some Basic Principles",
    studentClass: "11th",
    subject: "Chemistry",
    pdfUrl: "https://www.orimi.com/pdf-test.pdf",
    pdfName: "class11_chem_organic_basic.pdf",
    uploadedBy: "Admin"
  },
  {
    title: "Electrostatics - Formulas & Derivations",
    studentClass: "12th",
    subject: "Physics",
    pdfUrl: "https://www.orimi.com/pdf-test.pdf",
    pdfName: "class12_physics_electrostatics.pdf",
    uploadedBy: "Admin"
  },
  {
    title: "Matrices & Determinants - Exam Sheets",
    studentClass: "12th",
    subject: "Mathematics",
    pdfUrl: "https://www.orimi.com/pdf-test.pdf",
    pdfName: "class12_math_matrices.pdf",
    uploadedBy: "Admin"
  }
];

export const DEFAULT_VIDEOS: Omit<VideoLecture, "id" | "createdAt">[] = [
  {
    title: "Class 9 Physics: Force & Newton's Laws Explained",
    studentClass: "9th",
    subject: "Physics",
    videoUrl: "https://www.youtube.com/embed/8-W7HkY-i-E", // educational video embed
    videoName: "Newton's Laws",
    uploadedBy: "Admin"
  },
  {
    title: "Class 9 Maths: Introduction to Number Systems",
    studentClass: "9th",
    subject: "Mathematics",
    videoUrl: "https://www.youtube.com/embed/zMHeu97eY60",
    videoName: "Number Systems",
    uploadedBy: "Admin"
  },
  {
    title: "Class 10 Chemistry: Balancing Chemical Equations",
    studentClass: "10th",
    subject: "Chemistry",
    videoUrl: "https://www.youtube.com/embed/2Juem0lc_84",
    videoName: "Chemical Equations",
    uploadedBy: "Admin"
  },
  {
    title: "Class 10 Maths: Solving Quadratic Equations Fast",
    studentClass: "10th",
    subject: "Mathematics",
    videoUrl: "https://www.youtube.com/embed/X7D07E_BbyQ",
    videoName: "Quadratic Equations",
    uploadedBy: "Admin"
  },
  {
    title: "Class 11 Physics: Newton's Laws of Motion Detailed Derivations",
    studentClass: "11th",
    subject: "Physics",
    videoUrl: "https://www.youtube.com/embed/8-W7HkY-i-E",
    videoName: "Laws of Motion",
    uploadedBy: "Admin"
  },
  {
    title: "Class 12 Physics: Gauss Law & Electric Field Calculations",
    studentClass: "12th",
    subject: "Physics",
    videoUrl: "https://www.youtube.com/embed/V9B4vNlT93w",
    videoName: "Electric Fields",
    uploadedBy: "Admin"
  },
  {
    title: "Class 12 Maths: Matrices and Determinants Full Crash Course",
    studentClass: "12th",
    subject: "Mathematics",
    videoUrl: "https://www.youtube.com/embed/6iW_f2R-mSg",
    videoName: "Matrices",
    uploadedBy: "Admin"
  }
];

export const DEFAULT_QUIZZES: Omit<Quiz, "id" | "createdAt">[] = [
  {
    title: "Force & Laws of Motion Quiz",
    studentClass: "9th",
    subject: "Physics",
    chapter: "Chapter 9 - Force",
    timerMinutes: 5,
    questions: [
      {
        questionText: "What is the SI unit of force?",
        options: ["Joule", "Pascal", "Newton", "Watt"],
        correctAnswerIndex: 2
      },
      {
        questionText: "Which law is also known as the Law of Inertia?",
        options: ["First Law of Motion", "Second Law of Motion", "Third Law of Motion", "Law of Gravitation"],
        correctAnswerIndex: 0
      },
      {
        questionText: "The mathematical formula of Force is F = ma. This is derived from:",
        options: ["First Law", "Second Law", "Third Law", "None of these"],
        correctAnswerIndex: 1
      },
      {
        questionText: "Action and reaction forces act on:",
        options: ["Same body in opposite directions", "Different bodies in opposite directions", "Same body in same direction", "Different bodies in same direction"],
        correctAnswerIndex: 1
      }
    ]
  },
  {
    title: "Number Systems Quiz",
    studentClass: "9th",
    subject: "Mathematics",
    chapter: "Chapter 1 - Numbers",
    timerMinutes: 5,
    questions: [
      {
        questionText: "Every rational number is:",
        options: ["A natural number", "An integer", "A real number", "A whole number"],
        correctAnswerIndex: 2
      },
      {
        questionText: "Between two rational numbers:",
        options: ["There is no rational number", "There is exactly one rational number", "There are infinitely many rational numbers", "There are only irrational numbers"],
        correctAnswerIndex: 2
      },
      {
        questionText: "What is the decimal representation of the number 1/7?",
        options: ["Terminating", "Non-terminating repeating", "Non-terminating non-repeating", "None of these"],
        correctAnswerIndex: 1
      }
    ]
  },
  {
    title: "Chemical Reactions & Equations Quiz",
    studentClass: "10th",
    subject: "Chemistry",
    chapter: "Chapter 1 - Chemical Reactions",
    timerMinutes: 5,
    questions: [
      {
        questionText: "Which of the following is a displacement reaction?",
        options: ["CaCO3 -> CaO + CO2", "2H2 + O2 -> 2H2O", "Fe + CuSO4 -> FeSO4 + Cu", "NaOH + HCl -> NaCl + H2O"],
        correctAnswerIndex: 2
      },
      {
        questionText: "The addition of oxygen to a substance is called:",
        options: ["Reduction", "Oxidation", "Corrosion", "Rancidity"],
        correctAnswerIndex: 1
      },
      {
        questionText: "A solution of substance X is used for whitewashing. X is:",
        options: ["Calcium oxide (CaO)", "Calcium hydroxide (Ca(OH)2)", "Calcium carbonate (CaCO3)", "Calcium sulfate (CaSO4)"],
        correctAnswerIndex: 0
      }
    ]
  },
  {
    title: "Quadratic Equations Quiz",
    studentClass: "10th",
    subject: "Mathematics",
    chapter: "Chapter 4 - Quadratics",
    timerMinutes: 5,
    questions: [
      {
        questionText: "If the discriminant of a quadratic equation is zero, the roots are:",
        options: ["Real and distinct", "Real and equal", "Imaginary", "Rational and distinct"],
        correctAnswerIndex: 1
      },
      {
        questionText: "What are the roots of the equation x^2 - 5x + 6 = 0?",
        options: ["(2, 3)", "(-2, -3)", "(1, 5)", "(2, -3)"],
        correctAnswerIndex: 0
      },
      {
        questionText: "The standard form of a quadratic equation is:",
        options: ["ax^2 + bx + c = 0 (a != 0)", "ax + b = 0", "ax^3 + bx^2 + cx + d = 0", "ax^2 + b = 0"],
        correctAnswerIndex: 0
      }
    ]
  },
  {
    title: "Electrostatics Quiz",
    studentClass: "12th",
    subject: "Physics",
    chapter: "Chapter 1 - Electrostatics",
    timerMinutes: 10,
    questions: [
      {
        questionText: "The electric field inside a perfectly conducting hollow sphere is:",
        options: ["Infinite", "Zero", "Dependent on distance from center", "Equal to charge density"],
        correctAnswerIndex: 1
      },
      {
        questionText: "What is the unit of electric dipole moment?",
        options: ["Coulomb", "Coulomb-meter", "Coulomb/meter", "Newton/Coulomb"],
        correctAnswerIndex: 1
      },
      {
        questionText: "Gauss's Law relates electric flux through a closed surface with:",
        options: ["Total potential inside", "Net charge enclosed", "Electric field gradient", "Magnetic field intensity"],
        correctAnswerIndex: 1
      }
    ]
  }
];
