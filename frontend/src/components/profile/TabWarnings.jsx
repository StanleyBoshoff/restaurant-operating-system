import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient"; 
import {
  OFFENCE_REGISTRY,
  suggestCharges,
  getProbingQuestions,
  generateLocalDraft,
  DISCIPLINARY_LEVELS,
  AUTHORIZED_ISSUERS
} from "../../utils/disciplinaryEngine";
import { submitEngineFeedback, notifyStaffOfDisciplinaryConsultation } from "../../utils/notificationService";
import {
  BrainCircuit, Check, Gavel, Plus, Search, Trash2, Wand2, X, AlertTriangle, MessageSquare, Send, ChevronRight, FileUp, Download
} from "lucide-react";
import SummaryCard from "../common/SummaryCard";
import StatusBadge from "../common/StatusBadge";

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
  const [wizardPhase, setWizardPhase] = useState('DESC'); // 'DESC', 'PROBE', 'CHARGES'
  const [wizardAnswers, setWizardAnswers] = useState({});
  const [probingQuestions, setProbingQuestions] = useState([]);
  const [selectedOffences, setSelectedOffences] = useState([]);
  const [chargeSearch, setChargeSearch] = useState("");

  // Feedback states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

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
    setWizardPhase('DESC');
    setWizardAnswers({});
    setSelectedOffences([]);
    setChargeSearch("");
  };

  const handleAnswerChange = (id, val) => {
    setWizardAnswers(prev => ({ ...prev, [id]: val }));
  };

  const handleDescSubmit = () => {
    if (!wizardAnswers.description || wizardAnswers.description.length < 5) return alert("Please provide a brief description first.");
    const probes = getProbingQuestions(wizardAnswers);
    if (probes.length > 0) {
      setProbingQuestions(probes);
      setWizardPhase('PROBE');
    } else {
      finalizeQuestions();
    }
  };

  const finalizeQuestions = () => {
    const suggested = suggestCharges(wizardAnswers);
    setSelectedOffences(suggested);
    setWizardPhase('CHARGES');
  };

  const toggleOffence = (offence) => {
    setSelectedOffences(prev => prev.find(o => o.id === offence.id) ? prev.filter(o => o.id !== offence.id) : [...prev, offence]);
  };

  const handleGenerateFinalText = () => {
    const draft = generateLocalDraft({
      employeeName: `${employee.first_name} ${employee.last_name}`,
      date: incidentDate,
      answers: wizardAnswers,
      selectedOffences: selectedOffences
    });
    setDescription(draft);
    setIsWizardOpen(false);
    setIsAdding(true);
  };

  const handleSubmitFeedback = async () => {
    try {
      setIsSubmittingFeedback(true);
      await submitEngineFeedback({ managerName: issuedBy || 'System Admin', originalFacts: JSON.stringify(wizardAnswers), generatedDraft: description, correctionNotes: feedbackNote });
      alert("Correction sent to Stanley. Thank you.");
      setShowFeedbackModal(false);
      setFeedbackNote("");
    } catch (err) {
      alert("Failed to send feedback.");
    } finally {
      setIsSubmittingFeedback(false);
    }
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
      const { error } = await supabase.from("employee_warnings").insert([{ employee_id: employee.id, warning_level: warningLevel, incident_date: incidentDate, description: description, issued_by: issuedBy, file_url: uploadedPath }]);
      if (error) throw error;

      // 🧠 Knowledge Capture for AI Growth
      try {
        await supabase.from("disciplinary_knowledge").insert([{
          employee_id: employee.id,
          raw_facts: JSON.stringify(wizardAnswers),
          final_draft: description,
          warning_level: warningLevel,
          incident_date: incidentDate
        }]);
      } catch (kErr) {
        console.warn("Knowledge capture table not found, skipping learning step.", kErr.message);
      }

      // Notify Staff
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

  const filteredRegistry = OFFENCE_REGISTRY.filter(o => o.desc.toLowerCase().includes(chargeSearch.toLowerCase()) || o.cat.toLowerCase().includes(chargeSearch.toLowerCase()))
    .sort((a, b) => {
      const aSelected = selectedOffences.some(o => o.id === a.id);
      const bSelected = selectedOffences.some(o => o.id === b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });

  return (
    <div className="space-y-6 text-xs">

      {/* 🚀 Expert Wizard Overlay */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-600 rounded-2xl flex items-center justify-center text-white"><Gavel size={20} /></div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">Expert Disciplinary Engine</h3>
              </div>
              <button onClick={() => setIsWizardOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={20} /></button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-slate-50/50">
              {wizardPhase === 'DESC' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center space-y-2">
                    <h4 className="text-lg font-black text-slate-900 leading-tight">Summarize the Incident</h4>
                    <p className="text-slate-500 font-medium">Describe what happened. The engine will investigate the legal specifics.</p>
                  </div>
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
                    <textarea rows={6} value={wizardAnswers.description || ""} onChange={e => handleAnswerChange('description', e.target.value)} placeholder="e.g., Thabo hit a waiter during the lunch rush..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm focus:border-yellow-600 outline-none transition-all" />
                  </div>
                  <button onClick={handleDescSubmit} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">Analyze Facts <ChevronRight size={18}/></button>
                </div>
              )}

              {wizardPhase === 'PROBE' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex flex-col items-center text-center gap-4">
                    <AlertTriangle className="text-amber-600" size={40} />
                    <h4 className="text-amber-900 font-black text-lg uppercase">Expert Investigation Required</h4>
                  </div>
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                    {probingQuestions.map(q => (
                      <div key={q.id} className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{q.label}</label>
                        {q.type === 'boolean' ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleAnswerChange(q.id, true)} className={`flex-1 py-2.5 rounded-xl border-2 font-bold transition-all ${wizardAnswers[q.id] === true ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}>YES</button>
                            <button onClick={() => handleAnswerChange(q.id, false)} className={`flex-1 py-2.5 rounded-xl border-2 font-bold transition-all ${wizardAnswers[q.id] === false ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100'}`}>NO</button>
                          </div>
                        ) : (
                          <input type={q.type} value={wizardAnswers[q.id] || ""} onChange={e => handleAnswerChange(q.id, e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3"><button onClick={() => setWizardPhase('DESC')} className="px-6 py-3 border-2 border-slate-100 rounded-xl font-bold text-slate-400">Back</button><button onClick={finalizeQuestions} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black uppercase shadow-lg">Finalize Detail</button></div>
                </div>
              )}

              {wizardPhase === 'CHARGES' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="text-center space-y-2"><h4 className="text-lg font-black text-slate-900">Map Annexure B Charges</h4><p className="text-slate-500 font-medium">Select the official codes that apply. Suggested charges are prioritized.</p></div>
                  <input type="text" placeholder="Search charges..." value={chargeSearch} onChange={e => setChargeSearch(e.target.value)} className="w-full px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-yellow-600 transition-all" />
                  <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                    {filteredRegistry.map(offence => {
                      const isSelected = selectedOffences.some(o => o.id === offence.id);
                      return (
                        <button key={offence.id} onClick={() => toggleOffence(offence)} className={`p-4 border-2 rounded-2xl text-left transition-all flex items-center justify-between ${isSelected ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 hover:border-yellow-600'}`}>
                          <div className="flex-1"><p className="font-bold text-xs">{offence.desc}</p></div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-yellow-600 border-yellow-600' : 'border-slate-100'}`}>{isSelected && <Check size={14} className="text-white" />}</div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-4 flex gap-3 border-t border-slate-100"><button onClick={() => setWizardPhase('PROBE')} className="px-6 py-3 border-2 border-slate-100 rounded-xl font-bold text-slate-400">Back</button><button onClick={handleGenerateFinalText} disabled={selectedOffences.length === 0} className="flex-1 bg-yellow-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"><Wand2 size={20} /> Generate Narrative</button></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registry View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ModuleWorkspaceHeader title="Disciplinary Registry" description="Professional local engine powered by Annexure B." icon={Gavel} actions={
            <button onClick={handleStartWizard} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-slate-800 transition-all active:scale-95"><BrainCircuit size={16} /> Legal Engine Wizard</button>
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
                   <button type="button" onClick={() => setShowFeedbackModal(true)} className="flex items-center justify-center gap-2 text-slate-400 hover:text-yellow-600 transition-colors py-1 group"><MessageSquare size={14} /><span className="font-bold text-[9px] uppercase tracking-widest group-hover:underline">Draft needs correction? Email Stanley</span></button>
                  <div className="flex gap-2"><button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-[10px] uppercase">Cancel</button><button type="submit" disabled={isSaving} className="flex-[2] py-2.5 bg-yellow-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg disabled:opacity-50 transition-all active:scale-95">{isSaving ? "Saving..." : "Save Formal Record"}</button></div>
                </div>
              </form>
            ) : (
              <div className="py-12 text-center space-y-4 px-8 italic text-slate-400 leading-relaxed">Launch the <span className="text-yellow-600 font-bold">Legal Wizard</span> to draft a sound warning using Annexure B charges.</div>
            )}
          </SummaryCard>
        </div>
      </div>

      {/* 📩 Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="text-center space-y-2"><h4 className="text-lg font-black text-slate-900">Engine Correction</h4><p className="text-slate-500 text-xs font-medium">Explain what was wrong with the generated draft. This will be emailed directly to Stanley.</p></div>
            <textarea rows={5} value={feedbackNote} onChange={e => setFeedbackNote(e.target.value)} placeholder="e.g. The narrative should include the witness names more prominently..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm focus:border-yellow-600 outline-none transition-all" />
            <div className="flex gap-3"><button onClick={() => setShowFeedbackModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold transition-all">Cancel</button><button onClick={handleSubmitFeedback} disabled={isSubmittingFeedback || !feedbackNote} className="flex-[2] bg-slate-900 text-white py-3 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">{isSubmittingFeedback ? "Dispatching..." : <><Send size={18} /> Notify Stanley</>}</button></div>
          </div>
        </div>
      )}
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