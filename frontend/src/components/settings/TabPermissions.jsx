import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { ShieldCheck, Save, Check, X, AlertCircle, Lock, Users, Wallet, ClipboardList, Gavel, BarChart3, Settings, FileText, MessageSquare, Search } from 'lucide-react';
import { getAllAuthorityLevels, saveAuthorityMatrix } from '../../utils/settingsService';
import { supabase } from '../../supabaseClient';

const ABILITIES = [
  { group: 'General Access', icon: ShieldCheck, items: [
    { id: 'can_view_dashboard', label: 'View Management Dashboard', desc: 'Access to the main store command center.' },
  ]},
  { group: 'Directory Visibility (View Others)', icon: Users, items: [
    { id: 'can_view_lvl_10', label: 'View Level 10', desc: 'Ability to see profiles assigned to Level 10.' },
    { id: 'can_view_lvl_9', label: 'View Level 9', desc: 'Ability to see profiles assigned to Level 9.' },
    { id: 'can_view_lvl_8', label: 'View Level 8', desc: 'Ability to see profiles assigned to Level 8.' },
    { id: 'can_view_lvl_7', label: 'View Level 7', desc: 'Ability to see profiles assigned to Level 7.' },
    { id: 'can_view_lvl_6', label: 'View Level 6', desc: 'Ability to see profiles assigned to Level 6.' },
    { id: 'can_view_lvl_5', label: 'View Level 5', desc: 'Ability to see profiles assigned to Level 5.' },
    { id: 'can_view_lvl_4', label: 'View Level 4', desc: 'Ability to see profiles assigned to Level 4.' },
    { id: 'can_view_lvl_3', label: 'View Level 3', desc: 'Ability to see profiles assigned to Level 3.' },
    { id: 'can_view_lvl_2', label: 'View Level 2', desc: 'Ability to see profiles assigned to Level 2.' },
    { id: 'can_view_lvl_1', label: 'View Level 1', desc: 'Ability to see profiles assigned to Level 1.' },
  ]},
  { group: 'Personnel & HR Control', icon: Users, items: [
    { id: 'can_edit_personnel', label: 'Modify Others Details', desc: 'Edit contact info, address and nationality for staff.' },
    { id: 'can_edit_own_details', label: 'Modify Own Details', desc: 'Allow employee to update their own personal information.' },
    { id: 'can_add_personnel', label: 'Add New Employees', desc: 'Ability to register new staff in the system.' },
    { id: 'can_delete_personnel', label: 'Delete Staff Profile', desc: 'Permanently remove personnel records (High Risk).' },
  ]},
  { group: 'Financial & Sensitive Data', icon: Wallet, items: [
    { id: 'can_view_salary', label: 'View Salary / Wages', desc: 'Visibility of financial compensation data.' },
    { id: 'can_edit_salary', label: 'Modify Salary / Wages', desc: 'Ability to update pay rates and salaries.' },
    { id: 'can_view_bank_details', label: 'View Banking & Tax', desc: 'Access to employee account numbers and tax IDs.' },
    { id: 'can_edit_bank_details', label: 'Modify Banking & Tax', desc: 'Ability to update employee financial records.' },
    { id: 'can_view_medical', label: 'View Medical Info', desc: 'See allergies, conditions and blood groups.' },
    { id: 'can_edit_medical', label: 'Modify Medical Info', desc: 'Update sensitive health and medical aid data.' },
  ]},
  { group: 'Document Vault', icon: FileText, items: [
    { id: 'can_view_documents', label: 'View Documents', desc: 'Access to the digital document filing cabinet.' },
    { id: 'can_upload_docs', label: 'Upload Documents', desc: 'Add new IDs, contracts or medical certificates.' },
    { id: 'can_delete_docs', label: 'Delete Documents', desc: 'Permanently remove uploaded files.' },
    { id: 'can_download_docs', label: 'Download Documents', desc: 'Save files locally from the secure vault.' },
  ]},
  { group: 'Time & Attendance', icon: ClipboardList, items: [
    { id: 'can_view_timesheets', label: 'View Attendance Matrix', desc: 'Access to store-wide attendance logs.' },
    { id: 'can_edit_attendance_register', label: 'Edit Monthly Register', desc: 'Modify hours in the final payroll grid.' },
    { id: 'can_edit_terminal_records', label: 'Edit Terminal Clockings', desc: 'Override raw clock-in/out data.' },
    { id: 'can_export_payroll', label: 'Export Payroll Data', desc: 'Download CSV files for Sage/Pastel/Xero.' },
    { id: 'can_approve_timesheets', label: 'Approve Timesheets', desc: 'Verify and lock attendance for payroll processing.' },
  ]},
  { group: 'Disciplinary & Leave', icon: Gavel, items: [
    { id: 'can_manage_disciplinary', label: 'Manage Disciplinary', desc: 'Access to warning history and disciplinary files.' },
    { id: 'can_launch_wizard', label: 'Launch Legal Wizard', desc: 'Use expert logic to draft formal warnings.' },
    { id: 'can_delete_warnings', label: 'Delete Warnings', desc: 'Remove disciplinary records from history.' },
    { id: 'can_view_leave_tracker', label: 'View Leave Tracker', desc: 'Access to the team availability calendar.' },
    { id: 'can_approve_leave', label: 'Authorize Leave', desc: 'Approve or Deny staff leave applications.' },
    { id: 'can_delete_leave', label: 'Delete Leave Records', desc: 'Remove leave entries from history.' },
  ]},
  { group: 'Analytics & CCMA Proof', icon: BarChart3, items: [
    { id: 'can_view_reports', label: 'Access Reports Dashboard', desc: 'General visibility of reporting modules.' },
    { id: 'can_view_financial_reports', label: 'View Labour Costing', desc: 'Access to financial budgeting and costs.' },
    { id: 'can_view_legal_bundle', label: 'Access CCMA Bundle', desc: 'High-stakes evidence for labor disputes.' },
    { id: 'can_view_tardiness_report', label: 'View Tardiness Analysis', desc: 'Tracking of late-comers and early leavers.' },
    { id: 'can_view_variance_report', label: 'View Shift Variance', desc: 'Scheduled vs Actual hour comparison.' },
  ]},
  { group: 'Ops & Communication', icon: MessageSquare, items: [
    { id: 'can_manage_checklists', label: 'Manage Checklists', desc: 'Define store protocols and manager sign-offs.' },
    { id: 'can_submit_forms', label: 'Submit Store Forms', desc: 'Log cash-ups, incidents and temp logs.' },
    { id: 'can_manage_tasks', label: 'Manage Global Tasks', desc: 'Assign and track tasks across departments.' },
    { id: 'can_access_safety', label: 'Access Health & Safety', desc: 'Visibility of safety logs and audits.' },
    { id: 'can_access_communication', label: 'Access Broadcasts', desc: 'Manage store announcements and comms.' },
  ]},
  { group: 'System Administration', icon: Settings, items: [
    { id: 'can_access_settings', label: 'Access System Settings', desc: 'Modify branches, departments and system config.' },
    { id: 'can_manage_roles', label: 'Manage Authority Matrix', desc: 'Change permissions for levels 1 through 10.' },
    { id: 'can_manage_users', label: 'Account Management', desc: 'Control system access for other managers.' },
    { id: 'can_view_audit_log', label: 'View System Audit Log', desc: 'See trail of all profile changes and system actions.' },
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

      // Filter out Level 11 from the visible grid
      const filteredData = (data || []).filter(d => d.level < 11);

      // Always construct a full 1-10 range
      const fullMatrix = Array.from({ length: 10 }, (_, i) => {
        const level = 10 - i;
        const existing = filteredData.find(d => d.level === level);
        return {
          level,
          permissions: existing?.permissions || {}
        };
      });

      setLevels(fullMatrix);
    } catch (err) {
      console.error("Failed to load security matrix:", err.message);
      setLevels(Array.from({length: 10}, (_, i) => ({ level: 10 - i, permissions: {} })));
    } finally {
      setLoading(false);
    }
  };

  const restoreDefaults = async () => {
    if (!window.confirm("This will overwrite all permissions with the factory defaults. Continue?")) return;

    const defaults = [
      { level: 10, permissions: {
          can_access_settings: true, can_manage_roles: true, can_manage_users: true,
          can_view_all_staff: true, can_edit_personnel: true, can_add_personnel: true,
          can_view_higher_hierarchy: true, can_view_salary: true, can_edit_salary: true,
          can_view_bank_details: true, can_edit_bank_details: true, can_view_medical: true,
          can_edit_medical: true, can_view_documents: true, can_upload_docs: true,
          can_delete_docs: true, can_download_docs: true, can_view_timesheets: true,
          can_edit_attendance_register: true, can_edit_terminal_records: true,
          can_export_payroll: true, can_approve_timesheets: true, can_manage_disciplinary: true,
          can_launch_wizard: true, can_delete_warnings: true, can_view_leave_tracker: true,
          can_approve_leave: true, can_delete_leave: true, can_view_reports: true,
          can_view_financial_reports: true, can_view_legal_bundle: true,
          can_view_tardiness_report: true, can_view_variance_report: true,
          can_manage_checklists: true, can_submit_forms: true, can_manage_tasks: true,
          can_access_safety: true, can_access_communication: true, can_view_audit_log: true
      } },
      { level: 9, permissions: {
          can_view_all_staff: true, can_edit_personnel: true, can_view_salary: true,
          can_view_bank_details: true, can_view_documents: true, can_upload_docs: true,
          can_view_timesheets: true, can_export_payroll: true, can_manage_disciplinary: true,
          can_view_leave_tracker: true, can_approve_leave: true, can_view_reports: true,
          can_view_financial_reports: true, can_access_safety: true, can_access_communication: true
      } },
      { level: 8, permissions: {
          can_view_all_staff: true, can_edit_personnel: true, can_view_salary: true,
          can_view_documents: true, can_upload_docs: true, can_view_timesheets: true,
          can_manage_disciplinary: true, can_view_leave_tracker: true, can_approve_leave: true
      } },
      { level: 1, permissions: {} }
    ];

    setIsSaving(true);
    try {
      await saveAuthorityMatrix(defaults);
      await fetchMatrix();
      alert("✅ Factory defaults restored. Database is now in sync.");
    } catch (err) {
      alert("❌ Failed to restore: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (lvlNum, key) => {
    // Level 11 is Admin-Locked, everything else is editable
    if (lvlNum >= 11) return;

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
      // 1. Save the matrix to authority_levels
      // The Database Trigger (trg_sync_role_permissions) will automatically
      // update all roles (Waiter, GM, etc) in the background.
      await saveAuthorityMatrix(levels);

      alert("✅ Master Security Matrix committed successfully. All roles have been updated.");
      await fetchMatrix(); // Refresh to confirm
    } catch (err) {
      alert("❌ Sync failed: " + err.message);
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
        <div className="flex gap-2">
            <button
              onClick={restoreDefaults}
              className="px-4 py-2.5 border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
            >
              Restore Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving ? 'Syncing...' : 'Commit Matrix'}
            </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[70vh]">
        <div className="overflow-auto no-scrollbar">
          <table className="w-full border-collapse table-fixed min-w-[1200px]">
            <thead className="sticky top-0 z-40 bg-slate-900 shadow-md">
              <tr className="text-white">
                <th className="sticky left-0 z-50 bg-slate-900 w-64 px-6 py-4 text-[10px] font-black uppercase tracking-widest text-left border-r border-slate-800">
                  Ability / Section
                </th>
                {levels.map(l => (
                  <th key={l.level} className="px-1 py-4 text-center border-r border-slate-800 last:border-r-0">
                    <div className="flex flex-col items-center gap-1">
                       <span className={`text-[14px] font-black leading-none ${l.level === 11 ? 'text-yellow-500' : ''}`}>{l.level}</span>
                       <span className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter">LVL</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ABILITIES.map(group => (
                <React.Fragment key={group.group}>
                  <tr className="bg-slate-50/80 sticky top-[48px] z-30 shadow-sm">
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
                        const isActive = l.permissions[item.id] || (l.level === 11);
                        return (
                          <td key={l.level} className="px-0.5 py-3 text-center border-r border-slate-50 last:border-r-0">
                            <button
                              disabled={l.level === 11}
                              onClick={() => togglePermission(l.level, item.id)}
                              className={`
                                mx-auto w-7 h-7 rounded-lg flex items-center justify-center transition-all border-2
                                ${isActive
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-inner'
                                  : 'bg-white border-slate-100 text-slate-200 hover:border-slate-300'
                                }
                                ${l.level === 11 ? 'opacity-50 cursor-not-allowed border-yellow-500 bg-yellow-50 text-yellow-600' : 'cursor-pointer active:scale-90'}
                              `}
                            >
                              {l.level === 11 ? <Lock size={12} /> : (isActive ? <Check size={14} strokeWidth={4} /> : <X size={14} strokeWidth={4} />)}
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
    </div>
  );
}
