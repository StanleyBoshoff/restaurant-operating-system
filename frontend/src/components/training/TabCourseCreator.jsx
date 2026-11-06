import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Wand2, Plus, Trash2, Video, Layers, HelpCircle, Save, CheckCircle2, BookOpen, Edit3, X, Sparkles } from 'lucide-react';

const ROLES_LIST = ['Waiter', 'Bartender', 'Chef', 'Kitchen Staff', 'Host', 'Runner', 'Manager', 'General Staff'];

export default function TabCourseCreator() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);

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

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('training_courses').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCourseId(null);
    setCourseMeta({
      title: '',
      category: 'Service',
      description: '',
      duration: '30 mins',
      difficulty: 'Beginner',
      status: 'Mandatory',
      target_roles: ['Waiter', 'Bartender']
    });
    setSteps([
      { id: 'step-' + Date.now(), type: 'video', title: 'Introductory Video Lesson', videoUrl: '', description: '' }
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourseId(course.id);
    const s = course.steps || {};
    setCourseMeta({
      title: course.title || '',
      category: course.category || 'Service',
      description: s.description || course.description || '',
      duration: s.duration || course.duration || '30 mins',
      difficulty: s.difficulty || course.difficulty || 'Beginner',
      status: course.status || 'Mandatory',
      target_roles: s.target_roles || course.target_roles || ['Waiter']
    });

    if (s.stepsList && s.stepsList.length > 0) {
      setSteps(s.stepsList);
    } else {
      const reconstructed = [];
      if (s.youtubeId || course.youtubeId) {
        reconstructed.push({ id: 'v-1', type: 'video', title: 'Video Lesson', videoUrl: `https://www.youtube.com/watch?v=${s.youtubeId || course.youtubeId}`, description: s.description || '' });
      }
      if (s.flashcards && s.flashcards.length > 0) {
        reconstructed.push({ id: 'f-1', type: 'flashcards', title: 'Study Session', cards: s.flashcards });
      }
      if (s.quiz?.questions && s.quiz.questions.length > 0) {
        reconstructed.push({
          id: 'q-1',
          type: 'quiz',
          title: 'Assessment',
          questions: s.quiz.questions.map(q => ({
            id: q.id,
            question: q.question,
            hint: q.hint,
            correctAnswer: q.correctAnswerText || q.correctAnswer || '',
            incorrect1: q.incorrectAnswers?.[0] || '',
            incorrect2: q.incorrectAnswers?.[1] || '',
            incorrect3: q.incorrectAnswers?.[2] || ''
          }))
        });
      }
      setSteps(reconstructed.length > 0 ? reconstructed : [{ id: 'step-1', type: 'video', title: 'Video Lesson', videoUrl: '', description: '' }]);
    }

    setIsModalOpen(true);
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this masterclass course?")) return;
    try {
      const { error } = await supabase.from('training_courses').delete().eq('id', id);
      if (error) throw error;
      setCourses(courses.filter(c => c.id !== id));
    } catch (err) {
      alert("Failed to delete course: " + err.message);
    }
  };

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

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseMeta.title.trim()) return alert("Please enter a course title.");

    setIsSaving(true);
    try {
      let youtubeId = 'dQw4w9WgXcQ';
      const videoStep = steps.find(s => s.type === 'video');
      if (videoStep && videoStep.videoUrl) {
        const match = videoStep.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        if (match && match[1]) youtubeId = match[1];
      }

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
        status: courseMeta.status,
        steps: {
          description: courseMeta.description,
          duration: courseMeta.duration,
          difficulty: courseMeta.difficulty,
          target_roles: courseMeta.target_roles,
          youtubeId: youtubeId,
          stepsList: steps,
          flashcards: formattedFlashcards,
          quiz: { questions: formattedQuestions }
        }
      };

      if (editingCourseId) {
        const { error } = await supabase.from('training_courses').update(coursePayload).eq('id', editingCourseId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('training_courses').insert([coursePayload]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      alert("Failed to save course: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header & Create Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
         <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
         <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
               <Wand2 size={32} />
            </div>
            <div>
               <h1 className="text-2xl font-black uppercase tracking-tight text-yellow-400">Masterclass Studio (Course Creator)</h1>
               <p className="text-xs text-slate-400 font-medium mt-1">Design, edit, and manage interactive operational courses, video lessons, flashcards, and quizzes.</p>
            </div>
         </div>
         <button
           onClick={openCreateModal}
           className="px-6 py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 relative z-10"
         >
            <Plus size={18} /> Create New Masterclass
         </button>
      </div>

      {/* Course List Table View */}
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
               <BookOpen size={16} className="text-yellow-600" /> Existing Masterclass Courses ({courses.length})
            </h3>
         </div>

         {loading ? (
            <div className="py-20 text-center italic text-slate-400 text-xs">Loading masterclass courses...</div>
         ) : courses.length === 0 ? (
            <div className="py-20 text-center space-y-3">
               <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">No custom courses created yet.</p>
               <button onClick={openCreateModal} className="px-6 py-3 bg-slate-900 text-white font-black text-xs uppercase rounded-xl cursor-pointer">Create First Course</button>
            </div>
         ) : (
            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="pl-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Course Title</th>
                        <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Category</th>
                        <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Difficulty</th>
                        <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Duration</th>
                        <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Roles</th>
                        <th className="pr-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {courses.map(course => {
                        const s = course.steps || {};
                        const roles = s.target_roles || course.target_roles || [];
                        return (
                           <tr key={course.id} className="hover:bg-slate-50/75 transition-colors">
                              <td className="pl-6 py-4">
                                 <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{course.title}</p>
                                 <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{s.description || 'No description provided.'}</p>
                              </td>
                              <td className="px-4 py-4 text-center">
                                 <span className="text-[9px] font-black uppercase px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                                    {course.category || 'Service'}
                                 </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                 <span className="text-[10px] font-bold text-slate-600 uppercase">{s.difficulty || 'Beginner'}</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                 <span className="text-[10px] font-bold text-slate-600">{s.duration || '30 mins'}</span>
                              </td>
                              <td className="px-4 py-4">
                                 <div className="flex flex-wrap gap-1">
                                    {roles.map(r => (
                                       <span key={r} className="text-[8px] font-black uppercase bg-yellow-50 text-yellow-800 px-1.5 py-0.5 rounded border border-yellow-200">
                                          {r}
                                       </span>
                                    ))}
                                 </div>
                              </td>
                              <td className="pr-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => openEditModal(course)}
                                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                    >
                                       <Edit3 size={12} /> Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCourse(course.id)}
                                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer"
                                      title="Delete Course"
                                    >
                                       <Trash2 size={14} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         )}
      </div>

      {/* CREATE / EDIT COURSE MODAL */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-8 space-y-6 animate-in zoom-in-95 duration-300 my-auto">

               <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                     {editingCourseId ? 'Edit Masterclass Course' : 'Create New Masterclass Course'}
                  </h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                     <X size={20} />
                  </button>
               </div>

               <form onSubmit={handleSaveCourse} className="space-y-8">
                  {/* Course Details Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-5">
                     <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <BookOpen size={14} className="text-yellow-600" /> 1. Course Metadata & Target Roles
                     </h3>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Course Title</label>
                           <input
                             type="text" required
                             placeholder="e.g. Advanced Up-selling & Wine Pairing"
                             value={courseMeta.title}
                             onChange={e => setCourseMeta({ ...courseMeta, title: e.target.value })}
                             className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-900 outline-none focus:border-slate-900"
                           />
                        </div>

                        <div>
                           <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                           <select
                             value={courseMeta.category}
                             onChange={e => setCourseMeta({ ...courseMeta, category: e.target.value })}
                             className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-slate-900"
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
                           <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Difficulty</label>
                           <select
                             value={courseMeta.difficulty}
                             onChange={e => setCourseMeta({ ...courseMeta, difficulty: e.target.value })}
                             className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:border-slate-900"
                           >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                           </select>
                        </div>

                        <div>
                           <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Duration</label>
                           <input
                             type="text"
                             placeholder="e.g. 45 mins"
                             value={courseMeta.duration}
                             onChange={e => setCourseMeta({ ...courseMeta, duration: e.target.value })}
                             className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-slate-900"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Course Description</label>
                        <textarea
                          rows={2}
                          placeholder="Brief summary of what trainees will learn..."
                          value={courseMeta.description}
                          onChange={e => setCourseMeta({ ...courseMeta, description: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-700 outline-none focus:border-slate-900"
                        />
                     </div>

                     {/* Target Audience Checkboxes */}
                     <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Target Audience (Available Roles)</label>
                        <div className="flex flex-wrap gap-2">
                           {ROLES_LIST.map(role => {
                             const isChecked = courseMeta.target_roles.includes(role);
                             return (
                                <button
                                  key={role}
                                  type="button"
                                  onClick={() => toggleRole(role)}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                                     isChecked
                                     ? 'bg-yellow-500 border-yellow-500 text-slate-950 shadow-xs'
                                     : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                                  }`}
                                >
                                   {isChecked ? '✓ ' : '+ '} {role}
                                </button>
                             );
                           })}
                        </div>
                     </div>
                  </div>

                  {/* Steps Builder Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-5">
                     <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                           <Layers size={14} className="text-yellow-600" /> 2. Course Steps & Curriculum
                        </h3>
                        <div className="flex items-center gap-2">
                           <button type="button" onClick={() => addStep('video')} className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-wider border border-slate-200 flex items-center gap-1 cursor-pointer">
                              <Video size={12} /> + Video
                           </button>
                           <button type="button" onClick={() => addStep('flashcards')} className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-wider border border-slate-200 flex items-center gap-1 cursor-pointer">
                              <Layers size={12} /> + Flashcards
                           </button>
                           <button type="button" onClick={() => addStep('quiz')} className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-[9px] font-black uppercase tracking-wider border border-slate-200 flex items-center gap-1 cursor-pointer">
                              <HelpCircle size={12} /> + Assessment
                           </button>
                        </div>
                     </div>

                     <div className="space-y-4">
                        {steps.map((step, sIdx) => (
                           <div key={step.id} className="bg-white border-2 border-slate-200 rounded-2xl p-5 relative space-y-3 shadow-3xs">
                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2.5">
                                    <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-xs">
                                       {sIdx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={step.title}
                                      onChange={e => updateStep(sIdx, 'title', e.target.value)}
                                      className="bg-transparent text-xs font-black text-slate-900 uppercase tracking-tight outline-none border-b border-dashed border-slate-300 focus:border-slate-900 pb-0.5 w-56"
                                    />
                                    <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-[8px] font-black uppercase tracking-widest">
                                       {step.type.toUpperCase()}
                                    </span>
                                 </div>
                                 <button type="button" onClick={() => removeStep(sIdx)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer">
                                    <Trash2 size={14} />
                                 </button>
                              </div>

                              {/* VIDEO */}
                              {step.type === 'video' && (
                                 <div className="space-y-3 pt-1">
                                    <input
                                      type="text"
                                      placeholder="Video URL (YouTube link)"
                                      value={step.videoUrl || ''}
                                      onChange={e => updateStep(sIdx, 'videoUrl', e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                                    />
                                    <textarea
                                      rows={2}
                                      placeholder="Video instructions..."
                                      value={step.description || ''}
                                      onChange={e => updateStep(sIdx, 'description', e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-medium text-slate-700"
                                    />
                                 </div>
                              )}

                              {/* FLASHCARDS */}
                              {step.type === 'flashcards' && (
                                 <div className="space-y-3 pt-1">
                                    <div className="flex items-center justify-between">
                                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Flashcards</span>
                                       <button type="button" onClick={() => addFlashcard(sIdx)} className="text-[9px] font-black text-yellow-700 hover:text-yellow-800 uppercase cursor-pointer">
                                          + Add Card
                                       </button>
                                    </div>
                                    <div className="space-y-2">
                                       {step.cards.map((card, cIdx) => (
                                          <div key={card.id || cIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 relative">
                                             <input
                                               type="text" placeholder="Front (Term)"
                                               value={card.term}
                                               onChange={e => updateFlashcard(sIdx, cIdx, 'term', e.target.value)}
                                               className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                                             />
                                             <div className="relative">
                                                <input
                                                  type="text" placeholder="Back (Definition)"
                                                  value={card.definition}
                                                  onChange={e => updateFlashcard(sIdx, cIdx, 'definition', e.target.value)}
                                                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold"
                                                />
                                                {step.cards.length > 1 && (
                                                   <button type="button" onClick={() => removeFlashcard(sIdx, cIdx)} className="absolute -top-2 -right-2 w-5 h-5 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center cursor-pointer">
                                                      <Trash2 size={10} />
                                                   </button>
                                                )}
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}

                              {/* QUIZ */}
                              {step.type === 'quiz' && (
                                 <div className="space-y-3 pt-1">
                                    <div className="flex items-center justify-between">
                                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assessment Questions (1 Correct + 3 Wrong)</span>
                                       <button type="button" onClick={() => addQuizQuestion(sIdx)} className="text-[9px] font-black text-yellow-700 hover:text-yellow-800 uppercase cursor-pointer">
                                          + Add Question
                                       </button>
                                    </div>
                                    <div className="space-y-3">
                                       {step.questions.map((q, qIdx) => (
                                          <div key={q.id || qIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                                             <div className="flex items-center justify-between">
                                                <span className="text-[8px] font-black text-slate-400 uppercase">Q{qIdx + 1}</span>
                                                {step.questions.length > 1 && (
                                                   <button type="button" onClick={() => removeQuizQuestion(sIdx, qIdx)} className="text-slate-300 hover:text-rose-600 cursor-pointer">
                                                      <Trash2 size={12} />
                                                   </button>
                                                )}
                                             </div>
                                             <input
                                               type="text" placeholder="Question statement..."
                                               value={q.question}
                                               onChange={e => updateQuizQuestion(sIdx, qIdx, 'question', e.target.value)}
                                               className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-black"
                                             />
                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <input
                                                  type="text" placeholder="✓ Correct Answer"
                                                  value={q.correctAnswer}
                                                  onChange={e => updateQuizQuestion(sIdx, qIdx, 'correctAnswer', e.target.value)}
                                                  className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-900"
                                                />
                                                <input
                                                  type="text" placeholder="✗ Wrong Answer 1"
                                                  value={q.incorrect1}
                                                  onChange={e => updateQuizQuestion(sIdx, qIdx, 'incorrect1', e.target.value)}
                                                  className="bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-900"
                                                />
                                                <input
                                                  type="text" placeholder="✗ Wrong Answer 2"
                                                  value={q.incorrect2}
                                                  onChange={e => updateQuizQuestion(sIdx, qIdx, 'incorrect2', e.target.value)}
                                                  className="bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-900"
                                                />
                                                <input
                                                  type="text" placeholder="✗ Wrong Answer 3"
                                                  value={q.incorrect3}
                                                  onChange={e => updateQuizQuestion(sIdx, qIdx, 'incorrect3', e.target.value)}
                                                  className="bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-900"
                                                />
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

                  {/* Modal Footer */}
                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                     <button
                       type="button"
                       onClick={() => setIsModalOpen(false)}
                       className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                     >
                        Cancel
                     </button>
                     <button
                       type="submit"
                       disabled={isSaving}
                       className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                     >
                        {isSaving ? 'Saving...' : (editingCourseId ? 'Update Masterclass' : 'Publish Masterclass')}
                     </button>
                  </div>
               </form>

            </div>
         </div>
      )}

    </div>
  );
}
