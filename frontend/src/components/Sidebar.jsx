import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { canAccessModule } from '../utils/permissionService';

export default function Sidebar ({ companyName, navigationItems, sidebarOpen, setSidebarOpen }) {
    // Hardcoded for user UI visualization phase
    const mockUser = {
        name: "Stanley Boshoff",
        role: "Master Technician",
        branch: "Admin HQ",
        role_data: {
            authority_level: 10,
            permissions: { can_access_settings: true }
        }
    };

    return (
        <aside className={`bg-slate-900 text-slate-200 fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 ease-in-out
            /* 📱 Mobile Rule: Slide completely out of view off-screen unless mobile open is triggered */
            ${sidebarOpen ? 'translate-x-0 w-48' : '-translate-x-full w-48'}
            /* 💻 Desktop Rule: Override mobile rules on desktop screens to stay docked as wide or compact */
            md:translate-x-0 ${sidebarOpen ? 'md:w-48' : 'md:w-16'}
        `}>

            {/* Brand Header Display Block */}
            <div className="h-12 flex items-center justify-between px-3 border-b border-slate-800 bg-slate-950 overflow-hidden shrink-0">
                <div className="md:hidden block">
                    <span className="text-base font-bold tracking-tight text-yellow-600">
                        {companyName} <span className="text-[9px] font-normal text-slate-500 uppercase">ROS</span>
                    </span>
                </div>
                <div className="hidden md:block">
                    {sidebarOpen ? (
                        <span className="text-base font-bold tracking-tight text-yellow-600 truncate">
                            {companyName} <span className="text-[9px] font-normal text-slate-500 uppercase">ROS</span>
                        </span>
                    ) : (
                        <span className="text-sm font-bold text-yellow-600 mx-auto">R</span>
                    )}
                </div>

                <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors text-xs font-medium border border-slate-800"
                >
                    Close
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {/* Active Staff User Profile Badge */}
                <div className={`p-2.5 border-b border-slate-800 bg-slate-900/40 transition-all ${sidebarOpen ? 'block' : 'hidden'}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-yellow-600 font-bold text-[10px] shadow-inner">
                            SB
                        </div>
                        <div className="min-w-0">
                            <p className="text-[12px] font-bold truncate text-slate-100 leading-none mb-0.5">{mockUser.name}</p>
                            <p className="text-[8px] text-yellow-600 font-bold uppercase tracking-widest leading-none">{mockUser.role}</p>
                        </div>
                    </div>
                </div>

                {/* Menu loop generating NavLinks */}
                <nav className="p-1 space-y-0">
                    {navigationItems && navigationItems
                        .filter(item => canAccessModule(mockUser, item.id))
                        .map((item) => {
                            const IconComponent = item.icon;
                        
                        return (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) => `
                                w-full flex items-center rounded-lg text-[12px] font-bold transition-all duration-200 border cursor-pointer
                                ${sidebarOpen
                                    ? 'px-2 py-1.5 space-x-2 justify-start'
                                    : 'p-1.5 justify-center'
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
                                    className={`w-4 h-4 shrink-0 transition-all ${sidebarOpen ? '' : 'mx-auto'}`}
                                />
                            )}
                            {sidebarOpen && <span className="truncate tracking-tight">{item.name}</span>}
                        </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="p-2 border-t border-slate-800 bg-slate-950/40 overflow-hidden shrink-0">
                <button className={`w-full flex items-center rounded-lg text-[11px] text-slate-400 hover:bg-red-950/30 hover:text-red-400 transition-colors cursor-pointer ${
                    sidebarOpen ? 'px-2 py-1.5 space-x-2 justify-start' : 'p-1.5 justify-center'
                }`}>
                    <LogOut className="w-4 h-4 shrink-0" />
                    {sidebarOpen && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
