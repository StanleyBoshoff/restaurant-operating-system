import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function NotificationModal({ isOpen, onClose, type = 'success', title, message, onConfirm }) {
  if (!isOpen) return null;

  const handleAction = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={28} className="text-emerald-500" />;
      case 'error':
      case 'warning':
        return <AlertTriangle size={28} className="text-rose-500" />;
      default:
        return <Info size={28} className="text-yellow-500" />;
    }
  };

  const getHeaderBg = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-100';
      case 'error':
      case 'warning':
        return 'bg-rose-50 border-rose-100';
      default:
        return 'bg-yellow-50 border-yellow-100';
    }
  };

  const getBtnStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20';
      case 'error':
      case 'warning':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20';
      default:
        return 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border-2 border-slate-100 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 text-center relative overflow-hidden">

        {/* Top Icon Badge */}
        <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border shadow-inner ${getHeaderBg()}`}>
          {getIcon()}
        </div>

        {/* Text Content */}
        <div className="space-y-1.5">
          <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
            {title || (type === 'success' ? 'Action Completed' : 'Attention Required')}
          </h3>
          <p className="text-xs font-medium text-slate-500 leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleAction}
          className={`w-full py-3 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 cursor-pointer ${getBtnStyle()}`}
        >
          OK
        </button>
      </div>
    </div>
  );
}
