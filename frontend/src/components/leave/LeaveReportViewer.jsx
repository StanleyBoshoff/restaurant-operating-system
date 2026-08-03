import React from 'react';
import SummaryCard from '../common/SummaryCard';
import { Download, X, FileText, ExternalLink, User, ShieldAlert } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { supabase } from '../../supabaseClient';

export default function LeaveReportViewer({ title, type, data, onClose }) {

  const isLegalReport = ['awol', 'density', 'sick_cycle', 'med_validity', 'holiday_lieu', 'maternity'].includes(type);

  const handleExport = () => {
    // Basic CSV Export logic
    const headers = Object.keys(data[0] || {}).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const openFile = async (path) => {
    try {
      const { data: sign, error } = await supabase.storage.from('employee-files').createSignedUrl(path, 60);
      if (error) throw error;
      window.open(sign.signedUrl, '_blank');
    } catch (err) { alert("Failed to open file: " + err.message); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-8">
      <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-yellow-500 shadow-lg">
                <FileText size={20} />
              </div>
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-widest">{title}</h3>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
              {isLegalReport ? "Official Legal Defense Document - BCEA/CCMA Ready" : "Audit-Ready Statutory Output"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-md active:scale-95"
            >
              <Download size={14} />
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-200 rounded-xl transition-all text-slate-400 hover:text-slate-900 border border-slate-200 bg-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 relative">
          {isLegalReport && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-35deg] select-none">
               <h1 className="text-9xl font-black text-rose-900 uppercase">Statutory Compliance Record</h1>
            </div>
          )}

          {data.length === 0 ? (
            <div className="py-32 text-center">
               <p className="text-slate-400 italic text-sm">No records found for the selected criteria.</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-3xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {Object.keys(data[0]).filter(k => k !== 'id' && k !== 'employee_id' && k !== 'attachment_url').map(key => (
                      <th key={key} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{key.replace(/_/g, ' ')}</th>
                    ))}
                    {data[0].attachment_url !== undefined && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Proof</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-[12px]">
                  {data.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                      {Object.entries(row).filter(([k]) => k !== 'id' && k !== 'employee_id' && k !== 'attachment_url').map(([key, val]) => (
                        <td key={key} className="px-6 py-4 font-bold text-slate-700">
                          {typeof val === 'boolean' ? (val ? 'YES' : 'NO') : val?.toString()}
                        </td>
                      ))}
                      {row.attachment_url !== undefined && (
                        <td className="px-6 py-4 text-right">
                           {row.attachment_url ? (
                             <button
                               onClick={() => openFile(row.attachment_url)}
                               className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5"
                             >
                               <ExternalLink size={12} />
                               <span className="text-[9px] font-black uppercase">View</span>
                             </button>
                           ) : (
                             <span className="text-[9px] font-black text-slate-300 uppercase italic">Missing</span>
                           )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900 px-8 py-4 flex items-center justify-between text-white shrink-0">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Verified Data Stream</span>
           </div>
           <p className="text-[10px] text-slate-400 font-bold">Total Records Analyzed: {data.length}</p>
        </div>

      </div>
    </div>
  );
}
