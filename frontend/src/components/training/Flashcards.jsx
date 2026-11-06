import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

export default function Flashcards({ cards, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center">
        <p className="text-slate-400 italic text-xs uppercase font-bold tracking-widest">No flashcards configured for this session.</p>
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg text-xs uppercase tracking-widest cursor-pointer"
        >
          Continue to Next Step
        </button>
      </div>
    );
  }

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      onComplete();
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 space-y-6 w-full max-w-xl mx-auto">
      <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
        Flashcard {currentIndex + 1} of {cards.length}
      </div>

      <div
        className="relative w-full h-64 sm:h-72 cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute inset-0 bg-white border-2 border-slate-100 rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 sm:p-8 backface-hidden">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 text-center uppercase tracking-tight">{currentCard.term || currentCard.front}</h3>
            <div className="mt-8 text-slate-300 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <RotateCw size={14} /> Tap to reveal definition
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 bg-slate-900 border-2 border-slate-800 rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 sm:p-8 backface-hidden rotate-y-180 text-white">
            <p className="text-sm sm:text-base text-center font-medium leading-relaxed">{currentCard.definition || currentCard.back}</p>
            <div className="mt-8 text-slate-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <RotateCw size={14} /> Tap to flip back
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-6 w-full justify-between px-2">
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="p-3 rounded-2xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={nextCard}
          className="flex-1 max-w-xs py-3.5 bg-yellow-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          {currentIndex === cards.length - 1 ? 'Finish Study' : 'Next Card'}
          <ChevronRight size={18} />
        </button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
