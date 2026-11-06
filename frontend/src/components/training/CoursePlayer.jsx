import React, { useState } from 'react';
import { Play, BookOpen, GraduationCap, RotateCcw, ArrowRight, X, CheckCircle } from 'lucide-react';
import Flashcards from './Flashcards';
import QuizEngine from './QuizEngine';

export default function CoursePlayer({ course, onClose, onProgressUpdate }) {
  // Build steps list: use course.stepsList if available, or construct standard steps
  const rawSteps = course.stepsList || course.steps?.stepsList || [
    { type: 'video', title: 'Video Lesson', videoUrl: `https://www.youtube.com/watch?v=${course.youtubeId || 'dQw4w9WgXcQ'}`, description: course.description || '' },
    { type: 'flashcards', title: 'Study Session', cards: course.flashcards || [] },
    { type: 'quiz', title: 'Assessment', questions: course.quiz?.questions || [] }
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentStep = rawSteps[currentStepIndex] || rawSteps[0];

  const handleQuizComplete = (answers) => {
    setUserAnswers(answers);
    const questionsList = currentStep.questions || course.quiz?.questions || [];
    let correctCount = 0;
    questionsList.forEach(q => {
      if (answers[q.id] === q.correctOptionId) correctCount++;
    });
    const finalScore = questionsList.length > 0 ? Math.round((correctCount / questionsList.length) * 100) : 100;
    setScore(finalScore);

    // 90% is the pass threshold as requested
    if (finalScore >= 90) {
      onProgressUpdate(100);
      setIsCompleted(true);
    } else {
      onProgressUpdate(75);
      setIsCompleted(true); // Show results screen with score & pass/fail status
    }
  };

  const nextStep = () => {
    if (currentStepIndex < rawSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      const progressPct = Math.round(((currentStepIndex + 1) / rawSteps.length) * 100);
      onProgressUpdate(progressPct);
    } else {
      setIsCompleted(true);
      onProgressUpdate(100);
    }
  };

  // Helper to extract YouTube ID from URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return `https://www.youtube.com/embed/${course.youtubeId || 'dQw4w9WgXcQ'}`;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  };

  const renderStepContent = () => {
    if (isCompleted) {
      const passed = score >= 90;
      return (
        <div className="flex flex-col items-center justify-center py-12 px-4 space-y-8 text-center w-full max-w-lg mx-auto">
          <div className={`w-28 h-28 rounded-full border-8 flex items-center justify-center text-2xl font-black ${
            passed ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-rose-500 text-rose-600 bg-rose-50'
          }`}>
            {score}%
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
              {passed ? 'Masterclass Passed! 🎉' : 'Assessment Failed ❌'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
              You scored <span className="font-bold text-slate-900">{score}%</span> on {course.title}.
              {passed ? ' Outstanding work!' : ' Required pass threshold is 90%. Please review and try again.'}
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => {
                setIsCompleted(false);
                setCurrentStepIndex(0);
                setUserAnswers({});
                setScore(0);
              }}
              className="w-full px-6 py-3.5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={16} /> Retake Course
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-3.5 bg-slate-100 text-slate-700 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200 transition-all border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              Return to Courses
            </button>
          </div>
        </div>
      );
    }

    if (!currentStep) return null;

    switch (currentStep.type) {
      case 'video':
        const videoEmbed = getYouTubeEmbedUrl(currentStep.videoUrl || course.youtubeId);
        return (
          <div className="space-y-6 w-full max-w-3xl mx-auto p-4 sm:p-6">
            <div className="aspect-video w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 shadow-xl relative">
              <iframe
                className="w-full h-full"
                src={videoEmbed}
                title={currentStep.title || 'Video Lesson'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex flex-col items-center text-center space-y-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">{currentStep.title || 'Video Lesson'}</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md font-medium leading-relaxed">{currentStep.description || course.description || 'Watch this video to understand core operational concepts.'}</p>
              <button
                onClick={nextStep}
                className="mt-4 px-8 py-3.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                Continue to Next Step <ArrowRight size={16} />
              </button>
            </div>
          </div>
        );

      case 'flashcards':
        const cardsList = currentStep.cards || course.flashcards || [];
        return (
          <div className="space-y-6 w-full max-w-2xl mx-auto p-4 sm:p-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">{currentStep.title || 'Study Session'}</h2>
              <p className="text-xs text-slate-500 font-medium">Memorize these key terms before starting the assessment.</p>
            </div>
            <Flashcards
              cards={cardsList}
              onComplete={nextStep}
            />
          </div>
        );

      case 'quiz':
        const quizObj = currentStep.questions ? { questions: currentStep.questions } : course.quiz || { questions: [] };
        return (
          <div className="space-y-6 w-full max-w-2xl mx-auto p-4 sm:p-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">{currentStep.title || 'Assessment'}</h2>
              <p className="text-xs text-slate-500 font-medium">Test your knowledge on {course.title}.</p>
            </div>
            <QuizEngine
              quiz={quizObj}
              onComplete={handleQuizComplete}
              mode="quiz"
            />
          </div>
        );

      default:
        return (
          <div className="p-12 text-center space-y-4">
            <p className="text-xs text-slate-400 uppercase font-bold">Unknown step type.</p>
            <button onClick={nextStep} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase cursor-pointer">Continue</button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-20 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0">
            <GraduationCap size={20} />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">{course.title}</h1>
            <div className="flex items-center gap-2 text-[9px] font-black tracking-widest text-slate-400 uppercase mt-0.5 overflow-x-auto">
              {rawSteps.map((s, idx) => (
                <React.Fragment key={idx}>
                  <span className={currentStepIndex === idx && !isCompleted ? 'text-yellow-600 font-black' : ''}>
                    {s.title || s.type.toUpperCase()}
                  </span>
                  {idx < rawSteps.length - 1 && <span>•</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Content Area - Fully Responsive & Screen Fitting */}
      <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 bg-slate-50/50">
        <div className="w-full max-w-4xl bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden my-auto">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
