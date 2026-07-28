import React from 'react';
import { LogOut } from 'lucide-react';

export default function Sidebar ({ companyName, navigationItems, currentModule, setCurrentModule, sidebarOpen, setSidebarOpen }) {
    // Hardcoded for user UI visualization phase
    const mockUser = { name: "Stanley Boshoff", role: "General Manager", branch: "Centurion Central" };

            return (
        <aside className={`bg-slate-900 text-slate-200 fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-slate-800 transition-all duration-200 ease-in-out
            /* 📱 Mobile Rule: Slide completely out of view off-screen unless mobile open is triggered */
            ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
            /* 💻 Desktop Rule: Override mobile rules on desktop screens to stay docked as wide or compact */
            md:translate-x-0 ${sidebarOpen ? 'md:w-64' : 'md:w-16'}
        `}>

            <div>
                {/* Brand Header Display Block */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950 overflow-hidden">
                    {/* Desktop Mode text switch */}
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

                    {/* 📱 NEW MOBILE-ONLY CLOSE TOUCH TARGET BUTTON */}
                    <button 
                        onClick={() => setSidebarOpen(false)} 
                        className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors text-xs font-medium border border-slate-800"
                    >
                        Close
                    </button>
                </div>


                {/* Active Staff User Profile Badge */}
                <div className={`p-4 border-b border-slate-800 bg-slate-900/50 ${sidebarOpen ? 'block' : 'hidden'}`}>
                <p className="text-sm font-semibold truncate text-slate-100">{mockUser.name}</p>
                <p className="text-xs text-yellow-600 font-medium">{mockUser.role}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{mockUser.branch}</p>
                </div>

                {/* Menu loop generating buttons */}
                <nav className="p-3 space-y-1">
                    {navigationItems && navigationItems.map((item) => {
                        const isActive = currentModule === item.id;
                        
                        const IconComponent = item.icon;
                        
                        return (
                        <button
                            key={item.id}
                            onClick={() => setCurrentModule(item.id)}
                            className={`w-full flex items-center rounded-lg text-sm font-medium transition-all duration-150 border cursor-pointer ${
                                /* 📱 Desktop Stance padding layout switches */
                                sidebarOpen 
                                    ? 'px-3 py-2.5 space-x-3 justify-start' 
                                    : 'p-2.5 justify-center'
                            } ${
                                isActive
                                    ? 'bg-slate-800 text-yellow-600 border-slate-700 shadow-sm'
                                    : 'text-slate-400 border-transparent hover:bg-slate-800/60 hover:text-slate-100'
                            }`}
                            title={item.name} // Gives a clean hover tooltip text on slim mode
                        >
                            {IconComponent && (
                                <IconComponent 
                                    className={`w-5 h-5 shrink-0 transition-colors ${
                                        isActive ? 'text-yellow-600' : 'text-slate-400'
                                    }`} 
                                />
                            )}
                            
                            {/* Hide text words if the menu rail contracts into an icon column */}
                            {sidebarOpen && <span className="truncate text-slate-200">{item.name}</span>}
                        </button>
                        );
                    })}
                </nav>

            </div>

            {/* Sidebar Sign Out Footer Option */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40 overflow-hidden">
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