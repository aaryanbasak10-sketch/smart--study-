import React, { useState, useEffect } from "react";
import { Quiz, QuizQuestion, QuizAttempt } from "../types";
import { useApp } from "../context/AppContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { X, Clock, Award, CheckCircle, XCircle, AlertTriangle, ArrowRight, HelpCircle } from "lucide-react";

interface QuizModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ quiz, isOpen, onClose }) => {
  const { currentUser, refreshUserData } = useApp();
  
  // Quiz progress states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({}); // question index -> chosen option index
  const [timeRemaining, setTimeRemaining] = useState(quiz.timerMinutes * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Results
  const [score, setScore] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isFinished) return;

    if (timeRemaining <= 0) {
      handleQuizSubmission();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, isOpen, isFinished]);

  if (!isOpen) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleQuizSubmission();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleQuizSubmission = async () => {
    if (isFinished || submitting) return;
    setSubmitting(true);

    // Calculate score
    let computedScore = 0;
    quiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        computedScore += 1;
      }
    });

    setScore(computedScore);
    setIsFinished(true);

    // Persist quiz attempt in Firestore
    if (currentUser) {
      try {
        const attemptData: Omit<QuizAttempt, "id"> = {
          uid: currentUser.uid,
          quizId: quiz.id,
          quizTitle: quiz.title,
          subject: quiz.subject,
          score: computedScore,
          maxScore: quiz.questions.length,
          attemptedAt: new Date() // Will be formatted nicely or we can save custom timestamp
        };
        
        await addDoc(collection(db, "attempts"), {
          ...attemptData,
          attemptedAt: serverTimestamp()
        });
        
        await refreshUserData();
      } catch (err) {
        console.error("Error saving quiz attempt to Firestore:", err);
      }
    }
    setSubmitting(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Banner header with timer */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between text-white shrink-0">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">{quiz.subject} • Class {quiz.studentClass}</span>
            <h3 className="font-display font-bold text-lg leading-snug">{quiz.title}</h3>
          </div>
          
          {!isFinished && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 font-mono text-sm font-semibold">
              <Clock className="w-4 h-4 animate-pulse text-amber-300" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {!isFinished ? (
            <>
              {/* Progress Line */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                  <span>Progress: {currentQuestionIndex + 1} of {quiz.questions.length} questions</span>
                  <span>{Math.round(progressPercent)}% Complete</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="space-y-4">
                <h4 className="font-display font-extrabold text-lg text-slate-900 dark:text-white leading-relaxed">
                  Q{currentQuestionIndex + 1}. {currentQuestion.questionText}
                </h4>

                {/* Options list */}
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        className={`w-full text-left p-4 rounded-2xl border text-sm font-medium flex items-center gap-3 transition-all ${
                          isSelected 
                            ? "bg-blue-50/70 border-blue-400 text-blue-700 dark:bg-blue-950/40 dark:border-blue-700 dark:text-blue-400 font-semibold"
                            : "bg-white border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                        id={`quiz-option-${idx}`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border text-xs ${
                          isSelected 
                            ? "bg-blue-600 border-blue-600 text-white" 
                            : "border-slate-300 dark:border-slate-700"
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            // Results Summary Page
            <div className="space-y-6">
              
              {/* Score card */}
              <div className="bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-950 dark:to-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl text-center space-y-3">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Award className="w-8 h-8" />
                </div>
                
                <h4 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
                  Quiz Completed!
                </h4>
                
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Your answers have been processed and recorded successfully.
                </p>

                <div className="inline-flex items-baseline gap-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl px-5 py-2">
                  <span className="text-slate-400 text-sm">Score:</span>
                  <strong className="text-2xl text-blue-600 dark:text-blue-400 font-black">{score}</strong>
                  <span className="text-slate-400 text-sm">/ {quiz.questions.length}</span>
                </div>
              </div>

              {/* Review section */}
              <div className="space-y-4">
                <h5 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-5 h-5 text-slate-400" />
                  Review Quiz Answers
                </h5>

                <div className="space-y-4">
                  {quiz.questions.map((q, qIdx) => {
                    const chosenIdx = selectedAnswers[qIdx];
                    const correctIdx = q.correctAnswerIndex;
                    const isCorrect = chosenIdx === correctIdx;
                    return (
                      <div 
                        key={qIdx}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            Q{qIdx+1}. {q.questionText}
                          </p>
                          {chosenIdx === undefined ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-amber-500 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-lg border border-amber-100">
                              <AlertTriangle className="w-3.5 h-3.5" /> Skipped
                            </span>
                          ) : isCorrect ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-emerald-100">
                              <CheckCircle className="w-3.5 h-3.5" /> Correct
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-lg border border-rose-100">
                              <XCircle className="w-3.5 h-3.5" /> Incorrect
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-xs">
                          {q.options.map((opt, optIdx) => {
                            let optionStyle = "text-slate-500 dark:text-slate-400";
                            let icon = null;
                            
                            if (optIdx === correctIdx) {
                              optionStyle = "text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/50 dark:bg-emerald-950/10 p-1.5 rounded-lg flex items-center gap-1";
                              icon = <CheckCircle className="w-3.5 h-3.5" />;
                            } else if (optIdx === chosenIdx && !isCorrect) {
                              optionStyle = "text-rose-600 dark:text-rose-400 font-semibold bg-rose-50/50 dark:bg-rose-950/10 p-1.5 rounded-lg flex items-center gap-1";
                              icon = <XCircle className="w-3.5 h-3.5" />;
                            }
                            
                            return (
                              <div key={optIdx} className={optionStyle}>
                                <span className="mr-1.5 font-bold font-mono">{String.fromCharCode(65 + optIdx)})</span>
                                <span>{opt}</span>
                                {icon}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          {!isFinished ? (
            <>
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 disabled:opacity-40"
              >
                Previous
              </button>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleQuizSubmission}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Submit Quiz
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-1 shadow-md shadow-blue-500/10"
                >
                  {currentQuestionIndex === quiz.questions.length - 1 ? "Finish & Submit" : "Next Question"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 text-center text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              Back to Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
