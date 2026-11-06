import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Wand2, Plus, Trash2, Video, Layers, HelpCircle, Save, CheckCircle2, ChevronDown, ChevronUp, Sparkles, BookOpen } from 'lucide-react';

const ROLES_LIST = ['Waiter', 'Bartender', 'Chef', 'Kitchen Staff', 'Host', 'Runner', 'Manager', 'General Staff'];

export default function TabCourseCreator() {
  const [courseMeta, setCourseMeta] = useState({
    title: '',
    category: 'Service',
    description: '',
    duration: '30 mins',
    difficulty: 'Beginner',
    status: 'Mandatory',
    target_roles: ['Waiter', 'Bartender']
  });

  const [steps, setSteps] = useState([
    {
      id: 'step-' + Date.now(),
      type: 'video',
      title: 'Introductory Video Lesson',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'Watch this introductory video to understand core training principles.'
    }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const toggleRole = (role) => {
    const current = courseMeta.target_roles;
    if (current.includes(role)) {
      setCourseMeta({ ...courseMeta, target_roles: current.filter(r => r !== role) });
    } else {
      setCourseMeta({ ...courseMeta, target_roles: [...current, role] });
    }
  };

  const addStep = (type) => {
    let newStep = { id: 'step-' + Date.now(), type, title: type === 'video' ? 'Video Lesson' : type === 'flashcards' ? 'Study Flashcards' : 'Assessment Quiz' };
    if (type === 'video') {
      newStep.videoUrl = '';
      newStep.description = '';
    } else if (type === 'flashcards') {
      newStep.cards = [{ id: 1, term: '', definition: '' }];
    } else if (type === 'quiz') {
      newStep.questions = [
        {
          id: 1,
          question: '',
          hint: '',
          correctAnswer: '',
          incorrect1: '',
          incorrect2: '',
          incorrect3: ''
        }
      ];
    }
    setSteps([...steps, newStep]);
  };

  const updateStep = (index, field, value) => {
    const updated = [...steps];
    updated[index][field] = value;
    setSteps(updated);
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  // Flashcards helpers
  const addFlashcard = (stepIndex) => {
    const updated = [...steps];
    updated[stepIndex].cards.push({ id: Date.now(), term: '', definition: '' });
    setSteps(updated);
  };

  const updateFlashcard = (stepIndex, cardIndex, field, value) => {
    const updated = [...steps];
    updated[stepIndex].cards[cardIndex][field] = value;
    setSteps(updated);
  };

  const removeFlashcard = (stepIndex, cardIndex) => {
    const updated = [...steps];
    updated[stepIndex].cards = updated[stepIndex].cards.filter((_, i) => i !== cardIndex);
    setSteps(updated);
  };

  // Quiz helpers
  const addQuizQuestion = (stepIndex) => {
    const updated = [...steps];
    updated[stepIndex].questions.push({
      id: Date.now(),
      question: '',
      hint: '',
      correctAnswer: '',
      incorrect1: '',
      incorrect2: '',
      incorrect3: ''
    });
    setSteps(updated);
  };

  const updateQuizQuestion = (stepIndex, qIndex, field, value) => {
    const updated = [...steps];
    updated[stepIndex].questions[qIndex][field] = value;
    setSteps(updated);
  };

  const removeQuizQuestion = (stepIndex, qIndex) => {
    const updated = [...steps];
    updated[stepIndex].questions = updated[stepIndex].questions.filter((_, i) => i !== qIndex);
    setSteps(updated);
  };

  const handlePublishCourse = async (e) => {
    e.preventDefault();
    if (!courseMeta.title.trim()) return alert("Please enter a course title.");

    setIsSaving(true);
    setSuccessMessage('');

    try {
      // Extract youtubeId from videoUrl if applicable
      let youtubeId = 'dQw4w9WgXcQ';
      const videoStep = steps.find(s => s.type === 'video');
      if (videoStep && videoStep.videoUrl) {
        const match = videoStep.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (match && match[1]) youtubeId = match[1];
      }

      // Format flashcards and quiz to match course player requirements
      const formattedFlashcards = [];
      const formattedQuestions = [];

      steps.forEach(step => {
        if (step.type === 'flashcards' && step.cards) {
          step.cards.forEach(c => {
            if (c.term) formattedFlashcards.push({ id: c.id, term: c.term, definition: c.definition });
          });
        }
        if (step.type === 'quiz' && step.questions) {
          step.questions.forEach((q, idx) => {
            if (q.question && q.correctAnswer) {
              // Store correct answer + 3 incorrect answers. QuizEngine will randomize options on run!
              formattedQuestions.push({
                id: q.id || idx + 1,
                question: q.question,
                hint: q.hint || '',
                correctAnswerText: q.correctAnswer,
                incorrectAnswers: [q.incorrect1, q.incorrect2, q.incorrect3].filter(Boolean)
              });
            }
          });
        }
      });

      const coursePayload = {
        title: courseMeta.title,
        category: courseMeta.category,
        description: courseMeta.description,
        duration: courseMeta.duration,
        difficulty: courseMeta.difficulty,
        status: courseMeta.status,
        target_roles: courseMeta.target_roles,
        youtubeId: youtubeId,
        steps: steps,
        flashcards: formattedFlashcards,
        quiz: { questions: formattedQuestions }
      };

      const { error } = await supabase.from('training_courses').insert([coursePayload]);
      if (error) throw error;

      setSuccessMessage("Masterclass Course published successfully! Available now under Courses.");
      setCourseMeta({
        title: '',
        category: 'Service',
        description: '',
        duration: '30 mins',
        difficulty: 'Beginner',
        status: 'Mandatory',
        target_roles: ['Waiter']
      });
      setSteps([
        { id: 'step-' + Date.now(), type: 'video', title: 'Introductory Video Lesson', videoUrl: '', description: '' }
      ]);
    } catch (err) {
      alert("Failed to publish course: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
         <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
         <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
               <Wand2 size={32} />
            </div>
            <div>
               <h1 className="text-2xl font-black uppercase tracking-tight text-yellow-400">Masterclass Studio (Course Creator)</h1>
               <p className="text-xs text-slate-400 font-medium mt-1">Design interactive operational courses, video lessons, flashcard study decks, and randomized quizzes.</p>
            </div>
         </div>
      </div>

      {successMessage && (
         <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <CheckCircle2 size={18} /> {successMessage}
         </div>
      )}

      <form onSubmit={handlePublishCourse} className="space-y-8">
         {/* Course Details Card */}
         <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4">
               <BookOpen size={16} className="text-yellow-600" /> 1. Course Metadata & Target Roles
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Course Title</label>
                  <input
                    type="text" required
                    placeholder="e.g. Advanced Up-selling & Wine Pairing"
                    value={courseMeta.title}
                    onChange={e => setCourseMeta({ ...courseMeta, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black text-slate-900 outline-none focus:border-slate-900"
                  />
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <select
                    value={courseMeta.category}
                    onChange={e => setCourseMeta({ ...courseMeta, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-slate-900"
                  >
                     <option value="Service">Service & Hospitality</option>
                     <option value="Kitchen">Kitchen Operations</option>
                     <option value="Bar">Bar & Beverage</option>
                     <option value="Safety">Safety & Hygiene</option>
                     <option value="Management">Management & Leadership</option>
                     <option value="General">General Operations</option>
                  </select>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Difficulty</label>
                  <select
                    value={courseMeta.difficulty}
                    onChange={e => setCourseMeta({ ...courseMeta, difficulty: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-slate-900"
                  >
                     <option value="Beginner">Beginner</option>
                     <option value="Intermediate">Intermediate</option>
                     <option value="Advanced">Advanced</option>
                  </select>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 45 mins"
                    value={courseMeta.duration}
                    onChange={e => setCourseMeta({ ...courseMeta, duration: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                  />
               </div>
            </div>

            <div>
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Course Description</label>
               <textarea
                 rows={3}
                 placeholder="Brief summary of what trainees will learn..."
                 value={courseMeta.description}
                 onChange={e => setCourseMeta({ ...courseMeta, description: e.target.value })}
                 className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-700 outline-none focus:border-slate-900"
               />
            </div>

            {/* Target Audience Checkboxes */}
            <div className="pt-2">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Audience (Available Roles)</label>
               <div className="flex flex-wrap gap-3">
                  {ROLES_LIST.map(role => {
                    const isChecked = courseMeta.target_roles.includes(role);
                    return (
                       <button
                         key={role}
                         type="button"
                         onClick={() => toggleRole(role)}
                         className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                            isChecked
                            ? 'bg-yellow-500 border-yellow-500 text-slate-950 shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                         }`}
                       >
                          {isChecked ? '✓ ' : '+ '} {role}
                       </button>
                    );
                  })}
               </div>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-2 italic">Only employees belonging to selected roles will see and be enrolled in this course.</p>
            </div>
         </div>

         {/* Steps Builder Card */}
         <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Layers size={16} className="text-yellow-600" /> 2. Course Steps & Curriculum
               </h3>
               <div className="flex items-center gap-2">
                  <button type="button" onClick={() => addStep('video')} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all">
                     <Video size={14} /> + Video Lesson
                  </button>
                  <button type="button" onClick={() => addStep('flashcards')} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all">
                     <Layers size={14} /> + Flashcards
                  </button>
                  <button type="button" onClick={() => addStep('quiz')} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all">
                     <HelpCircle size={14} /> + Assessment
                  </button>
               </div>
            </div>

            <div className="space-y-6">
               {steps.map((step, sIdx) => (
                  <div key={step.id} className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 relative space-y-4 shadow-3xs">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <span className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                              {sIdx + 1}
                           </span>
                           <input
                             type="text"
                             value={step.title}
                             onChange={e => updateStep(sIdx, 'title', e.target.value)}
                             className="bg-transparent text-sm font-black text-slate-900 uppercase tracking-tight outline-none border-b border-dashed border-slate-300 focus:border-slate-900 pb-0.5 w-64"
                           />
                           <span className="px-2 py-0.5 rounded-md bg-yellow-100 text-yellow-800 text-[9px] font-black uppercase tracking-widest">
                              {step.type.toUpperCase()}
                           </span>
                        </div>
                        <button type="button" onClick={() => removeStep(sIdx)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors">
                           <Trash2 size={16} />
                        </button>
                     </div>

                     {/* STEP TYPE 1: VIDEO LESSON */}
                     {step.type === 'video' && (
                        <div className="space-y-4 pt-2">
                           <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Video URL (YouTube Link or Embed URL)</label>
                              <input
                                type="text"
                                placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                value={step.videoUrl || ''}
                                onChange={e => updateStep(sIdx, 'videoUrl', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-slate-900"
                              />
                           </div>
                           <div>
                              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Video Lesson Description / Instructions</label>
                              <textarea
                                rows={2}
                                placeholder="Explain what trainees should focus on while watching..."
                                value={step.description || ''}
                                onChange={e => updateStep(sIdx, 'description', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 outline-none focus:border-slate-900"
                              />
                           </div>
                        </div>
                     )}

                     {/* STEP TYPE 2: FLASHCARDS */}
                     {step.type === 'flashcards' && (
                        <div className="space-y-4 pt-2">
                           <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Study Flashcards (Front / Back)</span>
                              <button type="button" onClick={() => addFlashcard(sIdx)} className="text-[10px] font-black text-yellow-700 hover:text-yellow-800 uppercase">
                                 + Add Flashcard
                              </button>
                           </div>

                           <div className="space-y-3">
                              {step.cards.map((card, cIdx) => (
                                 <div key={card.id || cIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-2xl border border-slate-200 relative group">
                                    <div>
                                       <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Front (Statement / Question / Term)</label>
                                       <input
                                         type="text"
                                         placeholder="e.g. Waiter's Kit"
                                         value={card.term}
                                         onChange={e => updateFlashcard(sIdx, cIdx, 'term', e.target.value)}
                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                                       />
                                    </div>
                                    <div className="relative">
                                       <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Back (Explanation / Definition)</label>
                                       <input
                                         type="text"
                                         placeholder="e.g. 2 black cloths, 1 lighter, waiter's friend..."
                                         value={card.definition}
                                         onChange={e => updateFlashcard(sIdx, cIdx, 'definition', e.target.value)}
                                         className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                                       />
                                       {step.cards.length > 1 && (
                                          <button type="button" onClick={() => removeFlashcard(sIdx, cIdx)} className="absolute -top-2 -right-2 w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shadow-xs hover:bg-rose-200">
                                             <Trash2 size={12} />
                                          </button>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* STEP TYPE 3: ASSESSMENT QUIZ */}
                     {step.type === 'quiz' && (
                        <div className="space-y-4 pt-2">
                           <div className="flex items-center justify-between">
                              <div>
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assessment Questions</span>
                                 <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">Note: Enter 1 Correct Answer + 3 Incorrect Answers. The engine will automatically randomize question order and answer positions on every run!</p>
                              </div>
                              <button type="button" onClick={() => addQuizQuestion(sIdx)} className="text-[10px] font-black text-yellow-700 hover:text-yellow-800 uppercase shrink-0">
                                 + Add Question
                              </button>
                           </div>

                           <div className="space-y-4">
                              {step.questions.map((q, qIdx) => (
                                 <div key={q.id || qIdx} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 relative">
                                    <div className="flex items-center justify-between">
                                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Question {qIdx + 1}</span>
                                       {step.questions.length > 1 && (
                                          <button type="button" onClick={() => removeQuizQuestion(sIdx, qIdx)} className="text-slate-300 hover:text-rose-600">
                                             <Trash2 size={14} />
                                          </button>
                                       )}
                                    </div>

                                    <input
                                      type="text"
                                      placeholder="Enter question statement..."
                                      value={q.question}
                                      onChange={e => updateQuizQuestion(sIdx, qIdx, 'question', e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-slate-900"
                                    />

                                    <input
                                      type="text"
                                      placeholder="Optional Hint..."
                                      value={q.hint}
                                      onChange={e => updateQuizQuestion(sIdx, qIdx, 'hint', e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-1.5 text-[10px] font-medium text-slate-600 italic"
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                       <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1">
                                          <label className="block text-[8px] font-black text-emerald-700 uppercase tracking-widest">✓ Correct Answer (Always Position 1)</label>
                                          <input
                                            type="text"
                                            placeholder="The correct answer text..."
                                            value={q.correctAnswer}
                                            onChange={e => updateQuizQuestion(sIdx, qIdx, 'correctAnswer', e.target.value)}
                                            className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                                          />
                                       </div>

                                       <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl space-y-1">
                                          <label className="block text-[8px] font-black text-rose-700 uppercase tracking-widest">✗ Incorrect Answer 1</label>
                                          <input
                                            type="text"
                                            placeholder="Wrong option 1..."
                                            value={q.incorrect1}
                                            onChange={e => updateQuizQuestion(sIdx, qIdx, 'incorrect1', e.target.value)}
                                            className="w-full bg-white border border-rose-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                                          />
                                       </div>

                                       <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl space-y-1">
                                          <label className="block text-[8px] font-black text-rose-700 uppercase tracking-widest">✗ Incorrect Answer 2</label>
                                          <input
                                            type="text"
                                            placeholder="Wrong option 2..."
                                            value={q.incorrect2}
                                            onChange={e => updateQuizQuestion(sIdx, qIdx, 'incorrect2', e.target.value)}
                                            className="w-full bg-white border border-rose-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                                          />
                                       </div>

                                       <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl space-y-1">
                                          <label className="block text-[8px] font-black text-rose-700 uppercase tracking-widest">✗ Incorrect Answer 3</label>
                                          <input
                                            type="text"
                                            placeholder="Wrong option 3..."
                                            value={q.incorrect3}
                                            onChange={e => updateQuizQuestion(sIdx, qIdx, 'incorrect3', e.target.value)}
                                            className="w-full bg-white border border-rose-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                                          />
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                  </div>
               ))}
            </div>
         </div>

         {/* Publish Submit Bar */}
         <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-3 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
               <Save size={18} />
               {isSaving ? 'Publishing Masterclass...' : 'Publish Masterclass Course'}
            </button>
         </div>
      </form>
    </div>
  );
}
