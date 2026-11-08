import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient"; 
import { DISCIPLINARY_LEVELS, AUTHORIZED_ISSUERS } from "../../utils/disciplinaryEngine";
import {
  Plus, Trash2, X, Download, FileUp, Info, Gavel, History, ChevronRight, Check, Search, Wand2, AlertTriangle, Filter, ArrowUpDown
} from "lucide-react";
import SummaryCard from "../common/SummaryCard";
import { useAuth } from "../../context/AuthContext";
import { canDo } from "../../utils/permissionService";

export default function TabWarnings({ employee }) { 
  const { user: currentUser } = useAuth();
  const [warningsList, setWarningsList] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sorting
  const [sortConfig, setSortConfig] = useState({ key: 'incident_date', direction: 'desc' });

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    warning_level: "",
    incident_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    description: "",
    issued_by: "",
    file: null
  });

  const fetchEmployeeWarnings = async () => {
    try { 
      setLoading(true); 
      const { data, error } = await supabase
        .from("employee_warnings")
        .select("*")
        .eq("employee_id", employee.id);

      if (error) throw error; 
      setWarningsList(data || []); 
    } catch (error) { 
      console.error("Failed to load warnings history:", error.message); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  useEffect(() => { if (employee?.id) fetchEmployeeWarnings(); }, [employee?.id]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedWarnings = [...warningsList].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleFileChange = (e) => {
    setUploadForm(prev => ({ ...prev, file: e.target.files[0] }));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const { warning_level, incident_date, description, issued_by, file, expiry_date } = uploadForm;

    if (!warning_level || !incident_date || !description || !issued_by || !file) {
      return alert("All fields including the file are required.");
    }

    try {
      setIsSaving(true);

      // 1. Upload File
      const fileExt = file.name.split(".").pop();
      const fileName = `${employee.id}/warnings/${Date.now()}_signed.${fileExt}`;
      const { data: storageData, error: sErr } = await supabase.storage
        .from("employee-files")
        .upload(fileName, file);

      if (sErr) throw sErr;

      // 2. Insert Record
      const { error } = await supabase.from("employee_warnings").insert([{
        employee_id: employee.id,
        warning_level,
        incident_date,
        expiry_date: expiry_date || null,
        description,
        issued_by,
        file_url: storageData.path
      }]);

      if (error) throw error;

      alert("Signed warning uploaded and recorded.");
      setIsUploading(false);
      setUploadForm({
        warning_level: "",
        incident_date: new Date().toISOString().split("T")[0],
        expiry_date: "",
        description: "",
        issued_by: "",
        file: null
      });
      fetchEmployeeWarnings();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const openAttachment = async (path) => {
    try {
      const { data, error } = await supabase.storage.from('employee-files').createSignedUrl(path, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) { alert('Could not open file: ' + err.message); }
  };

  const deleteWarning = async (id) => {
    if (!window.confirm("Are you sure you want to delete this warning record?")) return;
    try {
      const { error } = await supabase.from('employee_warnings').delete().eq('id', id);
      if (error) throw error;
      fetchEmployeeWarnings();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="space-y-6 text-xs">

      {/* 🚀 Header & Upload Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Disciplinary History</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Official warnings and recorded infractions</p>
        </div>
        {canDo(currentUser, 'can_manage_disciplinary') && (
          <button
            onClick={() => setIsUploading(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-slate-800 transition-all active:scale-95"
          >
            <FileUp size={16} /> Upload Signed Warning
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Table View */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th onClick={() => handleSort('incident_date')} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors">
                  <div className="flex items-center gap-2">Date <ArrowUpDown size={12}/></div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry</th>
                <th onClick={() => handleSort('warning_level')} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-600 transition-colors">
                  <div className="flex items-center gap-2">Level <ArrowUpDown size={12}/></div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Charge</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issued By</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center italic text-slate-400">Loading history...</td></tr>
              ) : sortedWarnings.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center italic text-slate-400">No warnings recorded for this employee.</td></tr>
              ) : sortedWarnings.map(w => (
                <tr key={w.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{new Date(w.incident_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-[10px] text-slate-400 font-bold uppercase">{w.expiry_date ? new Date(w.expiry_date).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                      w.warning_level.includes('Final') || w.warning_level.includes('Dismissal')
                        ? 'text-rose-700 bg-rose-50 border-rose-100'
                        : 'text-yellow-700 bg-yellow-50 border-yellow-100'
                    }`}>
                      {w.warning_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-[11px] text-slate-600 font-medium truncate group-hover:whitespace-normal transition-all" title={w.description}>
                      {w.description.split('\n\n')[1] || w.description}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-bold">{w.issued_by}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {w.file_url ? (
                        <button onClick={() => openAttachment(w.file_url)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl border border-emerald-100 transition-all" title="View Signed Copy">
                          <Download size={14} />
                        </button>
                      ) : (
                        <span className="p-2 text-rose-300 italic text-[9px] uppercase font-bold">No Proof</span>
                      )}
                      {canDo(currentUser, 'can_manage_disciplinary') && (
                        <button onClick={() => deleteWarning(w.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-100 transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📩 Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><FileUp size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Record Signed Warning</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Employee: {employee.first_name} {employee.last_name}</p>
                </div>
              </div>
              <button onClick={() => setIsUploading(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20} /></button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warning Level</label>
                  <select
                    value={uploadForm.warning_level}
                    onChange={e => setUploadForm({...uploadForm, warning_level: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:border-yellow-600"
                  >
                    <option value="">Select weight...</option>
                    {Object.values(DISCIPLINARY_LEVELS).map(lvl => <option key={lvl.label} value={lvl.label}>{lvl.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issued By</label>
                  <select
                    value={uploadForm.issued_by}
                    onChange={e => setUploadForm({...uploadForm, issued_by: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:border-yellow-600"
                  >
                    <option value="">Select issuer...</option>
                    {AUTHORIZED_ISSUERS.map(issuer => <option key={issuer} value={issuer}>{issuer}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Incident Date</label>
                  <input
                    type="date"
                    value={uploadForm.incident_date}
                    onChange={e => setUploadForm({...uploadForm, incident_date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:border-yellow-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                  <input
                    type="date"
                    value={uploadForm.expiry_date}
                    onChange={e => setUploadForm({...uploadForm, expiry_date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:border-yellow-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reason / Charge Description</label>
                <textarea
                  rows={4}
                  placeholder="Summarize the specific reason for this warning..."
                  value={uploadForm.description}
                  onChange={e => setUploadForm({...uploadForm, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold outline-none focus:border-yellow-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Signed Proof (File)</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <div className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-2 group-hover:border-yellow-500 transition-all bg-slate-50 group">
                    <FileUp className="text-slate-300 group-hover:text-yellow-600" size={32} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {uploadForm.file ? uploadForm.file.name : "Click to select or drag signed copy"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] py-4 bg-yellow-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? "Uploading..." : <><Check size={18} /> Save & Record</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
