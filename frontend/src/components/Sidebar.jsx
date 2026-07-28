import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function Sidebar ({ companyName, navigationItems, sidebarOpen, setSidebarOpen }) {
    // Hardcoded for user UI visualization phase
    const mockUser = { name: "Stanley Boshoff", role: "General Manager", branch: "Centurion Central" };

    return (
        <aside className={`bg-slate-900 text-slate-200 fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 ease-in-out
            /* 📱 Mobile Rule: Slide completely out of view off-screen unless mobile open is triggered */
            ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
            /* 💻 Desktop Rule: Override mobile rules on desktop screens to stay docked as wide or compact */
            md:translate-x-0 ${sidebarOpen ? 'md:w-64' : 'md:w-16'}
        `}>

            {/* Brand Header Display Block */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950 overflow-hidden shrink-0">
                <div className="md:hidden block">
                    <span className="text-xl font-bold tracking-tight text-yellow-600">
                        {companyName} <span className="text-xs font-normal text-slate-500">ROS</span>
                    </span>
                </div>
                <div className="hidden md:block">
                    {sidebarOpen ? (
                        <span className="text-xl font-bold tracking-tight text-yellow-600 truncate">
                            {companyName} <span className="text-xs font-normal text-slate-500">ROS</span>
                        </span>
                    ) : (
                        <span className="text-sm font-bold text-yellow-600 mx-auto">R</span>
                    )}
                </div>

                <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors text-xs font-medium border border-slate-800"
                >
                    Close
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {/* Active Staff User Profile Badge */}
                <div className={`p-4 border-b border-slate-800 bg-slate-900/40 transition-all ${sidebarOpen ? 'block' : 'hidden'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-yellow-600 font-bold text-sm shadow-inner">
                            SB
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold truncate text-slate-100 leading-none mb-1">{mockUser.name}</p>
                            <p className="text-[10px] text-yellow-600 font-bold uppercase tracking-widest leading-none">{mockUser.role}</p>
                        </div>
                    </div>
                </div>

                {/* Menu loop generating NavLinks */}
                <nav className="p-3 space-y-1">
                    {navigationItems && navigationItems.map((item) => {
                        const IconComponent = item.icon;
                        
                        return (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) => `
                                w-full flex items-center rounded-xl text-[13px] font-bold transition-all duration-200 border cursor-pointer
                                ${sidebarOpen
                                    ? 'px-3 py-2.5 space-x-3 justify-start' 
                                    : 'p-2.5 justify-center'
                                }
                                ${isActive
                                    ? 'bg-slate-800 text-yellow-600 border-slate-700 shadow-md ring-1 ring-white/5'
                                    : 'text-slate-400 border-transparent hover:bg-slate-800/40 hover:text-slate-200'
                                }
                            `}
                            title={item.name}
                        >
                            {IconComponent && (
                                <IconComponent 
                                    className={`w-5 h-5 shrink-0 transition-all ${sidebarOpen ? '' : 'mx-auto'}`}
                                />
                            )}
                            {sidebarOpen && <span className="truncate tracking-tight">{item.name}</span>}
                        </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 overflow-hidden shrink-0">
                <button className={`w-full flex items-center rounded-lg text-sm text-slate-400 hover:bg-red-950/30 hover:text-red-400 transition-colors cursor-pointer ${
                    sidebarOpen ? 'px-3 py-2 space-x-3 justify-start' : 'p-2.5 justify-center'
                }`}>
                    <LogOut className="w-5 h-5 shrink-0" />
                    {sidebarOpen && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
