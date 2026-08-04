import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { ShieldCheck, Save, Check, X, AlertCircle, Lock, Users, Wallet, ClipboardList, Gavel, BarChart3, Settings } from 'lucide-react';
import { getAllAuthorityLevels, saveAuthorityMatrix } from '../../utils/settingsService';

const ABILITIES = [
  { group: 'Personnel & Finance', icon: Users, items: [
    { id: 'can_view_all_staff', label: 'View All Staff Profiles', desc: 'Allow visibility of employees outside own department.' },
    { id: 'can_edit_personnel', label: 'Modify Staff Details', desc: 'Edit contact info, roles and employment dates.' },
    { id: 'can_delete_personnel', label: 'Delete Staff Profile', desc: 'Permanently remove personnel records (High Risk).' },
    { id: 'can_view_salary', label: 'View Salary / Wages', desc: 'Visibility of financial compensation data.' },
    { id: 'can_edit_salary', label: 'Modify Salary / Wages', desc: 'Ability to update pay rates and salaries.' },
    { id: 'can_view_bank_details', label: 'View Bank Details', desc: 'Access to employee banking and tax information.' },
  ]},
  { group: 'Operations & Attendance', icon: ClipboardList, items: [
    { id: 'can_view_timesheets', label: 'View Attendance Registry', desc: 'Access to store-wide attendance logs.' },
    { id: 'can_export_payroll', label: 'Export Payroll Data', desc: 'Download CSV/PDF reports for payroll processing.' },
    { id: 'can_manage_checklists', label: 'Manage Checklists', desc: 'Define and clear store operational protocols.' },
    { id: 'can_submit_forms', label: 'Submit Admin Forms', desc: 'Log Incidents, Cash-Ups and Temp Logs.' },
    { id: 'can_edit_attendance_register', label: 'Edit Attendance Register', desc: 'Modify hours in the monthly payroll grid.' },
    { id: 'can_edit_committed_timesheets', label: 'Unlock Committed Timesheets', desc: 'Modify records already finalized for payroll (HR Level).' },
    { id: 'can_edit_terminal_records', label: 'Edit Terminal Clockings', desc: 'Override high-integrity data from the Live Clock (Audit Risk).' },
    { id: 'can_reset_system', label: 'Reset Operational Data', desc: 'Clear daily logs or reset store state.' },
  ]},
  { group: 'HR & Disciplinary', icon: Gavel, items: [
    { id: 'can_manage_disciplinary', label: 'Manage Disciplinary', desc: 'Access to Legal Shield and Warning history.' },
    { id: 'can_launch_wizard', label: 'Launch Legal Wizard', desc: 'Use AI-Expert logic to draft formal warnings.' },
    { id: 'can_delete_warnings', label: 'Delete Warning Records', desc: 'Remove disciplinary history (High Audit Risk).' },
    { id: 'can_view_leave_tracker', label: 'View Team Leave Tracker', desc: 'Access to full store availability calendar.' },
    { id: 'can_approve_leave', label: 'Authorize Leave Requests', desc: 'Approve or Deny staff leave applications.' },
  ]},
  { group: 'Analytics & Reporting', icon: BarChart3, items: [
    { id: 'can_view_reports', label: 'Access Reports Module', desc: 'General visibility of the reporting dashboard.' },
    { id: 'can_view_financial_reports', label: 'View Financial Analytics', desc: 'Access to Leave Liability and Labour Costing.' },
    { id: 'can_use_custom_builder', label: 'Use Custom Report Builder', desc: 'Design bespoke data exports.' },
    { id: 'can_view_legal_bundle', label: 'Access CCMA Legal Bundle', desc: 'High-stakes statutory evidence reports.' },
  ]},
  { group: 'System Administration', icon: Settings, items: [
    { id: 'can_access_settings', label: 'Access System Settings', desc: 'Modify branches, departments and system config.' },
    { id: 'can_manage_roles', label: 'Manage Authority Matrix', desc: 'Change permissions for levels 1 through 10.' },
    { id: 'can_manage_users', label: 'User Account Management', desc: 'Create and disable system login accounts.' },
  ]}
];

