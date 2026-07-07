import React from 'react';
import { UserPlus } from 'lucide-react';

export default function EmployeeDirectory() {
    return (
        <div className="space-y-4">

            {/* 1.  STATION HEADER PORT CONTROL */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Employee Profiles Directory</h2>
                    <p className="text-slate-500 text-xs">Live administrative staff listings streamed directly from cloud data modules.</p>
                </div>

                {/* Active trigger button container to add staff members */}
                <button className="flex items-center space-x-2 bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                    <UserPlus className="w-4 h-4 text-yellow-600" />
                    <span>New Employee</span>
                </button>
            </div>

            {/* 2.  PLACEHOLDER DATA VIEW TABLE */}
            <div className="bg-white border border-slate-200 p-8 rounded-xl text-center shadow-sm">
                <p className="text-sm text-slate-500">
                    The Isolated Employee Directory station is mounted. Handwritten data table grids are ready to load here next.
                </p>
            </div>

        </div>
    );
}