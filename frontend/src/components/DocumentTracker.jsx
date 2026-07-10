import React from 'react';
import { FilePlus } from 'lucide-react';

export default function DocumentTracker() {
    return (
        <div className="space-y-4 animate-in fade-in duration-200">
            {/* Station Header Interface Control */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Personnel Documents Vault</h2>
                    <p className="text-slate-500 text-xs">Digital contract lockers and compliance files stored in cloud buckets.</p>
                </div>

                {/* Upload action Button */}
                <button className="flex items-center space-x-2 bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                    <FilePlus classname="w-4 h-4 text-yello-600" />
                    <span>Upload new Document</span>
                </button>
            </div>

            {/* Main structural Data Placeholder area */}
            <div className="bg-white border border-slate-200 p-12 rounded-xl text-center shadow-xs">
                <p className="text-sm text-slate-400 italic">
                    The Document Vault station is officially mounted. Cloud storage bucket pipes will be wired here next!
                </p>
            </div>
        </div>
    );
}