import React, { useState } from 'react';
import SummaryCard from '../common/SummaryCard';
import { FileText, Calculator, DollarSign, CreditCard, ShoppingBag, Plus, Save, History, AlertCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { submitForm } from '../../utils/formService';

export default function TabCashUp() {
  const [sales, setSales] = useState({ cash: 0, card: 0, delivery: 0 });
  const [cashCount, setCashCount] = useState({ float: 1500, counted: 0 });
  const [payouts, setPayouts] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const totalSales = parseFloat(sales.cash || 0) + parseFloat(sales.card || 0) + parseFloat(sales.delivery || 0);
  const totalPayouts = payouts.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0);
  const expectedCash = parseFloat(sales.cash || 0) - totalPayouts + parseFloat(cashCount.float || 0);
  const discrepancy = parseFloat(cashCount.counted || 0) - expectedCash;

  const addPayout = () => {
    setPayouts([...payouts, { id: Date.now(), reason: '', amount: 0 }]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const submissionData = {
        sales,
        cashCount,
        payouts,
        totals: {
          totalSales,
          totalPayouts,
          expectedCash,
          discrepancy
        }
      };

      await submitForm('CashUp', submissionData);

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);

      // Optionally reset form
      setSales({ cash: 0, card: 0, delivery: 0 });
      setCashCount({ float: 1500, counted: 0 });
      setPayouts([]);
    } catch (err) {
      alert("Failed to commit cash-up: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* 1. Sales Declaration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title="POS Sales Summary" icon={Calculator}>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">POS Cash Sales</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R</span>
                <input
                  type="number"
                  value={sales.cash}
                  onChange={e => setSales({...sales, cash: e.target.value})}
                  className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-yellow-500/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Card / EFT Sales</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R</span>
                <input
                  type="number"
                  value={sales.card}
                  onChange={e => setSales({...sales, card: e.target.value})}
                  className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-yellow-500/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Delivery (Uber/MrD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R</span>
                <input
                  type="number"
                  value={sales.delivery}
                  onChange={e => setSales({...sales, delivery: e.target.value})}
                  className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-yellow-500/20 outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
               <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Gross Sales</span>
               <span className="text-lg font-black text-slate-900 tracking-tighter">R{totalSales.toFixed(2)}</span>
            </div>
          </div>
        </SummaryCard>

        {/* 2. Physical Cash Count */}
        <SummaryCard title="Physical Cash Audit" icon={DollarSign}>
           <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Opening Float</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R</span>
                <input
                  type="number"
                  value={cashCount.float}
                  onChange={e => setCashCount({...cashCount, float: e.target.value})}
                  className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-yellow-500/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-2">Actual Count (Cash In Till)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R</span>
                <input
                  type="number"
                  value={cashCount.counted}
                  onChange={e => setCashCount({...cashCount, counted: e.target.value})}
                  className="w-full pl-8 pr-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm font-black text-yellow-900 focus:ring-2 focus:ring-yellow-500/20 outline-none"
                />
              </div>
            </div>

            <div className={`p-4 rounded-xl flex items-center justify-between ${discrepancy < 0 ? 'bg-rose-50 text-rose-700' : discrepancy > 0 ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-700'}`}>
               <div>
                 <p className="text-[9px] font-black uppercase tracking-widest">Discrepancy</p>
                 <h4 className="text-xl font-black tracking-tighter">R{discrepancy.toFixed(2)}</h4>
               </div>
               {discrepancy !== 0 && <AlertCircle size={20} className={discrepancy < 0 ? 'text-rose-500' : 'text-green-500'} />}
            </div>
          </div>
        </SummaryCard>

        {/* 3. Payouts & Expenses */}
        <SummaryCard
          title="Payouts & Petty Cash"
          icon={ShoppingBag}
          badge={<button onClick={addPayout} className="p-1 hover:bg-slate-200 rounded-md transition-all"><Plus size={12} /></button>}
        >
          <div className="space-y-2 max-h-[220px] overflow-y-auto">
            {payouts.length === 0 ? (
              <p className="py-8 text-center text-[10px] text-slate-400 italic">No payouts recorded for this shift.</p>
            ) : (
              payouts.map((p, idx) => (
                <div key={p.id} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Reason..."
                    className="flex-1 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded text-[10px] outline-none"
                    value={p.reason}
                    onChange={e => {
                      const newP = [...payouts];
                      newP[idx].reason = e.target.value;
                      setPayouts(newP);
                    }}
                  />
                  <input
                    type="number"
                    placeholder="R0.00"
                    className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold outline-none"
                    value={p.amount}
                    onChange={e => {
                      const newP = [...payouts];
                      newP[idx].amount = e.target.value;
                      setPayouts(newP);
                    }}
                  />
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
             <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Payouts</span>
             <span className="text-sm font-black text-rose-600">R{totalPayouts.toFixed(2)}</span>
          </div>
        </SummaryCard>
      </div>

      {/* 4. Submission Bar */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <FileText size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.2em]">Final Reconciliation</h4>
              <p className="text-[10px] text-slate-400 font-medium">Verified by CCMA-compliant digital signature protocol.</p>
            </div>
         </div>

         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="hidden lg:block text-right">
               <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Card Submission</p>
               <h3 className="text-xl font-black text-white tracking-tighter">R{parseFloat(sales.card || 0).toFixed(2)}</h3>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center gap-2 ${
                isSaved ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white hover:bg-yellow-500'
              } disabled:opacity-50`}
            >
              <Save size={16} />
              {isSaving ? 'Processing...' : isSaved ? 'Reconciliation Saved' : 'Commit Cash-Up'}
            </button>

            <button className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white transition-all">
              <History size={20} />
            </button>
         </div>
      </div>
    </div>
  );
}
