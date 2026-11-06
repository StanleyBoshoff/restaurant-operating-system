import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { OFFENCE_REGISTRY, DISCIPLINARY_LEVELS } from "../../utils/disciplinaryEngine";
import { UniversalEngine } from "../../utils/disciplinary/UniversalEngine";
import { Judge } from "../../utils/disciplinary/Judge";
import { fetchActiveHistory } from "../../utils/disciplinary/HistoryService";
import {
  Gavel, History, BrainCircuit, ChevronRight, Check, Search, Wand2, ShieldCheck, ShieldAlert, Info, X, Users, Copy
} from "lucide-react";
import SummaryCard from "../common/SummaryCard";

export default function TabEngine() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Wizard States
  const [wizardPhase, setWizardPhase] = useState('SELECT'); // 'SELECT', 'ALLEGATION', 'INVESTIGATION', 'JUDGMENT'
  const [allegation, setAllegation] = useState("");
  const [engine, setEngine] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [judgment, setJudgment] = useState(null);
  const [generatedTemplate, setGeneratedTemplate] = useState("");

  useEffect(() => {
    async function fetchEmployees() {
      const { data } = await supabase.from('employees').select('id, first_name, last_name, role, department').order('first_name');
      setEmployees(data || []);
    }
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(e =>
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartWizard = (emp) => {
    setSelectedEmployee(emp);
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
    const history = await fetchActiveHistory(selectedEmployee.id);
    const result = Judge.assess(incident, history);
    setJudgment(result);

    const template = result.narrative + "\n\n" +
      "CHARGE(S):\n" +
      result.offence.desc + "\n\n" +
      "SUPPORTING REASONS:\n" +
      result.supportingReasons.map((r, i) => `${i+1}. ${r}`).join('\n');

    setGeneratedTemplate(template);
    setWizardPhase('JUDGMENT');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedTemplate);
    alert("Template copied to clipboard. You can now use this to draft the handwritten warning.");
  };

  return (
    <div className="space-y-6">
      {wizardPhase === 'SELECT' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 animate-in fade-in duration-500 shadow-sm">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-600 border border-yellow-500/20 mx-auto mb-4">
              <Wand2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase">Warning Engine Wizard</h3>
            <p className="text-slate-500 text-xs font-medium max-w-md mx-auto">Select an employee to begin a guided disciplinary investigation and generate a professional template.</p>
          </div>

          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-yellow-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1">
            {filteredEmployees.map(emp => (
              <button
                key={emp.id}
                onClick={() => handleStartWizard(emp)}
                className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-yellow-500 hover:shadow-md transition-all text-left group"
              >
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-yellow-50 group-hover:text-yellow-600 transition-colors">
                  <Users size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-[11px] uppercase tracking-tight">{emp.first_name} {emp.last_name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{emp.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {wizardPhase === 'ALLEGATION' && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <button onClick={() => setWizardPhase('SELECT')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2">
            <ChevronRight className="rotate-180" size={14}/> Back to Selection
          </button>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 space-y-8 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Gavel size={24} /></div>
              <div>
                <h4 className="text-xl font-black text-slate-900 uppercase">State the Allegation</h4>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Employee: {selectedEmployee.first_name} {selectedEmployee.last_name}</p>
              </div>
            </div>
            <textarea
              rows={6}
              value={allegation}
              onChange={e => setAllegation(e.target.value)}
              placeholder="e.g., Sarah was late for her shift..."
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-6 text-sm focus:border-yellow-600 outline-none transition-all shadow-inner"
            />
            <button onClick={handleAllegationSubmit} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 hover:bg-slate-800">
              Initiate Investigation <ChevronRight size={18}/>
            </button>
          </div>
        </div>
      )}

      {wizardPhase === 'INVESTIGATION' && currentQuestion && (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[3rem] flex flex-col items-center text-center gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Search size={100} /></div>
            <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center text-yellow-500 border border-yellow-500/20 shadow-2xl"><BrainCircuit size={40} /></div>
            <div className="space-y-3">
                <h4 className="text-white font-black text-2xl uppercase tracking-tight">{currentQuestion.label}</h4>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.3em]">{currentQuestion.phase}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 max-w-md mx-auto">
            {currentQuestion.type === 'boolean_tristate' ? (
              <div className="space-y-4">
                <button onClick={() => handleAnswer(true)} className="w-full p-8 bg-white border-2 border-slate-100 rounded-[2rem] text-sm font-black text-slate-900 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-between group shadow-sm hover:shadow-xl">
                    YES / TRUE
                    <Check className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
                <button onClick={() => handleAnswer(false)} className="w-full p-8 bg-white border-2 border-slate-100 rounded-[2rem] text-sm font-black text-slate-900 hover:border-rose-500 hover:bg-rose-50 transition-all flex items-center justify-between group shadow-sm hover:shadow-xl">
                    NO / FALSE
                    <X className="text-rose-500 opacity-0 group-hover:opacity-100 transition-all" />
                </button>
                <button onClick={() => handleAnswer('UNKNOWN')} className="w-full p-6 bg-slate-100 border-2 border-slate-200 rounded-[1.5rem] text-sm font-black text-slate-400 hover:bg-slate-200 transition-all flex items-center justify-between shadow-inner">
                    UNKNOWN
                    <Info size={18} />
                </button>
              </div>
            ) : (
                <div className="bg-white border-2 border-slate-100 p-10 rounded-[2.5rem] shadow-2xl">
                    <input
                        type={currentQuestion.type === 'time' ? 'time' : currentQuestion.type === 'number' ? 'number' : 'text'}
                        autoFocus
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-5 text-3xl font-black text-center outline-none focus:border-yellow-600 transition-all"
                        onKeyDown={e => e.key === 'Enter' && handleAnswer(e.target.value)}
                    />
                    <p className="text-center text-[11px] text-slate-400 font-black uppercase mt-6 tracking-widest">Press Enter to Confirm</p>
                </div>
            )}
          </div>
        </div>
      )}

      {wizardPhase === 'JUDGMENT' && judgment && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
          <div className={`p-10 rounded-[3rem] border-4 flex flex-col items-center text-center gap-8 shadow-2xl ${
              judgment.recommendation === 'DISMISSAL' ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
          }`}>
            {judgment.recommendation === 'DISMISSAL' ? <ShieldAlert size={80} className="text-rose-600" /> : <ShieldCheck size={80} className="text-emerald-600" />}
            <div>
                <h4 className="font-black text-3xl uppercase tracking-tight text-slate-900">
                    {judgment.recommendation.replace(/_/g, ' ')} RECOMMENDED
                </h4>
                <p className="text-slate-600 font-bold text-base max-w-lg mt-3 leading-relaxed italic">"{judgment.explanation}"</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SummaryCard title="Disciplinary Pillar" icon={History}>
                  <div className="py-4">
                      <span className="text-5xl font-black text-slate-900">#{judgment.pillars.occurrence}</span>
                      <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-2">Occurrence of this specific offence</p>
                  </div>
              </SummaryCard>
              <SummaryCard title="Behavioural Pattern" icon={BrainCircuit}>
                  <div className="py-4">
                      <span className={`text-xl font-black uppercase tracking-widest ${judgment.pillars.patternCount > 1 ? 'text-amber-600' : 'text-slate-400'}`}>
                          {judgment.pillars.patternCount > 1 ? 'Pattern Detected' : 'First Instance'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">{judgment.pillars.patternCount} category entries detected</p>
                  </div>
              </SummaryCard>
          </div>

          <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-6">
               <h5 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Wand2 size={18} className="text-yellow-600" /> Generated Template
              </h5>
              <button onClick={copyToClipboard} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                <Copy size={16} /> Copy to Clipboard
              </button>
            </div>
            <pre className="bg-slate-50 p-8 rounded-3xl font-mono text-xs leading-loose whitespace-pre-wrap text-slate-700 shadow-inner border border-slate-100">
              {generatedTemplate}
            </pre>
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
              <Info className="text-blue-500 shrink-0" size={20} />
              <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                <strong className="block uppercase tracking-widest mb-1">Next Step:</strong>
                Use this text to handwrite or draft the formal warning document. Once issued and signed by the employee, return to their profile to upload the signed proof and record the metadata.
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-4">
             <button onClick={() => setWizardPhase('SELECT')} className="px-12 py-5 border-2 border-slate-200 rounded-2xl font-black text-xs uppercase text-slate-400 tracking-widest hover:bg-slate-100 transition-all">Start New Investigation</button>
          </div>
        </div>
      )}
    </div>
  );
}
