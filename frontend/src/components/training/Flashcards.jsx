import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

export default function Flashcards({ cards, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

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
    <div className="flex flex-col items-center justify-center p-8 space-y-6 min-h-[400px]">
      <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">
        Flashcard {currentIndex + 1} of {cards.length}
      </div>

      <div
        className="relative w-full max-w-md h-64 cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute inset-0 bg-white border-2 border-slate-100 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 backface-hidden">
            <h3 className="text-2xl font-bold text-slate-800 text-center">{currentCard.term}</h3>
            <div className="mt-8 text-slate-300 flex items-center gap-2 text-xs">
              <RotateCw size={14} /> Tap to reveal definition
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 backface-hidden rotate-y-180 text-white">
            <p className="text-lg text-center leading-relaxed">{currentCard.definition}</p>
            <div className="mt-8 text-slate-500 flex items-center gap-2 text-xs">
              <RotateCw size={14} /> Tap to flip back
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={prevCard}
          disabled={currentIndex === 0}
          className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <button
          onClick={nextCard}
          className="px-8 py-3 bg-yellow-600 text-white font-bold rounded-xl hover:bg-yellow-700 shadow-lg shadow-yellow-600/20 transition-all flex items-center gap-2"
        >
          {currentIndex === cards.length - 1 ? 'Finish Study' : 'Next Card'}
          <ChevronRight size={20} />
        </button>
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
