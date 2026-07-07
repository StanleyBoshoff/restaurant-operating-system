import React from "react";

//We accept "companyName" as a property paramater from the parent App.jsx
export default function Dashboard({ companyName }) {
    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-x1 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">Welcome to {companyName}</h2>
                <p className="text-slate-600 mt-1 text-sm max-w-2x1">
                    Your corporate platform workspace environment is active.  Use the left sidebar menu to safely navigate operations.
                </p>
            </div>
        </div>
    );
}