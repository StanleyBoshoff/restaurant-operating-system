import React, { useState } from 'react';
import { X, MessageSquare, Send } from 'lucide-react';

export default function CommentModal({
    isOpen,
    onClose,
    onSave,
    initialValue,
    title
}) {
    const [text, setText] = useState(initialValue || '');

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(text);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">

                {/* Header */}
                <div className="p-6 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                            <MessageSquare size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Add Remark</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[200px]">{title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100"><X size={20}/></button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <textarea
                        autoFocus
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type your notes here..."
                        className="w-full h-40 bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 text-sm font-medium focus:border-blue-500 outline-none transition-all placeholder:text-slate-300 no-scrollbar"
                    />

                    <button
                        onClick={handleSave}
                        className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98]"
                    >
                        <Send size={16} />
                        Save Comment
                    </button>
                </div>

                <div className="pb-8 text-center px-8">
                   <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed">
                      Comments are mandatory for any tasks marked with a cross or requiring specific action.
                   </p>
                </div>
            </div>
        </div>
    );
}
