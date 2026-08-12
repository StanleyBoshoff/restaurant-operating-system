import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, Loader2, AlertCircle, Timer, User, Clock as ClockIcon, Coffee, LogOut, CheckCircle, Search, ChevronRight, Delete, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { clockIn, clockOut, toggleBreak, getActiveTimesheet } from '../utils/timesheetService';

export default function Login() {
  const { login } = useAuth();

  // Use localStorage to persist mode (so a terminal device stays a terminal)
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('rems_auth_mode') || 'login';
  });

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Terminal State
  const [pin, setPin] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeShift, setActiveShift] = useState(null);
  const [terminalLoading, setTerminalLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- 🧪 TEST PHASE REGISTRY (Fetched from DB) ---
  const [testAccounts, setTestAccounts] = useState([]);

  useEffect(() => {
    const fetchTestAccounts = async () => {
        const { data, error } = await supabase.from('test_credentials').select('*').order('level', { ascending: false });
        if (error) {
            console.error("❌ Registry Error:", error.message);
        } else {
            console.log("📊 Loaded test registry rows:", data?.length || 0);
            setTestAccounts(data || []);
        }
    };
    fetchTestAccounts();
  }, []);

  const handleQuickLogin = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };
  // ------------------------------------------

  // Update mode in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('rems_auth_mode', mode);
  }, [mode]);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // PIN-Code Detection
  useEffect(() => {
    if (pin.length === 5) {
      findEmployeeByPin(pin);
    } else {
        setSelectedEmployee(null);
        setActiveShift(null);
    }
  }, [pin]);

  const findEmployeeByPin = async (code) => {
    setTerminalLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, role, branch')
        .eq('clock_code', code)
        .single();

      if (error || !data) {
        setPin(''); // Reset on wrong PIN
        return;
      }

      setSelectedEmployee(data);
      const shift = await getActiveTimesheet(data.id);
      setActiveShift(shift);
    } catch (err) {
      console.error(err);
    } finally {
      setTerminalLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      await login(email, password);
    } catch (err) {
      setLoginError(err.message || 'Authentication failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleTerminalAction = async (action) => {
    if (!selectedEmployee) return;
    setTerminalLoading(true);
    try {
      if (action === 'in') {
        const shift = await clockIn(selectedEmployee.id, selectedEmployee.branch || 'Main Branch');
        setActiveShift(shift);
      } else if (action === 'out') {
        await clockOut(activeShift.id);
        setActiveShift(null);
        setSelectedEmployee(null);
        setPin('');
      } else if (action === 'break') {
        const isStarting = activeShift.status === 'Active';
        const updated = await toggleBreak(activeShift.id, isStarting);
        setActiveShift(updated);
      }
    } catch (err) {
      alert("Terminal error: " + err.message);
    } finally {
      setTerminalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">

      {/* 🚀 SCATTERED BACKGROUND BRANDING */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute flex items-center gap-2 transform"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              rotate: `${(Math.random() - 0.5) * 60}deg`,
              scale: `${0.8 + Math.random() * 1.5}`
            }}
          >
            <Shield className="w-8 h-8 text-slate-900" />
            <span className="text-2xl font-black uppercase tracking-tighter text-slate-900 italic">
              Restaurise
            </span>
          </div>
        ))}
      </div>

      {mode === 'terminal' ? (
        /* TERMINAL MODE */
        <div className="w-full max-w-[400px] bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/60 border border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 relative z-10">

          {/* 1. Spanned Digital Clock */}
          <div className="p-4 pb-2 text-center bg-slate-950/60 border-b border-slate-800/50 relative overflow-hidden">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-500/5 blur-[60px] pointer-events-none" />

             <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-slate-800/50 text-yellow-500/70 rounded-full text-[7px] font-black uppercase tracking-[0.2em] mb-1 border border-slate-700/50">
                <ClockIcon size={7} /> Live Store Time
             </div>

             <div className="w-full flex items-center justify-between px-4">
                <div className="text-6xl font-black text-white tabular-nums leading-none">
                   {currentTime.getHours().toString().padStart(2, '0')}
                </div>
                <div className="text-3xl font-black text-slate-800 leading-none">:</div>
                <div className="text-6xl font-black text-white tabular-nums leading-none">
                   {currentTime.getMinutes().toString().padStart(2, '0')}
                </div>
                <div className="text-3xl font-black text-slate-800 leading-none">:</div>
                <div className="text-6xl font-black text-yellow-600/90 tabular-nums leading-none">
                   {currentTime.getSeconds().toString().padStart(2, '0')}
                </div>
             </div>

             <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.5em] mt-2">
                {currentTime.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' })}
             </p>
          </div>

          {/* 2. Interaction Section */}
          <div className="p-3 flex flex-col items-center">
            {!selectedEmployee ? (
              <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
                <div className="flex gap-4 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full border transition-all duration-300 ${
                        pin.length > i
                        ? 'bg-yellow-500 border-yellow-500 scale-125 shadow-[0_0_12px_rgba(234,179,8,0.6)]'
                        : 'border-slate-700 bg-slate-800/50'
                      }`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPin(pin + num)}
                      className="aspect-square rounded-[1rem] bg-slate-800/50 border border-slate-700/50 text-2xl font-black text-white hover:bg-slate-700/50 active:scale-90 transition-all shadow-lg flex items-center justify-center"
                    >
                      {num}
                    </button>
                  ))}
                  <button onClick={() => setPin('')} className="aspect-square rounded-[1rem] bg-slate-800/30 border border-slate-800 text-[8px] font-black text-rose-500/70 uppercase flex items-center justify-center">CLR</button>
                  <button onClick={() => setPin(pin + '0')} className="aspect-square rounded-[1rem] bg-slate-800/50 border border-slate-700/50 text-2xl font-black text-white flex items-center justify-center">0</button>
                  <button onClick={() => setPin(pin.slice(0, -1))} className="aspect-square rounded-[1rem] bg-slate-800/30 border border-slate-800 flex items-center justify-center text-slate-500"><Delete size={18} /></button>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center pt-2">
                   <div className="w-12 h-12 rounded-[1rem] bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-yellow-500 font-black text-lg mx-auto mb-2 shadow-xl uppercase">
                      {selectedEmployee.first_name[0]}{selectedEmployee.last_name[0]}
                   </div>
                   <h3 className="text-lg font-black text-white leading-none mb-1">{selectedEmployee.first_name}</h3>
                   <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full text-[8px] font-black uppercase tracking-[0.2em]">
                      <span className={`w-1 h-1 rounded-full ${activeShift ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
                      {activeShift?.status || 'Off Duty'}
                   </div>
                </div>

                <div className="space-y-2">
                  {!activeShift ? (
                    <button onClick={() => handleTerminalAction('in')} className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-black text-[10px] uppercase py-4 rounded-xl shadow-xl flex items-center justify-center gap-3">
                      <ClockIcon size={14} /> Start Shift
                    </button>
                  ) : (
                    <>
                      <button onClick={() => handleTerminalAction('break')} className="w-full font-black text-[10px] uppercase py-4 rounded-xl border-2 border-slate-700 text-white hover:bg-slate-800 flex items-center justify-center gap-3">
                         <Coffee size={14} /> {activeShift.status === 'On Break' ? 'End Break' : 'Start Break'}
                      </button>
                      <button onClick={() => handleTerminalAction('out')} className="w-full bg-rose-950/30 text-rose-500 border-2 border-rose-900/50 font-black text-[10px] uppercase py-4 rounded-xl flex items-center justify-center gap-3">
                         <LogOut size={14} /> End Shift
                      </button>
                    </>
                  )}
                  <button onClick={() => { setPin(''); setSelectedEmployee(null); }} className="w-full text-[8px] font-black text-slate-500 uppercase tracking-widest pt-2">Cancel</button>
                </div>
              </div>
            )}

            {!selectedEmployee && (
              <button onClick={() => setMode('login')} className="mt-4 text-[8px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 group">
                <Shield size={8} className="group-hover:text-yellow-500" /> Employee Workspace
              </button>
            )}
          </div>
        </div>
      ) : (
        /* LOGIN MODE */
        <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10">
          <div className="bg-slate-900 px-6 py-4 border-b border-slate-800">
            <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-3 h-3 text-yellow-500" /> Staff Portal
            </h2>
          </div>

          <form onSubmit={handleLoginSubmit} className="p-8 space-y-6">
            {loginError && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-3 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="font-medium">{loginError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Corporate Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Mail className="w-4 h-4" /></div>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-sm focus:border-slate-900 outline-none transition-all placeholder:text-slate-300" placeholder="name@company.com" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Access Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock className="w-4 h-4" /></div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-xl text-sm focus:border-slate-900 outline-none transition-all placeholder:text-slate-300" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loginLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
              {loginLoading ? <Loader2 className="w-4 h-4 animate-spin text-yellow-500" /> : "Sign In"}
            </button>

            <button type="button" onClick={() => setMode('terminal')} className="w-full text-center text-[9px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
              <Timer size={10} /> Clock-In Terminal
            </button>
          </form>

          {/* 🧪 DATABASE TEST REGISTRY */}
          <div className="w-full max-w-[380px] bg-yellow-50/50 backdrop-blur-sm border border-yellow-200/50 rounded-2xl p-4 animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-2 mb-3">
                <Search size={12} className="text-yellow-700" />
                <h3 className="text-[10px] font-black text-yellow-800 uppercase tracking-widest">Database Test Registry</h3>
             </div>
             <div className="grid grid-cols-2 gap-2">
                {testAccounts.map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => handleQuickLogin(acc)}
                    className="text-[9px] font-bold text-left px-3 py-2 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-100 hover:border-yellow-300 transition-all text-yellow-900 shadow-3xs"
                  >
                    {acc.label}
                  </button>
                ))}
             </div>
             <p className="text-[8px] text-yellow-600/70 font-bold uppercase mt-3 text-center tracking-tighter">
                Filling data from public.test_credentials
             </p>
          </div>
        </div>
      )}

      {/* Footer Meta */}
      <div className="mt-8 flex items-center gap-4 opacity-40 grayscale select-none">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">CCMA Compliant</span>
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ISO 27001</span>
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">BCEA Enforcement</span>
      </div>
    </div>
  );
}
