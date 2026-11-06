import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2, XCircle, Info } from 'lucide-react';

export default function QuizEngine({ quiz, onComplete, mode = 'quiz', initialUserAnswers = {} }) {
  const [randomizedQuestions, setRandomizedQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState(initialUserAnswers);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (!quiz || !quiz.questions) return;

    // Fisher-Yates shuffle helper
    const shuffle = (array) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    // 1. Shuffle questions order
    const shuffledQuestions = shuffle(quiz.questions).map(q => {
      // Support both creator format (correctAnswer, incorrect1/2/3) and pre-formatted format
      const correctText = q.correctAnswerText || q.correctAnswer;
      const incorrectTexts = q.incorrectAnswers || [q.incorrect1, q.incorrect2, q.incorrect3].filter(Boolean);

      if (correctText !== undefined && correctText !== null) {
        const allOpts = [
          { text: correctText, isCorrect: true, feedback: 'Correct!' },
          ...incorrectTexts.map(text => ({ text, isCorrect: false, feedback: 'Incorrect. Review training materials.' }))
        ];
        const shuffledOpts = shuffle(allOpts);
        const optionsWithIds = shuffledOpts.map((opt, idx) => ({
          id: ['A', 'B', 'C', 'D'][idx] || String(idx + 1),
          text: opt.text,
          isCorrect: opt.isCorrect,
          feedback: opt.feedback
        }));
        const correctOpt = optionsWithIds.find(o => o.isCorrect);

        return {
          id: q.id || Math.random(),
          question: q.question,
          hint: q.hint,
          options: optionsWithIds,
          correctOptionId: correctOpt ? correctOpt.id : 'A'
        };
      } else {
        // Default mock quiz or pre-formatted quiz options
        const shuffledOpts = shuffle(q.options || []);
        const optionsWithIds = shuffledOpts.map((opt, idx) => ({
          ...opt,
          id: ['A', 'B', 'C', 'D'][idx] || opt.id
        }));
        const correctOpt = optionsWithIds.find(o => o.id === q.correctOptionId || o.isCorrect);
        return {
          ...q,
          options: optionsWithIds,
          correctOptionId: correctOpt ? correctOpt.id : q.correctOptionId
        };
      }
    });

    setRandomizedQuestions(shuffledQuestions);
  }, [quiz]);

  if (randomizedQuestions.length === 0) {
    return <div className="py-12 text-center italic text-slate-400">Loading assessment questions...</div>;
  }

  const currentQuestion = randomizedQuestions[currentIndex];
  const isReview = mode === 'review';

  const handleOptionSelect = (optionId) => {
    if (isReview) return;
    setUserAnswers({ ...userAnswers, [currentQuestion.id]: optionId });
  };

  const nextQuestion = () => {
    if (currentIndex < randomizedQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowHint(false);
    } else if (!isReview) {
      onComplete(userAnswers);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowHint(false);
    }
  };

  const getOptionStyle = (optionId) => {
    const isSelected = userAnswers[currentQuestion.id] === optionId;
    const isCorrect = currentQuestion.correctOptionId === optionId;

    if (isReview) {
      if (isCorrect) return 'border-green-500 bg-green-50';
      if (isSelected && !isCorrect) return 'border-red-500 bg-red-50';
      return 'border-slate-100 bg-white opacity-60';
    }

    if (isSelected) return 'border-yellow-600 bg-yellow-50 ring-2 ring-yellow-600 ring-opacity-20';
    return 'border-slate-200 bg-white hover:border-slate-300';
  };

  return (
    <div className="max-w-2xl mx-auto p-2 sm:p-6 space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
          Question {currentIndex + 1} of {randomizedQuestions.length}
        </div>
        <div className="flex gap-1">
          {randomizedQuestions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-8 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-yellow-600' :
                (userAnswers[randomizedQuestions[idx].id] ? 'bg-slate-200' : 'bg-slate-100')
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">
          {currentQuestion.question}
        </h3>

        {currentQuestion.hint && !isReview && (
          <div>
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-medium text-yellow-700 flex items-center gap-1.5 hover:text-yellow-800 transition-colors cursor-pointer"
            >
              <HelpCircle size={14} />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-800 italic">
                {currentQuestion.hint}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid gap-3">
        {currentQuestion.options && currentQuestion.options.map((option) => (
          <div key={option.id} className="space-y-2">
            <button
              onClick={() => handleOptionSelect(option.id)}
              className={`w-full p-4 text-left rounded-xl border-2 transition-all flex items-center gap-4 cursor-pointer ${getOptionStyle(option.id)}`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                userAnswers[currentQuestion.id] === option.id ? 'bg-yellow-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {option.id}
              </span>
              <span className="flex-1 font-medium text-slate-700">{option.text}</span>

              {isReview && option.id === currentQuestion.correctOptionId && (
                <CheckCircle2 className="text-green-500 shrink-0" size={20} />
              )}
              {isReview && userAnswers[currentQuestion.id] === option.id && option.id !== currentQuestion.correctOptionId && (
                <XCircle className="text-red-500 shrink-0" size={20} />
              )}
            </button>

            {isReview && (option.id === currentQuestion.correctOptionId || userAnswers[currentQuestion.id] === option.id) && (
              <div className="px-4 py-2 text-xs text-slate-500 flex gap-2 items-start animate-in fade-in slide-in-from-top-1 duration-300">
                <Info size={14} className="mt-0.5 shrink-0" />
                <p>{option.feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        <button
          onClick={prevQuestion}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <button
          onClick={nextQuestion}
          disabled={!userAnswers[currentQuestion.id] && !isReview}
          className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 shadow-lg shadow-slate-900/10 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          {currentIndex === randomizedQuestions.length - 1 ? (isReview ? 'Exit Review' : 'Submit Quiz') : 'Next Question'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
