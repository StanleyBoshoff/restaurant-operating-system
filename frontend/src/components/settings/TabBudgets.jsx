import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { DollarSign, Save, Calendar, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

export default function TabBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: bData } = await supabase.from('department_budgets').select('*').order('month_year', { ascending: false });
      const { data: dData } = await supabase.from('employees').select('department').not('department', 'is', null);

      setBudgets(bData || []);
      const uniqueDepts = [...new Set((dData || []).map(d => d.department))];
      setDepartments(uniqueDepts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const addBudget = () => {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    setBudgets([{
      department: departments[0] || 'FOH',
      month_year: firstOfMonth,
      budgeted_hours: 0,
      budgeted_cost: 0
    }, ...budgets]);
  };

  const handleSave = async (budget) => {
    try {
      const { error } = await supabase.from('department_budgets').upsert([budget], { onConflict: 'department, branch, month_year' });
      if (error) throw error;
      alert("Budget saved successfully.");
      fetchData();
    } catch (err) {
      alert("Save failed: " + err.message);
    }
  };

  if (loading) return <div className="py-20 text-center italic text-slate-400">Loading budget matrix...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Labor Budgeting</h3>
          <p className="text-slate-500 text-xs font-medium">Define monthly hour and cost limits per department.</p>
        </div>
        <button
          onClick={addBudget}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
        >
          <Plus size={14} />
          New Budget
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {budgets.map((b, idx) => (
          <SummaryCard key={idx} title={`${b.department} - ${new Date(b.month_year).toLocaleDateString([], { month: 'long', year: 'numeric' })}`} icon={DollarSign}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Department</label>
                <select
                  value={b.department}
                  onChange={e => {
                    const next = [...budgets];
                    next[idx].department = e.target.value;
                    setBudgets(next);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Target Month</label>
                <input
                  type="date"
                  value={b.month_year}
                  onChange={e => {
                    const next = [...budgets];
                    next[idx].month_year = e.target.value;
                    setBudgets(next);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Budgeted Hours</label>
                <input
                  type="number"
                  value={b.budgeted_hours}
                  onChange={e => {
                    const next = [...budgets];
                    next[idx].budgeted_hours = e.target.value;
                    setBudgets(next);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Budgeted Cost (R)</label>
                <input
                  type="number"
                  value={b.budgeted_cost}
                  onChange={e => {
                    const next = [...budgets];
                    next[idx].budgeted_cost = e.target.value;
                    setBudgets(next);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                />
              </div>
              <div className="md:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-50">
                 <button
                  onClick={() => handleSave(b)}
                  className="flex items-center gap-2 px-6 py-2 bg-yellow-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-yellow-500 shadow-md"
                 >
                   <Save size={14} />
                   Commit Budget
                 </button>
              </div>
            </div>
          </SummaryCard>
        ))}
      </div>
    </div>
  );
}
