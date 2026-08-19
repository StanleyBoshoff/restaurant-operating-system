import React, { useState } from 'react';
import { Check, X, Zap, MessageSquare, Plus, Minus } from 'lucide-react';

export default function ChecklistItemMobile({
    item,
    value,
    onChange,
    onCommentClick
}) {
    // value structure: { status: 'tick'|'cross'|'action', comment: '', quantity: 0 }
    const status = value?.status || null;
    const options = item.enabled_options || ['tick', 'cross'];

    const handleStatusChange = (newStatus) => {
        onChange({ ...value, status: newStatus });
    };

    const handleQuantityChange = (delta) => {
        const current = value?.quantity || 0;
        onChange({ ...value, quantity: Math.max(0, current + delta) });
    };

    return (
        <div className={`p-4 rounded-3xl border-2 transition-all ${
            status === 'tick' ? 'bg-emerald-50 border-emerald-200' :
            status === 'cross' ? 'bg-rose-50 border-rose-200' :
            status === 'action' ? 'bg-amber-50 border-amber-200' :
            'bg-white border-slate-100 shadow-sm'
        }`}>
            <div className="flex flex-col gap-4">
                {/* 1. Item Label */}
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <p className={`text-sm font-black uppercase tracking-tight ${status ? 'text-slate-900' : 'text-slate-700'}`}>
                            {item.task_description}
                        </p>
                        {item.is_mandatory && !status && (
                           <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Required Action</span>
                        )}
                    </div>

                    <button
                        onClick={() => onCommentClick(item.id)}
                        className={`p-2 rounded-xl transition-all ${value?.comment ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                        <MessageSquare size={16} fill={value?.comment ? "currentColor" : "none"} />
                    </button>
                </div>

                {/* 2. Action Buttons */}
                <div className="grid grid-cols-3 gap-3">
                    {options.includes('tick') && (
                        <button
                            onClick={() => handleStatusChange('tick')}
                            className={`h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
                                status === 'tick'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                : 'bg-slate-50 text-slate-300 border border-slate-100'
                            }`}
                        >
                            <Check size={28} strokeWidth={4} />
                        </button>
                    )}

                    {options.includes('cross') && (
                        <button
                            onClick={() => handleStatusChange('cross')}
                            className={`h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90 ${
                                status === 'cross'
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-200'
                                : 'bg-slate-50 text-slate-300 border border-slate-100'
                            }`}
                        >
                            <X size={28} strokeWidth={4} />
                        </button>
                    )}

                    {(options.includes('prep') || options.includes('fill')) && (
                        <button
                            onClick={() => handleStatusChange('action')}
                            className={`h-14 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-90 ${
                                status === 'action'
                                ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                                : 'bg-slate-50 text-slate-300 border border-slate-100'
                            }`}
                        >
                            <Zap size={20} strokeWidth={4} fill={status === 'action' ? "white" : "none"} />
                            <span className="text-[8px] font-black uppercase mt-0.5">
                                {options.includes('prep') ? 'Prep' : 'Fill'}
                            </span>
                        </button>
                    )}
                </div>

                {/* 3. Action Variable (Quantity) - Only shows if Action is selected */}
                {status === 'action' && (
                    <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-amber-200 animate-in zoom-in-95 duration-200">
                        <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Quantity {options.includes('prep') ? 'to Prep' : 'to Fill'}</p>
                        <div className="flex items-center gap-4">
                            <button onClick={() => handleQuantityChange(-1)} className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center active:scale-75 transition-all"><Minus size={16}/></button>
                            <span className="text-xl font-black text-amber-900 w-8 text-center">{value?.quantity || 0}</span>
                            <button onClick={() => handleQuantityChange(1)} className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center active:scale-75 transition-all"><Plus size={16}/></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
