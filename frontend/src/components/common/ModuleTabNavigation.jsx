import React from 'react';
import { NavLink } from 'react-router-dom';

export default function ModuleTabNavigation({ tabs, baseUrl }) {
  return (
    <div className="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
      <div className="flex min-w-max">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path === '' ? baseUrl : `${baseUrl}/${tab.path}`}
            end={tab.path === ''}
            className={({ isActive }) => `
              px-4 py-3 text-[10px] font-black uppercase tracking-[0.15em] transition-all border-b-2
              ${isActive
                ? 'border-slate-800 text-slate-800 bg-slate-50/50'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/30'
              }
            `}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
