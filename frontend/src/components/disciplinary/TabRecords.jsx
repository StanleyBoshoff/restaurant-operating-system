import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { DISCIPLINARY_LEVELS, AUTHORIZED_ISSUERS } from "../../utils/disciplinaryEngine";
import {
  Search, Download, FileText, AlertCircle, ArrowUpDown, Filter, FileUp, X, Check, Users
} from 'lucide-react';

export default function TabRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'incident_date', direction: 'desc' });

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    employee_id: "",
    warning_level: "",
    incident_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    description: "",
    issued_by: "",
    file: null
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('employee_warnings')
        .select(`*, employees(first_name, last_name, role, department)`)
        .order('incident_date', { ascending: false });
      setRecords(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    async function fetchEmployees() {
      const { data } = await supabase.from('employees').select('id, first_name, last_name').order('first_name');
      setEmployees(data || []);
    }
    fetchEmployees();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const { employee_id, warning_level, incident_date, description, issued_by, file, expiry_date } = uploadForm;

    if (!employee_id || !warning_level || !incident_date || !description || !issued_by || !file) {
      return alert("All fields including the file are required.");
    }

    try {
      setIsSaving(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${employee_id}/warnings/${Date.now()}_signed.${fileExt}`;
      const { data: storageData, error: sErr } = await supabase.storage.from("employee-files").upload(fileName, file);
      if (sErr) throw sErr;

      const { error } = await supabase.from("employee_warnings").insert([{
        employee_id,
        warning_level,
        incident_date,
        expiry_date: expiry_date || null,
        description,
        issued_by,
        file_url: storageData.path
      }]);

      if (error) throw error;
      alert("Signed warning uploaded.");
      setIsUploading(false);
      setUploadForm({
        employee_id: "",
        warning_level: "",
        incident_date: new Date().toISOString().split("T")[0],
        expiry_date: "",
        description: "",
        issued_by: "",
        file: null
      });
      fetchAll();
    } catch (err) { alert(err.message); } finally { setIsSaving(false); }
  };

  const sortedRecords = [...records].sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    if (sortConfig.key === 'employee_name') {
      aVal = `${a.employees?.first_name} ${a.employees?.last_name}`;
      bVal = `${b.employees?.first_name} ${b.employees?.last_name}`;
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filtered = sortedRecords.filter(r =>
    `${r.employees?.first_name} ${r.employees?.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    r.warning_level.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const openAttachment = async (path) => {
    try {
      const { data, error } = await supabase.storage.from('employee-files').createSignedUrl(path, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search all warnings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold shadow-sm outline-none focus:border-yellow-600 transition-all"
          />
        </div>
        <button
          onClick={() => setIsUploading(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-slate-800 transition-all active:scale-95 whitespace-nowrap"
        >
          <FileUp size={16} /> Record New Warning
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm overflow-x-auto text-xs">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th onClick={() => handleSort('employee_name')} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">Employee <ArrowUpDown size={12}/></div>
              </th>
              <th onClick={() => handleSort('incident_date')} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">Date <ArrowUpDown size={12}/></div>
              </th>
              <th onClick={() => handleSort('expiry_date')} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">Expiry <ArrowUpDown size={12}/></div>
              </th>
              <th onClick={() => handleSort('warning_level')} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">Weight <ArrowUpDown size={12}/></div>
              </th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason / Charge</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issuer</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Proof</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center italic text-slate-400">Fetching store-wide records...</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 text-[11px]">{r.employees?.first_name} {r.employees?.last_name}</p>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">{r.employees?.department}</p>
                </td>
                <td className="px-6 py-4 font-bold text-slate-600">{new Date(r.incident_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-[10px] text-slate-400 font-bold uppercase">{r.expiry_date ? new Date(r.expiry_date).toLocaleDateString() : '—'}</td>
                <td className="px-6 py-4">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${
                    r.warning_level.includes('Final') || r.warning_level.includes('Dismissal')
                      ? 'text-rose-700 bg-rose-50 border-rose-100'
                      : 'text-yellow-700 bg-yellow-50 border-yellow-100'
                  }`}>
                    {r.warning_level}
                  </span>
                </td>
                <td className="px-6 py-4 max-w-xs truncate font-medium text-slate-500" title={r.description}>
                  {r.description.includes('EXPIRED:') ? r.description.split('\n\n')[1] : r.description}
                </td>
                <td className="px-6 py-4 text-slate-500 font-bold">{r.issued_by}</td>
                <td className="px-6 py-4 text-right">
                  {r.file_url ? (
                    <button onClick={() => openAttachment(r.file_url)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-100">
                      <FileText size={14} />
                    </button>
                  ) : (
                    <AlertCircle size={14} className="text-amber-400 ml-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🚀 Record Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><FileUp size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">Record Disciplinary Action</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Store-wide compliance entry</p>
                </div>
              </div>
              <button onClick={() => setIsUploading(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20} /></button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-8 overflow-y-auto space-y-6 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Employee</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select
                    value={uploadForm.employee_id}
                    onChange={e => setUploadForm({...uploadForm, employee_id: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 font-bold outline-none focus:border-yellow-600 appearance-none"
                  >
                    <option value="">Select individual...</option>
                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warning Weight</label>
                  <select
                    value={uploadForm.warning_level}
                    onChange={e => setUploadForm({...uploadForm, warning_level: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:border-yellow-600"
                  >
                    <option value="">Select level...</option>
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
                  <input type="date" value={uploadForm.incident_date} onChange={e => setUploadForm({...uploadForm, incident_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:border-yellow-600" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                  <input type="date" value={uploadForm.expiry_date} onChange={e => setUploadForm({...uploadForm, expiry_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold outline-none focus:border-yellow-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Charge / Reason</label>
                <textarea rows={3} value={uploadForm.description} onChange={e => setUploadForm({...uploadForm, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold outline-none focus:border-yellow-600" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Upload Signed Scan</label>
                <div className="relative group">
                  <input type="file" onChange={e => setUploadForm({...uploadForm, file: e.target.files[0]})} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".pdf,.jpg,.jpeg,.png" />
                  <div className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 group-hover:border-yellow-500 transition-all bg-slate-50">
                    <FileUp className="text-slate-300 group-hover:text-yellow-600" size={24} />
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{uploadForm.file ? uploadForm.file.name : "Select signed document"}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setIsUploading(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50">
                  {isSaving ? "Uploading..." : <><Check size={18} /> Record Action</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
