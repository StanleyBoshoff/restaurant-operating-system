import React, { useState } from 'react';
import { Play, BookOpen, GraduationCap, RotateCcw, ArrowRight, X } from 'lucide-react';
import Flashcards from './Flashcards';
import QuizEngine from './QuizEngine';

const STEPS = {
  VIDEO: 'video',
  FLASHCARDS: 'flashcards',
  QUIZ: 'quiz',
  RESULTS: 'results',
  REVIEW: 'review'
};

export default function CoursePlayer({ course, onClose, onProgressUpdate }) {
  const [currentStep, setCurrentStep] = useState(STEPS.VIDEO);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);

  const handleQuizComplete = (answers) => {
    setUserAnswers(answers);
    let correctCount = 0;
    course.quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctOptionId) correctCount++;
    });
    const finalScore = Math.round((correctCount / course.quiz.questions.length) * 100);
    setScore(finalScore);

    // Step 3: Quiz logic (Only 100% progress if score >= 90)
    if (finalScore >= 90) {
      onProgressUpdate(100);
    }

    setCurrentStep(STEPS.RESULTS);
  };

  const renderContent = () => {
    switch (currentStep) {
      case STEPS.VIDEO:
        return (
          <div className="space-y-6">
            <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative group">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${course.youtubeId || 'dQw4w9WgXcQ'}`}
                title="Course Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Step 1: Video Lesson</h2>
              <p className="text-slate-500 max-w-md">Watch this introductory video to understand the core concepts of {course.title}.</p>
              <button
                onClick={() => {
                  setCurrentStep(STEPS.FLASHCARDS);
                  onProgressUpdate(33); // Step 1 complete
                }}
                className="px-8 py-3 bg-yellow-600 text-white font-bold rounded-xl hover:bg-yellow-700 shadow-lg shadow-yellow-600/20 transition-all flex items-center gap-2"
              >
                Continue to Flashcards
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        );

      case STEPS.FLASHCARDS:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Step 2: Study Session</h2>
              <p className="text-slate-500">Memorize these key terms before starting the assessment.</p>
            </div>
            <Flashcards
              cards={course.flashcards}
              onComplete={() => {
                setCurrentStep(STEPS.QUIZ);
                onProgressUpdate(66); // Step 2 complete
              }}
            />
          </div>
        );

      case STEPS.QUIZ:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Step 3: Assessment</h2>
              <p className="text-slate-500">Test your knowledge on {course.title}.</p>
            </div>
            <QuizEngine
              quiz={course.quiz}
              onComplete={handleQuizComplete}
              mode="quiz"
            />
          </div>
        );

      case STEPS.RESULTS:
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-8 text-center">
            <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center text-3xl font-black ${
              score >= 80 ? 'border-green-500 text-green-600 bg-green-50' : 'border-yellow-500 text-yellow-600 bg-yellow-50'
            }`}>
              {score}%
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                {score >= 80 ? 'Well Done!' : 'Keep Practicing!'}
              </h2>
              <p className="text-slate-500 max-w-xs mx-auto">
                You scored {score}% on the {course.title} assessment.
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setCurrentStep(STEPS.REVIEW)}
                  className="flex-1 px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen size={20} />
                  Review Answers
                </button>
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setCurrentStep(STEPS.VIDEO);
                  }}
                  className="flex-1 px-6 py-4 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  Retake
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full px-6 py-4 bg-slate-100 text-slate-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 border border-slate-200"
              >
                Return to Courses
              </button>
            </div>
          </div>
        );

      case STEPS.REVIEW:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Review Mode</h2>
              <p className="text-slate-500 italic">Seeing where you can improve is the best way to learn.</p>
            </div>
            <QuizEngine
              quiz={course.quiz}
              initialUserAnswers={userAnswers}
              mode="review"
              onComplete={() => onClose()}
            />
            <div className="flex justify-center pb-8">
              <button
                onClick={onClose}
                className="px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Finish Review & Return to Courses
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
            <GraduationCap size={20} />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight">{course.title}</h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <span className={currentStep === STEPS.VIDEO ? 'text-yellow-600' : ''}>VIDEO</span>
              <span>•</span>
              <span className={currentStep === STEPS.FLASHCARDS ? 'text-yellow-600' : ''}>STUDY</span>
              <span>•</span>
              <span className={currentStep === STEPS.QUIZ ? 'text-yellow-600' : ''}>QUIZ</span>
              <span>•</span>
              <span className={currentStep === STEPS.RESULTS ? 'text-yellow-600' : ''}>RESULTS</span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50">
        <div className="max-w-4xl mx-auto py-12 px-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
