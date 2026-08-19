import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, Loader2, AlertCircle, Timer, User, Clock as ClockIcon, Coffee, LogOut, CheckCircle, Search, ChevronRight, Delete, X, ArrowLeft, AlertTriangle, UserMinus, RotateCcw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { clockIn, clockOut, toggleBreak, getActiveTimesheet, getLatestShiftToday, deleteShiftRecord, convertOutToBreak } from '../utils/timesheetService';

export default function Login() {
  const { login, authMode: mode, setAuthMode: setMode } = useAuth();

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Terminal Authorization Modal (Unlock/Exit)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // ⚠️ Exception Management (Conflict Handling)
  const [exceptionData, setExceptionData] = useState(null); // { employee, existingShift }
  const [exceptionReason, setExceptionReason] = useState(''); // 'break', 'mistake', 'restart'

  // Terminal Interaction State
  const [pin, setPin] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeShift, setActiveShift] = useState(null);
  const [terminalLoading, setTerminalLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Success Feedback Overlay
  const [successFeedback, setSuccessFeedback] = useState(null);

  // 🎹 Physical Keyboard Support
  useEffect(() => {
    if (mode !== 'terminal' || selectedEmployee || successFeedback || showAuthModal || exceptionData) return;

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key >= '0' && e.key <= '9') {
        setPin(prev => prev.length < 5 ? prev + e.key : prev);
      } else if (e.key === 'Backspace') {
        setPin(prev => prev.slice(0, -1));
      } else if (e.key === 'Escape') {
        setPin('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, selectedEmployee, successFeedback, showAuthModal, exceptionData]);

  // --- 🧪 TEST PHASE REGISTRY ---
  const [testAccounts, setTestAccounts] = useState([]);
  const [empRegistry, setEmpRegistry] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: creds } = await supabase.from('test_credentials').select('*').order('level', { ascending: false });
      const { data: emps } = await supabase.from('employees').select('first_name, last_name, clock_code').limit(4);
      setTestAccounts(creds || []);
      setEmpRegistry(emps || []);
    };
    fetchData();
  }, []);

  const handleQuickLogin = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🛡️ Terminal Gatekeeper (Verify Only)
  const handleUnlockTerminal = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const verifyClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { data, error } = await verifyClient.auth.signInWithPassword({
        email: authEmail,
        password: authPass
      });

      if (error) throw error;

      const { data: profile } = await verifyClient
        .from('employees')
        .select('id, roles(authority_level, permissions)')
        .eq('email', authEmail)
        .single();

      const level = profile.roles?.authority_level || 0;
      const perms = profile.roles?.permissions || {};

      if (level < 10 && !perms.can_access_terminal) {
        throw new Error("Access Denied: Manager Authority Required.");
      }

      // Success logic
      if (mode === 'terminal') {
        localStorage.setItem('rems_auth_mode', 'login');
        setMode('login');
      } else {
        localStorage.setItem('rems_auth_mode', 'terminal');
        setMode('terminal');
      }
      setShowAuthModal(false);
      setAuthEmail('');
      setAuthPass('');

    } catch (err) {
      setAuthError(err.message || "Authorization failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  // 🚀 PIN-Code Logic Overhaul (Automated Actions + Conflict Check)
  useEffect(() => {
    if (pin.length === 5) {
      processTerminalPin(pin);
    }
  }, [pin]);

  const processTerminalPin = async (code) => {
    setTerminalLoading(true);
    try {
      const { data: employee, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, role, branch')
        .eq('clock_code', code)
        .single();

      if (error || !employee) {
        setPin('');
        return;
      }

      // Check for EXISTING records today
      const existing = await getLatestShiftToday(employee.id);

      if (existing) {
        if (existing.status === 'Completed') {
          // 🛑 CONFLICT: Already finished for today. Needs Manager Override.
          setExceptionData({ employee, existingShift: existing });
          return;
        } else if (existing.status === 'On Break') {
          // AUTO RESUME
          const result = await toggleBreak(existing.id, false);
          triggerSuccess(employee, 'Active', result.action_meta);
          return;
        } else {
          // ACTIVE: Show Choice
          setSelectedEmployee(employee);
          setActiveShift(existing);
          return;
        }
      }

      // NO SHIFT: Start Fresh
      const result = await clockIn(employee.id, employee.branch || 'Main Branch');
      triggerSuccess(employee, 'Active', result.action_meta);

    } catch (err) {
      alert("System Error: " + err.message);
      setPin('');
    } finally {
      setTerminalLoading(false);
    }
  };

  // ⚠️ MANAGER EXCEPTION HANDLER (Override Conflicts)
  const handleManagerOverride = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      // 1. Verify Manager Credentials
      const { createClient } = await import('@supabase/supabase-js');
      const verifyClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );

      const { error } = await verifyClient.auth.signInWithPassword({
        email: authEmail,
        password: authPass
      });

      if (error) throw new Error("Invalid Manager Credentials.");

      // 2. Perform Action based on reason
      const { employee, existingShift } = exceptionData;

      if (exceptionReason === 'break') {
         // Fix: Convert Accidental 'Out' to 'Break Start'
         const result = await convertOutToBreak(existingShift.id);
         triggerSuccess(employee, 'Active', result.action_meta);
      } else if (exceptionReason === 'mistake') {
         // Fix: Someone else used my code. Wipe old and start fresh.
         await deleteShiftRecord(existingShift.id);
         const result = await clockIn(employee.id, employee.branch || 'Main Branch');
         triggerSuccess(employee, 'Active', "Previous Record Voided - New Shift Started");
      } else if (exceptionReason === 'restart') {
         // Fix: Legit restart (extension). Since unique constraint exists, we extend the old one.
         await supabase.from('employee_timesheets').update({ status: 'Active', clock_out: null, notes: (existingShift.notes || '') + " | Restarted by Manager." }).eq('id', existingShift.id);
         triggerSuccess(employee, 'Active', "Shift Re-Activated by Manager");
      }

      setExceptionData(null);
      setExceptionReason('');
      setAuthEmail('');
      setAuthPass('');

    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const triggerSuccess = (employee, status, message) => {
    setSuccessFeedback({
      name: `${employee.first_name} ${employee.last_name}`,
      status,
      message
    });
    setTimeout(resetTerminal, 3000);
  };

  const resetTerminal = useCallback(() => {
    setPin('');
    setSelectedEmployee(null);
    setActiveShift(null);
    setSuccessFeedback(null);
    setExceptionData(null);
  }, []);

  const handleManualAction = async (action) => {
    if (!activeShift) return;
    setTerminalLoading(true);
    try {
      if (action === 'out') {
        const result = await clockOut(activeShift.id);
        triggerSuccess(selectedEmployee, 'Off Duty', result.action_meta);
      } else if (action === 'break') {
        const result = await toggleBreak(activeShift.id, true);
        triggerSuccess(selectedEmployee, 'On Break', result.action_meta);
      }
    } catch (err) {
      alert("Action failed: " + err.message);
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">

      {/* 🚀 BACKGROUND BRANDING */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute flex items-center gap-2 transform" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, rotate: `${(Math.random() - 0.5) * 60}deg`, scale: `${0.8 + Math.random() * 1.5}` }}>
            <Shield className="w-8 h-8 text-slate-900" /><span className="text-2xl font-black uppercase tracking-tighter text-slate-900 italic">Restaurise</span>
          </div>
        ))}
      </div>

      {/* Global Authorization Overlay (Exit/Unlock) */}
      {showAuthModal && (
        <div className="absolute inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm p-8 flex flex-col justify-center items-center animate-in fade-in duration-300">
           <div className="w-full max-w-[360px] relative">
              <button onClick={() => setShowAuthModal(false)} className="absolute -top-12 -right-2 text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
              <div className="mb-8 text-center">
                 <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 mb-4 border border-yellow-500/20 mx-auto shadow-xl">
                    <Shield size={32} />
                 </div>
                 <h2 className="text-xl font-black text-white uppercase tracking-tight">Manager Required</h2>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                    {mode === 'terminal' ? 'Authorize Terminal Exit' : 'Unlock Terminal Access'}
                 </p>
              </div>

              <form onSubmit={handleUnlockTerminal} className="space-y-4">
                 {authError && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-xl text-[10px] font-bold text-center">{authError}</div>}
                 <div className="space-y-3">
                    <input type="email" required placeholder="Manager Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl text-xs focus:border-yellow-500 outline-none transition-all shadow-inner" />
                    <input type="password" required placeholder="Security Password" value={authPass} onChange={e => setAuthPass(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl text-xs focus:border-yellow-500 outline-none transition-all shadow-inner" />
                 </div>
                 <button type="submit" disabled={authLoading} className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-black text-xs uppercase py-4 rounded-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2">
                    {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Identity"}
                 </button>
              </form>
           </div>
        </div>
      )}

      {mode === 'terminal' ? (
        /* ================= TERMINAL MODE ================= */
        <div className="w-full max-w-[400px] bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-900/60 border border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 relative z-10">

          {/* Conflict / Exception Management Overlay */}
          {exceptionData && (
             <div className="absolute inset-0 z-50 bg-slate-900/98 backdrop-blur-md p-8 flex flex-col items-center justify-center animate-in slide-in-from-bottom-4 duration-300">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mb-6 border border-amber-500/20 shadow-xl shadow-amber-500/5">
                   <AlertTriangle size={32} />
                </div>

                <div className="text-center mb-8">
                   <h2 className="text-xl font-black text-white uppercase tracking-tight">Access Conflict</h2>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                      {exceptionData.employee.first_name} already finished a shift today.
                   </p>
                </div>

                {!exceptionReason ? (
                  <div className="w-full space-y-3">
                     <button onClick={() => setExceptionReason('break')} className="w-full bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl flex items-center gap-4 transition-all border border-slate-700 group">
                        <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><RotateCcw size={20}/></div>
                        <div className="text-left">
                           <p className="text-[10px] font-black uppercase">Back after Break</p>
                           <p className="text-[8px] text-slate-500 font-bold">Mistakenly clocked out earlier</p>
                        </div>
                     </button>
                     <button onClick={() => setExceptionReason('mistake')} className="w-full bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl flex items-center gap-4 transition-all border border-slate-700 group">
                        <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform"><UserMinus size={20}/></div>
                        <div className="text-left">
                           <p className="text-[10px] font-black uppercase">Wrong Code / Mistake</p>
                           <p className="text-[8px] text-slate-500 font-bold">Void previous record and start new</p>
                        </div>
                     </button>
                     <button onClick={() => setExceptionReason('restart')} className="w-full bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl flex items-center gap-4 transition-all border border-slate-700 group">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform"><ClockIcon size={20}/></div>
                        <div className="text-left">
                           <p className="text-[10px] font-black uppercase">Restart / Double Shift</p>
                           <p className="text-[8px] text-slate-500 font-bold">Add second session to current day</p>
                        </div>
                     </button>
                     <button onClick={resetTerminal} className="w-full py-4 text-[8px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Cancel</button>
                  </div>
                ) : (
                  <form onSubmit={handleManagerOverride} className="w-full space-y-4 animate-in fade-in duration-300">
                     <div className="text-center mb-4">
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em]">Manager Authorization Required</p>
                        <p className="text-[8px] text-slate-500 font-bold mt-1">To execute: {exceptionReason.toUpperCase()}</p>
                     </div>
                     {authError && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-xl text-[10px] font-bold text-center">{authError}</div>}
                     <div className="space-y-3">
                        <input type="email" required placeholder="Manager Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl text-xs focus:border-amber-500 outline-none transition-all" />
                        <input type="password" required placeholder="Security Password" value={authPass} onChange={e => setAuthPass(e.target.value)} className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl text-xs focus:border-amber-500 outline-none transition-all" />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setExceptionReason('')} className="bg-slate-800 text-slate-400 font-black text-[9px] uppercase py-4 rounded-xl border border-slate-700">Go Back</button>
                        <button type="submit" disabled={authLoading} className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[9px] uppercase py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
                           {authLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify & Fix"}
                        </button>
                     </div>
                  </form>
                )}
             </div>
          )}

          {/* Success Overlay */}
          {successFeedback && (
            <div className="absolute inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
               <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-bounce">
                  <CheckCircle size={48} strokeWidth={3} />
               </div>
               <h2 className="text-2xl font-black text-white mb-2">{successFeedback.name}</h2>
               <div className="px-4 py-1.5 bg-slate-800 text-yellow-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  {successFeedback.message}
               </div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] animate-pulse">Duty Status: {successFeedback.status}</p>
            </div>
          )}

          {/* 1. Digital Clock */}
          <div className="p-4 pb-2 text-center bg-slate-950/60 border-b border-slate-800/50 relative overflow-hidden">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-500/5 blur-[60px] pointer-events-none" />
             <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-slate-800/50 text-yellow-500/70 rounded-full text-[7px] font-black uppercase tracking-[0.2em] mb-1 border border-slate-700/50">
                <ClockIcon size={7} /> Live Store Time
             </div>
             <div className="w-full flex items-center justify-between px-4">
                <div className="text-6xl font-black text-white tabular-nums leading-none">{currentTime.getHours().toString().padStart(2, '0')}</div>
                <div className="text-3xl font-black text-slate-800 leading-none">:</div>
                <div className="text-6xl font-black text-white tabular-nums leading-none">{currentTime.getMinutes().toString().padStart(2, '0')}</div>
                <div className="text-3xl font-black text-slate-800 leading-none">:</div>
                <div className="text-6xl font-black text-yellow-600/90 tabular-nums leading-none">{currentTime.getSeconds().toString().padStart(2, '0')}</div>
             </div>
             <p className="text-[8px] text-slate-500 font-bold uppercase tracking-[0.5em] mt-2">
                {currentTime.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' })}
             </p>
          </div>

          {/* 2. Interaction Section */}
          <div className="p-3 flex flex-col items-center min-h-[320px] justify-center">
            {!selectedEmployee ? (
              /* PIN PAD */
              <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Enter Terminal PIN</p>
                <div className="flex gap-4 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full border transition-all duration-300 ${pin.length > i ? 'bg-yellow-500 border-yellow-500 scale-125 shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 'border-slate-700 bg-slate-800/50'}`} />
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button key={num} onClick={() => setPin(pin + num)} className="aspect-square rounded-[1rem] bg-slate-800/50 border border-slate-700/50 text-2xl font-black text-white hover:bg-slate-700 hover:border-slate-600 active:scale-90 transition-all shadow-lg flex items-center justify-center">{num}</button>
                  ))}
                  <button onClick={() => setPin('')} className="aspect-square rounded-[1rem] bg-slate-800/30 border border-slate-800 text-[8px] font-black text-rose-500/70 uppercase flex items-center justify-center">CLR</button>
                  <button onClick={() => setPin(pin + '0')} className="aspect-square rounded-[1rem] bg-slate-800/50 border border-slate-700/50 text-2xl font-black text-white flex items-center justify-center">0</button>
                  <button onClick={() => setPin(pin.slice(0, -1))} className="aspect-square rounded-[1rem] bg-slate-800/30 border border-slate-800 flex items-center justify-center text-slate-500"><Delete size={18} /></button>
                </div>
              </div>
            ) : (
              /* ACTIVE CHOICE SCREEN */
              <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center pt-2">
                   <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-yellow-500 font-black text-2xl mx-auto mb-3 shadow-2xl uppercase">
                      {selectedEmployee.first_name[0]}{selectedEmployee.last_name[0]}
                   </div>
                   <h3 className="text-xl font-black text-white leading-none mb-1">{selectedEmployee.first_name}</h3>
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-green-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Currently Active
                   </div>
                </div>

                <div className="space-y-3 px-4">
                  <button onClick={() => handleManualAction('break')} className="w-full font-black text-[10px] uppercase py-5 rounded-2xl border-2 border-slate-700 text-white hover:bg-slate-800 flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                     <Coffee size={16} /> Start Rest Break
                  </button>
                  <button onClick={() => handleManualAction('out')} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase py-5 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-rose-900/20 transition-all active:scale-[0.98]">
                     <LogOut size={16} /> Complete Shift
                  </button>
                  <button onClick={resetTerminal} className="w-full text-[9px] font-black text-slate-500 uppercase tracking-widest pt-2 hover:text-white transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>

          {/* EXIT BUTTON */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full py-4 text-[8px] font-black text-slate-700 hover:text-slate-500 uppercase tracking-[0.5em] border-t border-slate-800/50 bg-slate-950/20 transition-colors"
          >
            Exit Terminal Mode
          </button>
        </div>
      ) : (
        /* ================= LOGIN MODE ================= */
        <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 animate-in fade-in duration-500">

          <div className="bg-slate-900 px-6 py-4 border-b border-slate-800">
            <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-3 h-3 text-yellow-500" /> Staff Portal
            </h2>
          </div>

          <form onSubmit={handleLoginSubmit} className="p-8 space-y-6">
            {loginError && <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-3 text-xs"><AlertCircle className="w-4 h-4 shrink-0" /><p className="font-medium">{loginError}</p></div>}
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
            <button type="button" onClick={() => setShowAuthModal(true)} className="w-full text-center text-[9px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
              <Timer size={10} /> Clock-In Terminal
            </button>
          </form>

          {/* 🧪 DATABASE TEST REGISTRY */}
          <div className="w-full max-w-[380px] bg-yellow-50/50 backdrop-blur-sm border border-yellow-200/50 rounded-2xl p-4">
             <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                   <Search size={12} className="text-yellow-700" />
                   <h3 className="text-[10px] font-black text-yellow-800 uppercase tracking-widest">Test Registry</h3>
                </div>
                <div className="text-[8px] font-bold text-yellow-600 uppercase">Dev Mode</div>
             </div>
             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                   {testAccounts.map(acc => (
                     <button key={acc.email} onClick={() => handleQuickLogin(acc)} className="text-[9px] font-bold text-left px-3 py-2 bg-white border border-yellow-200 rounded-lg hover:bg-yellow-100 hover:border-yellow-300 transition-all text-yellow-900 shadow-3xs">{acc.label}</button>
                   ))}
                </div>
                <div className="pt-3 border-t border-yellow-200/50">
                   <p className="text-[8px] font-black text-yellow-700 uppercase tracking-widest mb-2">Staff Terminal PINs</p>
                   <div className="grid grid-cols-2 gap-2">
                      {empRegistry.map(emp => (
                        <div key={emp.clock_code} className="bg-white/50 border border-yellow-100 rounded-lg px-2 py-1.5 flex justify-between items-center">
                           <span className="text-[9px] font-bold text-yellow-900">{emp.first_name}</span>
                           <code className="text-[10px] font-black text-slate-900 bg-yellow-100 px-1 rounded tracking-tighter">{emp.clock_code}</code>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
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
