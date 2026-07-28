import React from 'react';

export default function SummaryCard({
  title,
  children,
  footer,
  icon: Icon,
  badge,
  titleColor = "text-yellow-600",
  iconColor = "text-yellow-600"
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={14} className={iconColor} />}
          <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${titleColor}`}>{title}</h3>
        </div>
        {badge}
      </div>
      <div className="p-4 flex-1">
        {children}
      </div>
      {footer && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
          {footer}
        </div>
      )}
    </div>
  );
}
