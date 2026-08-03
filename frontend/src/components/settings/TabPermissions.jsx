import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { ShieldCheck, Save, Check, X, AlertCircle } from 'lucide-react';
import { getPositions, updateRolePermissions } from '../../utils/settingsService';

const PERMISSION_KEYS = [
  { id: 'can_access_settings', label: 'Access System Settings', desc: 'Allow user to change roles, permissions and system config.' },
  { id: 'can_view_salary', label: 'View Salary / Wages', desc: 'Allow viewing sensitive financial data in profiles.' },
  { id: 'can_manage_disciplinary', label: 'Manage Disciplinary', desc: 'Access to Legal Shield wizard and records.' },
  { id: 'can_approve_leave', label: 'Approve Leave Requests', desc: 'Authorize or reject staff leave blocks.' },
  { id: 'can_view_all_staff', label: 'Cross-Department Visibility', desc: 'See staff outside of own assigned department.' },
];

export default function TabPermissions() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await getPositions();
      setRoles(data || []);
      if (data && data.length > 0) {
        selectRole(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (role) => {
    setSelectedRole(role);
    setPermissions(role.permissions || {});
  };

  const togglePermission = (key) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateRolePermissions(selectedRole.id, permissions);
      // Update local state
      setRoles(roles.map(r => r.id === selectedRole.id ? { ...r, permissions } : r));
      alert("Permissions updated for " + selectedRole.role_name);
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Security Matrix</h3>
          <p className="text-slate-500 text-xs font-medium">Configure granular access for each authority level.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Role Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Select Authority</p>
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => selectRole(role)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all border-2 flex items-center justify-between group ${
                selectedRole?.id === role.id
                ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                : 'bg-white border-slate-100 hover:border-yellow-600 text-slate-600'
              }`}
            >
              <div className="min-w-0">
                <p className="text-xs font-black uppercase truncate tracking-tight">{role.role_name}</p>
                <p className={`text-[9px] font-bold ${selectedRole?.id === role.id ? 'text-yellow-500' : 'text-slate-400'}`}>LVL {role.authority_level}</p>
              </div>
              <ShieldCheck size={14} className={selectedRole?.id === role.id ? 'text-yellow-500' : 'text-slate-200 group-hover:text-yellow-600'} />
            </button>
          ))}
        </div>

        {/* Permission Grid */}
        <div className="lg:col-span-3 space-y-6">
          <SummaryCard
            title={`Permissions for ${selectedRole?.role_name || '...'}`}
            icon={ShieldCheck}
            badge={
              <button
                onClick={handleSave}
                disabled={isSaving || !selectedRole}
                className="flex items-center gap-2 px-3 py-1 bg-yellow-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500 shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Save size={12} />
                {isSaving ? 'Syncing...' : 'Save Matrix'}
              </button>
            }
          >
            {selectedRole?.authority_level === 1 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-8">
                 <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-yellow-500 mb-4 shadow-xl">
                   <ShieldCheck size={32} />
                 </div>
                 <h4 className="text-sm font-black text-slate-900 uppercase">System Administrator (Lvl 1)</h4>
                 <p className="text-xs text-slate-400 mt-2 max-w-xs font-medium italic">
                    Level 1 accounts have bypass-level clearance. All security checks are automatically granted for this authority level.
                 </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 -mx-4 -mb-4">
                {PERMISSION_KEYS.map(perm => {
                  const isActive = permissions[perm.id];
                  return (
                    <button
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className="w-full flex items-start gap-4 p-5 hover:bg-slate-50 transition-all text-left group"
                    >
                      <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                        isActive ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-inner' : 'bg-white border-slate-100 text-slate-200 group-hover:border-slate-300'
                      }`}>
                        {isActive ? <Check size={20} strokeWidth={3} /> : <X size={20} strokeWidth={3} />}
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-xs font-black uppercase tracking-tight ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>{perm.label}</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{perm.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </SummaryCard>

          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-start gap-4">
             <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
                <AlertCircle size={20} />
             </div>
             <div>
                <h4 className="text-[10px] font-black text-rose-800 uppercase tracking-widest mb-1">Security Warning</h4>
                <p className="text-[11px] text-rose-700 leading-relaxed font-medium">
                  Changes to the security matrix take effect immediately across all sessions. Restricting a manager's access while they are performing actions may result in data sync interruptions.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
