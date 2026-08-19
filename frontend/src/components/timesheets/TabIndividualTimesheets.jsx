import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import TabMonthlyRegister from './TabMonthlyRegister';
import SummaryCard from '../common/SummaryCard';
import { Search, User, Filter } from 'lucide-react';

export default function TabIndividualTimesheets() {
  const [employees, setEmployees] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await supabase.from('employees').select('id, first_name, last_name, role').order('first_name');
      setEmployees(data || []);
      setLoading(false);
    };
    fetchEmployees();
  }, []);

  const filtered = employees.filter(e =>
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* 1. Employee Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <SummaryCard title="Select Staff Member" icon={User}>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Filter list..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>

              <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl no-scrollbar">
                {loading ? (
                  <div className="p-4 text-center text-xs text-slate-400 italic">Syncing personnel...</div>
                ) : filtered.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 italic">No matches found.</div>
                ) : (
                  filtered.map(emp => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedId(emp.id)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-all ${
                        selectedId === emp.id ? 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500' : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${
                        selectedId === emp.id ? 'bg-yellow-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-tight">{emp.first_name} {emp.last_name}</p>
                        <p className="text-[9px] font-bold opacity-60 uppercase">{emp.role}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </SummaryCard>
        </div>

        {/* 2. Timesheet Display */}
        <div className="md:col-span-2">
          {selectedId ? (
            <TabMonthlyRegister lockedEmployeeId={selectedId} />
          ) : (
            <div className="h-full min-h-[400px] bg-white border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center p-12 opacity-50">
               <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mb-4 border border-slate-100">
                  <Filter size={32} />
               </div>
               <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Viewing Individual Records</h3>
               <p className="text-xs text-slate-500 max-w-xs mt-2">Select an employee from the registry on the left to view, edit or verify their monthly timesheet data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
