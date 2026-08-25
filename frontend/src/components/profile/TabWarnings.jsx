import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient"; 
import { OFFENCE_REGISTRY, DISCIPLINARY_LEVELS, AUTHORIZED_ISSUERS } from "../../utils/disciplinaryEngine";
import { UniversalEngine } from "../../utils/disciplinary/UniversalEngine";
import { Judge } from "../../utils/disciplinary/Judge";
import { fetchActiveHistory } from "../../utils/disciplinary/HistoryService";
import {
  Plus, Trash2, X, Download, FileUp, Info, Gavel, History, BrainCircuit, ChevronRight, Check, Search, Wand2, ShieldCheck, ShieldAlert, AlertTriangle
} from "lucide-react";
import SummaryCard from "../common/SummaryCard";
import { notifyStaffOfDisciplinaryConsultation } from "../../utils/notificationService";

export default function TabWarnings({ employee }) { 
  const [warningsList, setWarningsList] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [isAdding, setIsAdding] = useState(false); 
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [warningLevel, setWarningLevel] = useState(""); 
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState(""); 
  const [issuedBy, setIssuedBy] = useState(""); 
  const [selectedFile, setSelectedFile] = useState(null); 

  // Wizard States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardPhase, setWizardPhase] = useState('ALLEGATION'); // 'ALLEGATION', 'INVESTIGATION', 'JUDGMENT'
  const [allegation, setAllegation] = useState("");
  const [engine, setEngine] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [judgment, setJudgment] = useState(null);

  const fetchEmployeeWarnings = async () => {
    try { 
      setLoading(true); 
      const { data, error } = await supabase.from("employee_warnings").select("*").eq("employee_id", employee.id).order("incident_date", { ascending: false });
      if (error) throw error; 
      setWarningsList(data || []); 
    } catch (error) { 
      console.error("Failed to load warnings history:", error.message); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  useEffect(() => { if (employee?.id) fetchEmployeeWarnings(); }, [employee?.id]);

  const handleStartWizard = () => {
    setIsWizardOpen(true);
    setWizardPhase('ALLEGATION');
    setAllegation("");
    setEngine(null);
    setJudgment(null);
  };

  const handleAllegationSubmit = () => {
    if (allegation.length < 5) return alert("Please provide a brief summary of the allegation.");
    const newEngine = new UniversalEngine(allegation);
    setEngine(newEngine);

    if (newEngine.blueprint) {
      setCurrentQuestion(newEngine.getCurrentQuestion());
      setWizardPhase('INVESTIGATION');
    } else {
      finalizeInvestigation(newEngine);
    }
  };

  const handleAnswer = (val) => {
    engine.submitAnswer(currentQuestion.id, val);
    const nextQ = engine.getCurrentQuestion();
    if (nextQ) {
      setCurrentQuestion(nextQ);
    } else {
      finalizeInvestigation(engine);
    }
  };

  const finalizeInvestigation = async (activeEngine) => {
    const incident = activeEngine.getStructuredIncident();
    const history = await fetchActiveHistory(employee.id);
    const result = Judge.assess(incident, history);
    setJudgment(result);
    setWizardPhase('JUDGMENT');
  };

  const handleCommitJudgment = () => {
    setDescription(judgment.narrative + "\n\n" +
      "CHARGE(S):\n" +
      judgment.offence.desc + "\n\n" +
      "SUPPORTING REASONS:\n" +
      judgment.supportingReasons.map((r, i) => `${i+1}. ${r}`).join('\n')
    );
    setWarningLevel(DISCIPLINARY_LEVELS[judgment.recommendation]?.label || judgment.recommendation);
    setIsWizardOpen(false);
    setIsAdding(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!warningLevel || !incidentDate || !description || !issuedBy) return alert("All fields required.");
    try {
      setIsSaving(true);
      let uploadedPath = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${employee.id}/warnings/${Date.now()}.${fileExt}`;
        const { data: storageData, error: sErr } = await supabase.storage.from("employee-files").upload(fileName, selectedFile);
        if (sErr) throw sErr;
        uploadedPath = storageData.path;
      }
      const { error } = await supabase.from("employee_warnings").insert([{
        employee_id: employee.id,
        warning_level: warningLevel,
        incident_date: incidentDate,
        description: description,
        issued_by: issuedBy,
        file_url: uploadedPath
      }]);
      if (error) throw error;

      await notifyStaffOfDisciplinaryConsultation(employee, warningLevel);

      alert("Warning recorded. Staff member notified.");
      setIsAdding(false);
      setDescription("");
      fetchEmployeeWarnings();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLateUpload = async (warningId, file) => {
    try {
      setLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${employee.id}/warnings/${Date.now()}_signed.${fileExt}`;
      const { data: storageData, error: sErr } = await supabase.storage.from("employee-files").upload(fileName, file);
      if (sErr) throw sErr;
      const { error } = await supabase.from("employee_warnings").update({ file_url: storageData.path }).eq("id", warningId);
      if (error) throw error;
      alert("Signed proof uploaded.");
      fetchEmployeeWarnings();
    } catch (err) { alert(`Upload failed: ${err.message}`); } finally { setLoading(false); }
  };

  const openAttachment = async (path) => {
    try {
      const { data, error } = await supabase.storage.from('employee-files').createSignedUrl(path, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (err) { alert('Could not open file: ' + err.message); }
  };

  return (
    <div className="space-y-6 text-xs">

      {/* 🚀 Universal Disciplinary Wizard */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-600 rounded-2xl flex items-center justify-center text-white"><Gavel size={20} /></div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Professional Disciplinary Engine</h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Generic Framework v1.0</p>
                </div>
              </div>
              <button onClick={() => setIsWizardOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20} /></button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
              {wizardPhase === 'ALLEGATION' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center space-y-2">
                    <h4 className="text-lg font-black text-slate-900 uppercase">State the Allegation</h4>
                    <p className="text-slate-500 font-medium italic text-[11px]">Describe the incident in plain language. The engine will guide the investigation.</p>
                  </div>
                  <textarea rows={6} value={allegation} onChange={e => setAllegation(e.target.value)} placeholder="e.g., Sarah was late for her shift..." className="w-full bg-white border-2 border-slate-200 rounded-3xl px-6 py-4 text-sm focus:border-yellow-600 outline-none transition-all shadow-sm" />
                  <button onClick={handleAllegationSubmit} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95">Initiate Investigation <ChevronRight size={18}/></button>
                </div>
              )}

              {wizardPhase === 'INVESTIGATION' && currentQuestion && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] flex flex-col items-center text-center gap-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Search size={80} /></div>
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 border border-yellow-500/20 shadow-xl"><BrainCircuit size={32} /></div>
                    <div className="space-y-2">
                        <h4 className="text-white font-black text-xl uppercase tracking-tight">{currentQuestion.label}</h4>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">{currentQuestion.phase}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                    {currentQuestion.type === 'boolean_tristate' ? (
                      <div className="space-y-3">
                        <button onClick={() => handleAnswer(true)} className="w-full p-6 bg-white border-2 border-slate-100 rounded-3xl text-sm font-black text-slate-900 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-between group shadow-sm hover:shadow-xl">
                            YES / TRUE
                            <Check className="text-emerald-500 opacity-0 group-hover:opacity-100" />
                        </button>
                        <button onClick={() => handleAnswer(false)} className="w-full p-6 bg-white border-2 border-slate-100 rounded-3xl text-sm font-black text-slate-900 hover:border-rose-500 hover:bg-rose-50 transition-all flex items-center justify-between group shadow-sm hover:shadow-xl">
                            NO / FALSE
                            <X className="text-rose-500 opacity-0 group-hover:opacity-100" />
                        </button>
                        <button onClick={() => handleAnswer('UNKNOWN')} className="w-full p-6 bg-slate-100 border-2 border-slate-200 rounded-3xl text-sm font-black text-slate-400 hover:bg-slate-200 transition-all flex items-center justify-between shadow-inner">
                            UNKNOWN
                            <Info size={18} />
                        </button>
                      </div>
                    ) : (
                        <div className="bg-white border-2 border-slate-100 p-8 rounded-[2rem] shadow-xl">
                            <input
                                type={currentQuestion.type === 'time' ? 'time' : currentQuestion.type === 'number' ? 'number' : 'text'}
                                autoFocus
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-2xl font-black text-center outline-none focus:border-yellow-600 transition-all"
                                onKeyDown={e => e.key === 'Enter' && handleAnswer(e.target.value)}
                            />
                            <p className="text-center text-[10px] text-slate-400 font-bold uppercase mt-4 tracking-widest">Press Enter to Confirm</p>
                        </div>
                    )}
                  </div>
                </div>
              )}

              {wizardPhase === 'JUDGMENT' && judgment && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                  <div className={`p-8 rounded-[2.5rem] border-4 flex flex-col items-center text-center gap-6 shadow-2xl ${
                      judgment.recommendation === 'DISMISSAL' ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    {judgment.recommendation === 'DISMISSAL' ? <ShieldAlert size={64} className="text-rose-600" /> : <ShieldCheck size={64} className="text-emerald-600" />}
                    <div>
                        <h4 className="font-black text-2xl uppercase tracking-tight text-slate-900">
                            {judgment.recommendation.replace(/_/g, ' ')} RECOMMENDED
                        </h4>
                        <p className="text-slate-600 font-medium text-sm max-w-md mt-2 leading-relaxed">{judgment.explanation}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <SummaryCard title="Disciplinary Pillar" icon={History}>
                          <div className="py-2">
                              <span className="text-3xl font-black text-slate-900">Instance #{judgment.pillars.occurrence}</span>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Specific Offence Ladder</p>
                          </div>
                      </SummaryCard>
                      <SummaryCard title="Behavioural Pattern" icon={BrainCircuit}>
                          <div className="py-2">
                              <span className={`text-xs font-black uppercase tracking-widest ${judgment.pillars.patternCount > 1 ? 'text-amber-600' : 'text-slate-400'}`}>
                                  {judgment.pillars.patternCount > 1 ? 'Pattern Detected' : 'No Pattern'}
                              </span>
                              <p className="text-[9px] text-slate-400 font-medium mt-1">{judgment.pillars.patternCount} related entries in category</p>
                          </div>
                      </SummaryCard>
                  </div>

                  <div className="pt-4 flex gap-3 border-t border-slate-100">
                    <button onClick={() => setWizardPhase('ALLEGATION')} className="px-8 py-4 border-2 border-slate-200 rounded-2xl font-black text-[10px] uppercase text-slate-400 tracking-widest hover:bg-slate-100 transition-all">Restart</button>
                    <button onClick={handleCommitJudgment} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95">
                        <Wand2 size={20} className="text-yellow-500" /> Generate Formal Warning
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registry View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ModuleWorkspaceHeader title="Disciplinary Registry" description="Generic Professional Engine Framework." icon={Gavel} actions={
            <button onClick={handleStartWizard} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-slate-800 transition-all active:scale-95"><BrainCircuit size={16} /> Disciplinary Wizard</button>
          }/>
          <div className="space-y-4">
            {warningsList.map(warning => (
              <div key={warning.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm border-l-8 border-l-yellow-600 space-y-4 hover:border-slate-300 transition-all relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{warning.warning_level}</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Incident: {new Date(warning.incident_date).toLocaleDateString()} • Issued By: {warning.issued_by}</p>
                  </div>
                  <div className="flex gap-2">
                    {warning.file_url ? (
                      <button onClick={() => openAttachment(warning.file_url)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-100" title="View Signed Copy"><Download size={16} /></button>
                    ) : (
                      <div className="relative group">
                        <input type="file" onChange={(e) => handleLateUpload(warning.id, e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <button className="p-2 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-xl transition-colors border border-yellow-100 flex items-center gap-2 px-3"><FileUp size={16} /><span className="text-[9px] font-black uppercase">Upload Signed</span></button>
                      </div>
                    )}
                    <button className="p-2 bg-rose-50 text-rose-400 hover:text-rose-600 rounded-xl transition-colors border border-rose-100"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-700">{warning.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Logging Section */}
        <div className="space-y-6">
          <SummaryCard title="Logging Workspace" icon={Plus}>
            {isAdding ? (
              <form onSubmit={handleFormSubmit} className="space-y-4 animate-in fade-in zoom-in-95">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Warning Designation</label>
                  <select value={warningLevel} onChange={e => setWarningLevel(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2 text-sm focus:border-yellow-600 outline-none">
                    <option value="">Select Level...</option>
                    {Object.values(DISCIPLINARY_LEVELS).map(lvl => <option key={lvl.label} value={lvl.label}>{lvl.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={incidentDate} onChange={e => setIncidentDate(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-xs" />
                  <select value={issuedBy} onChange={e => setIssuedBy(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-2 text-xs outline-none">
                    <option value="">Select Authorized Issuer...</option>
                    {AUTHORIZED_ISSUERS.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <textarea rows={12} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-[11px] font-mono leading-relaxed outline-none focus:border-yellow-600" />
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex gap-2"><button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase">Cancel</button><button type="submit" disabled={isSaving} className="flex-[2] py-2.5 bg-yellow-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg disabled:opacity-50 transition-all active:scale-95">{isSaving ? "Saving..." : "Save Formal Record"}</button></div>
                </div>
              </form>
            ) : (
              <div className="py-12 text-center space-y-4 px-8 italic text-slate-400 leading-relaxed">
                <button onClick={() => setIsAdding(true)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all">Manual Entry</button>
                <div className="mt-4 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Select Wizard to initiate a guided investigation.
                </div>
              </div>
            )}
          </SummaryCard>
        </div>
      </div>
    </div>
  );
}


function ModuleWorkspaceHeader({ title, description, icon: Icon, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-900 shadow-sm"><Icon size={24} /></div>
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none mb-1">{title}</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none">{description}</p>
        </div>
      </div>
      {actions}
    </div>
  );
}
