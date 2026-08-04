import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { FileOutput, Download, FileText, Share2, Table, Calendar } from 'lucide-react';
import { getPayrollExportData } from '../../utils/reportingService';

export default function TabPayrollExport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  async function fetchData() {
    setLoading(true);
    try {
      const result = await getPayrollExportData(dateRange.start, dateRange.end);
      setData(result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const exportCSV = (software) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payroll_export_${software.toLowerCase()}_${dateRange.start}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Selection & Export Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-slate-900 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
           <div className="flex flex-col">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Start Period</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange({...dateRange, start: e.target.value})}
                className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-500"
              />
           </div>
           <div className="flex flex-col">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">End Period</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange({...dateRange, end: e.target.value})}
                className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-500"
              />
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
           <button
            onClick={() => exportCSV('Pastel')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-lg active:scale-95"
           >
              <Download size={14} className="text-yellow-600" />
              Export to Pastel
           </button>
           <button
            onClick={() => exportCSV('Sage')}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg active:scale-95"
           >
              <FileText size={14} />
              Export to Sage
           </button>
           <button
            onClick={() => exportCSV('Xero')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-400 transition-all shadow-lg active:scale-95"
           >
              <Share2 size={14} />
              Export to Xero
           </button>
        </div>
      </div>

      <SummaryCard title="Payroll Data Preview" icon={Table}>
        <div className="overflow-x-auto -mx-4 -mb-4">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Emp #</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Regular</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">OT 1.5x</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">OT 2.0x</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Night</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Paid Lv</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Unpaid Lv</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Tips (CC)</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Allowances</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">New/Term</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {loading ? (
                <tr><td colSpan="11" className="py-20 text-center italic text-slate-400 animate-pulse">Consolidating payroll records...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="11" className="py-20 text-center italic text-slate-400">No payroll data found for this period.</td></tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">{row.employee_number}</td>
                    <td className="px-6 py-4 font-black text-slate-900">{row.name}</td>
                    <td className="px-6 py-4 text-center font-bold">{row.regular_hours}h</td>
                    <td className="px-6 py-4 text-center font-bold text-amber-600">{row.overtime_15}h</td>
                    <td className="px-6 py-4 text-center font-bold text-rose-600">{row.overtime_20}h</td>
                    <td className="px-6 py-4 text-center font-bold text-indigo-500">{row.night_differential}h</td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-600">{row.paid_leave_hrs}h</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-300">{row.unpaid_leave_hrs}h</td>
                    <td className="px-6 py-4 text-right font-black">R {row.tips_cc.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-black">R {row.allowances.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                       {row.new_hire === 'YES' && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-black uppercase">NEW</span>}
                       {row.terminated !== 'NO' && <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded text-[8px] font-black uppercase ml-1">TERM</span>}
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
