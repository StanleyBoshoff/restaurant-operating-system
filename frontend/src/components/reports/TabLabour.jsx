import React, { useState, useEffect } from 'react';
import SummaryCard from '../common/SummaryCard';
import { Clock, TrendingUp, TrendingDown, Filter, Download, Calendar } from 'lucide-react';
import { getLabourMetrics } from '../../utils/reportingService';

export default function TabLabour() {
  const [metrics, setMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchMetrics();
  }, [range]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const data = await getLabourMetrics(range.start, range.end);
      setMetrics(data);
    } catch (err) {
      console.error("Failed to load labour metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Report Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-3xs">
            <Calendar size={14} className="text-yellow-600" />
            <input
              type="date"
              value={range.start}
              onChange={e => setRange({...range, start: e.target.value})}
              className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-transparent outline-none"
            />
            <span className="text-slate-300 font-bold">to</span>
            <input
              type="date"
              value={range.end}
              onChange={e => setRange({...range, end: e.target.value})}
              className="text-[10px] font-black text-slate-900 uppercase tracking-widest bg-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-3xs active:scale-95">
             <Filter size={14} />
             Filter Dept
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm active:scale-95">
             <Download size={14} />
             Export PDF
          </button>
        </div>
      </div>

      {/* Main Labour Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center italic text-slate-400 animate-pulse text-xs">
            Crunching department labour logs...
          </div>
        ) : Object.keys(metrics).length === 0 ? (
          <div className="col-span-full py-20 text-center italic text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-xs">
            No labour data captured for this date range.
          </div>
        ) : (
          Object.entries(metrics).map(([dept, data]) => (
            <SummaryCard key={dept} title={dept} icon={Clock}>
               <div className="space-y-6 py-2">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Dept Hours</p>
                        <h4 className="text-3xl font-black text-slate-900">{data.hours.toFixed(1)}h</h4>
                     </div>
                     <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Overtime</p>
                        <h4 className="text-xl font-black text-rose-600">{data.overtime.toFixed(1)}h</h4>
                     </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold">
                     <span className="text-slate-400 uppercase">Total Shifts</span>
                     <span className="text-slate-900">{data.shifts}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold">
                     <span className="text-slate-400 uppercase">Avg Shift Length</span>
                     <span className="text-slate-900">{(data.hours / data.shifts).toFixed(1)}h</span>
                  </div>
               </div>
            </SummaryCard>
          ))
        )}
      </div>

      {/* Labour Trend Highlights */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white grid grid-cols-1 md:grid-cols-2 gap-8 items-center border border-slate-800 shadow-xl">
         <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-2 text-yellow-500">Labour Efficiency Insight</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Overall labour units have <span className="text-green-500 font-bold italic">decreased by 4.2%</span> compared to the previous week. Overtime exposure is currently concentrated in the <span className="text-rose-500 font-bold italic">Back of House</span> department.
            </p>
         </div>
         <div className="flex items-center justify-end gap-6">
            <div className="text-right">
               <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Weekly Forecast</p>
               <h3 className="text-2xl font-black text-white">412h</h3>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
               <TrendingDown size={24} />
            </div>
         </div>
      </div>
    </div>
  );
}