export default function TabPermissions() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMatrix();
  }, []);

  const fetchMatrix = async () => {
    try {
      const data = await getAllAuthorityLevels();

      // Always construct a full 1-10 range to ensure all columns appear
      const fullMatrix = Array.from({ length: 10 }, (_, i) => {
        const level = 10 - i;
        const existing = data?.find(d => d.level === level);
        return {
          level,
          permissions: existing?.permissions || {}
        };
      });

      setLevels(fullMatrix);
    } catch (err) {
      console.error(err);
      // Fallback to empty defaults if DB fails
      setLevels(Array.from({length: 10}, (_, i) => ({ level: 10 - i, permissions: {} })));
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (lvlNum, key) => {
    if (lvlNum === 10) return; // Level 10 is Admin-Locked

    setLevels(prev => prev.map(l => {
      if (l.level === lvlNum) {
        const newPerms = { ...l.permissions };
        newPerms[key] = !newPerms[key];
        return { ...l, permissions: newPerms };
      }
      return l;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveAuthorityMatrix(levels);
      alert("Master Security Matrix committed successfully.");
    } catch (err) {
      alert("Sync failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center animate-pulse italic text-slate-400">Syncing security matrix...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">Security Matrix</h3>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Master Authority Control (Level 10 down to 1)</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'Syncing...' : 'Commit Matrix'}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed min-w-[1200px]">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="sticky left-0 z-30 bg-slate-900 w-64 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-left border-r border-slate-800">
                  Ability / Section
                </th>
                {levels.map(l => (
                  <th key={l.level} className="px-1 py-4 text-center border-r border-slate-800 last:border-r-0">
                    <div className="flex flex-col items-center gap-1">
                       <span className={`text-[14px] font-black leading-none ${l.level === 10 ? 'text-yellow-500' : ''}`}>{l.level}</span>
                       <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">LVL</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ABILITIES.map(group => (
                <React.Fragment key={group.group}>
                  <tr className="bg-slate-50/80">
                    <td colSpan={11} className="sticky left-0 z-20 px-6 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                      <group.icon size={12} />
                      {group.group}
                    </td>
                  </tr>
                  {group.items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 px-6 py-3 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <p className="text-[10px] font-bold text-slate-700 leading-tight">{item.label}</p>
                        <p className="text-[7px] text-slate-400 font-medium leading-tight mt-0.5 uppercase tracking-tighter">{item.desc}</p>
                      </td>
                      {levels.map(l => {
                        const isActive = l.permissions[item.id] || (l.level === 10);
                        return (
                          <td key={l.level} className="px-0.5 py-3 text-center border-r border-slate-50 last:border-r-0">
                            <button
                              disabled={l.level === 10}
                              onClick={() => togglePermission(l.level, item.id)}
                              className={`
                                mx-auto w-7 h-7 rounded-lg flex items-center justify-center transition-all border-2
                                ${isActive
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-inner'
                                  : 'bg-white border-slate-100 text-slate-200 hover:border-slate-300'
                                }
                                ${l.level === 10 ? 'opacity-50 cursor-not-allowed border-yellow-500 bg-yellow-50 text-yellow-600' : 'cursor-pointer active:scale-90'}
                              `}
                            >
                              {l.level === 10 ? <Lock size={12} /> : (isActive ? <Check size={14} strokeWidth={4} /> : <X size={14} strokeWidth={4} />)}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-4">
         <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
            <AlertCircle size={20} />
         </div>
         <div>
            <h4 className="text-[10px] font-black text-rose-800 uppercase tracking-widest mb-1">Architecture Lockdown (Master Tech Mode)</h4>
            <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
              Level 10 is reserved for master technician setup. This level cannot be modified and has bypass clearance for all features. Restricting a lower level will immediately hide the associated interface elements for those users.
            </p>
         </div>
      </div>
    </div>
  );
}
