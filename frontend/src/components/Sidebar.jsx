import React from 'react';
import { LogOut } from 'lucide-react';

export default function Sidebar ({ companyName, navigationItems }) {
    // Hardcoded for user UI visualization phase
    const mockUser = { name: "Stanley Boshoff", role: "General Manager", branch: "Centurion Central" };

    return (
        <aside className="bg-slate-900 text-slate-200 w-64 fixed inset-y-0 left-0 z-50 flex flex-col justify-between border-r border-slate-800">
            <div>
                {/* Brand Header Display Block */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950">
                    <span className="text-xl font-bold tracking-tight text-yellow-600">
                        {companyName} <span className="text-xs font-normal text-slate-500">ROS</span>
                    </span>
                </div>

                {/* Active Staff User Profile Badge */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <p className="text-sm font-semibold truncate text-slate-100">{mockUser.name}</p>
                <p className="text-xs text-yellow-600 font-medium">{mockUser.role}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{mockUser.branch}</p>
                </div>

                {/* Menu loop generating buttons */}
                <nav className="p-3 space-y-1">
                    {navigationItems && navigationItems.map((item) => (
                        <button
                            key={item.id}
                            className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                            >
                                <span>{item.name}</span>
                            </button>
                    ))}
                </nav>
            </div>
            {/* Sidebar Sign Out Footer Option */}
            <div className="p-4 border-t boder-slate-800 bg-slate 950/40">
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-red-950/30 hover:text-red-400 transition-colors">
            <LogOut classname="w-4 h-4" />
            <span>Sign Out</span>
            </button>
            </div>
        </aside>
    );
}