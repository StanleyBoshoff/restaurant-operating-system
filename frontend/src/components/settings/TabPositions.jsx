import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { UserCog, Plus, Shield, Trash2, Edit, Save, X, Briefcase } from 'lucide-react';
import { getPositions, savePosition, deletePosition } from '../../utils/settingsService';
import { AUTHORITY_LEVELS } from '../../utils/permissionService';

export default function TabPositions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPos, setEditingPos] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getPositions();
      setPositions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await savePosition(editingPos);
      setEditingPos(null);
      setIsAdding(false);
      fetchData();
    } catch (err) {
      alert("Error saving position: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? Employees linked to this role will need re-assignment.")) return;
    try {
      await deletePosition(id);
      fetchData();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const startEdit = (pos) => {
    setEditingPos(pos);
    setIsAdding(true);
  };

  const startAdd = () => {
    setEditingPos({ role_name: '', classification: 'FOH', authority_level: 6 });
    setIsAdding(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Organization Hierarchy</h3>
          <p className="text-slate-500 text-xs font-medium">Define job titles and departmental authority levels.</p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
        >
          <Plus size={14} />
          Create Position
        </button>
      </div>

      {isAdding && (
        <SummaryCard title={editingPos?.id ? "Modify Position" : "New Position"} icon={UserCog}>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Position Title</label>
              <input
                type="text"
                required
                value={editingPos.role_name}
                onChange={e => setEditingPos({...editingPos, role_name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-yellow-500/20"
                placeholder="e.g. Senior Manager"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Department / Classification</label>
              <select
                value={editingPos.classification}
                onChange={e => setEditingPos({...editingPos, classification: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"
              >
                <option value="Management">Management</option>
                <option value="FOH">Front of House</option>
                <option value="BOH">Back of House</option>
                <option value="Admin">Admin / HR</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Authority Level (1-10)</label>
              <select
                value={editingPos.authority_level}
                onChange={e => setEditingPos({...editingPos, authority_level: parseInt(e.target.value)})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={10-i} value={10-i}>Level {10-i} {10-i === 10 ? '(Admin)' : 10-i === 1 ? '(Entry)' : ''}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-100">
               <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">Cancel</button>
               <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-yellow-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-yellow-500 shadow-md">
                 <Save size={14} />
                 Commit Position
               </button>
            </div>
          </form>
        </SummaryCard>
      )}

      <SummaryCard title="Live Positional Registry" icon={Briefcase}>
        <div className="overflow-x-auto -mx-4 -mb-4">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Job Title</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Power Level</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[13px]">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center italic text-slate-400 animate-pulse">Syncing organizational map...</td></tr>
              ) : positions.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center italic text-slate-400">No positions defined yet.</td></tr>
              ) : (
                positions.map(pos => (
                  <tr key={pos.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          pos.authority_level <= 2 ? 'bg-slate-900 text-yellow-500' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {pos.role_name[0]}
                        </div>
                        <span className="font-bold text-slate-900 uppercase tracking-tight">{pos.role_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[9px] font-black text-slate-500 uppercase">{pos.classification}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex items-center justify-center gap-1.5">
                          <Shield size={12} className={pos.authority_level <= 2 ? 'text-rose-500' : 'text-slate-300'} />
                          <span className="font-black text-xs text-slate-900">LVL {pos.authority_level}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2">
                          <button onClick={() => startEdit(pos)} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all"><Edit size={14} /></button>
                          <button onClick={() => handleDelete(pos.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all"><Trash2 size={14} /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SummaryCard>
    </div>
  );
}
