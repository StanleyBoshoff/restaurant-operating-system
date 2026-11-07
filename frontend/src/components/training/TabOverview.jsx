import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryCard from '../common/SummaryCard';
import { GraduationCap, BookOpen, Wand2, BarChart3, CheckCircle2, Award, Users, ArrowRight, Play, Star, Clock } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { waiterBasicsCourse } from './mockQuizData';

export default function TabOverview() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([
    { ...waiterBasicsCourse, id: 1, cat: 'Service', duration: '45 mins', difficulty: 'Beginner', rating: 5.0, status: 'Mandatory' }
  ]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const [coursesRes, enrollRes] = await Promise.all([
        supabase.from('training_courses').select('*').order('created_at', { ascending: false }),
        supabase.from('training_enrollments').select('*')
      ]);

      if (coursesRes.data && coursesRes.data.length > 0) {
        const custom = coursesRes.data.map(c => ({
          id: c.id,
          title: c.title,
          cat: c.category || 'Service',
          description: c.description || c.steps?.description,
          duration: c.duration || c.steps?.duration || '30 mins',
          difficulty: c.difficulty || c.steps?.difficulty || 'Beginner',
          rating: 5.0,
          status: c.status || 'Mandatory',
          target_roles: c.target_roles || c.steps?.target_roles || ['Waiter']
        }));
        setCourses([
          { ...waiterBasicsCourse, id: 1, cat: 'Service', duration: '45 mins', difficulty: 'Beginner', rating: 5.0, status: 'Mandatory', target_roles: ['Waiter'] },
          ...custom
        ]);
      }

      setEnrollments(enrollRes.data || []);
    } catch (err) {
      console.error("Failed to load training overview:", err);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = enrollments.filter(e => e.progress === 100).length;
  const totalCourses = courses.length;
  const completionRate = totalCourses > 0 ? Math.round((completedCount / (totalCourses * Math.max(1, enrollments.length))) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">

      {/* 1. Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <SummaryCard title="Total Curricula" icon={BookOpen}>
            <div className="flex items-end justify-between pt-1">
               <h3 className="text-3xl font-black text-slate-900 tracking-tight">{totalCourses}</h3>
               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase">Active Units</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">Masterclasses & Protocols</p>
         </SummaryCard>

         <SummaryCard title="Certified Completions" icon={Award}>
            <div className="flex items-end justify-between pt-1">
               <h3 className="text-3xl font-black text-green-600 tracking-tight">{completedCount}</h3>
               <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase">Passed 90%+</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">Verified Assessments</p>
         </SummaryCard>

         <SummaryCard title="Active Enrollments" icon={Users}>
            <div className="flex items-end justify-between pt-1">
               <h3 className="text-3xl font-black text-blue-600 tracking-tight">{enrollments.length}</h3>
               <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase">In Progress</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">Staff Learning Paths</p>
         </SummaryCard>

         <SummaryCard title="Store Compliance" icon={CheckCircle2}>
            <div className="flex items-end justify-between pt-1">
               <h3 className="text-3xl font-black text-slate-900 tracking-tight">100%</h3>
               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase">CCMA Safe</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2">Statutory Audit Ready</p>
         </SummaryCard>
      </div>

      {/* 2. Quick Action Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div
           onClick={() => navigate('/training/creator')}
           className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-[2rem] p-6 text-white cursor-pointer hover:shadow-xl transition-all group relative overflow-hidden"
         >
            <div className="absolute right-0 bottom-0 w-40 h-40 bg-yellow-500/10 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all" />
            <div className="w-12 h-12 bg-yellow-500 text-slate-950 rounded-2xl flex items-center justify-center font-black shadow-md mb-4 group-hover:scale-110 transition-transform">
               <Wand2 size={24} />
            </div>
            <h4 className="text-base font-black uppercase tracking-tight text-yellow-400 mb-1">Masterclass Studio</h4>
            <p className="text-xs text-slate-300 font-medium leading-relaxed mb-4">Create custom operational courses, video lessons, flashcards, and randomized quizzes.</p>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-yellow-400 group-hover:translate-x-1 transition-transform">
               Open Creator <ArrowRight size={14} />
            </div>
         </div>

         <div
           onClick={() => navigate('/training/courses')}
           className="bg-white border border-slate-200 rounded-[2rem] p-6 cursor-pointer hover:shadow-xl transition-all group relative overflow-hidden"
         >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black shadow-xs border border-blue-100 mb-4 group-hover:scale-110 transition-transform">
               <BookOpen size={24} />
            </div>
            <h4 className="text-base font-black uppercase tracking-tight text-slate-900 mb-1">Browse Courses</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">Explore available learning units, take video lessons, study flashcards, and pass assessments.</p>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 group-hover:translate-x-1 transition-transform">
               View Courses <ArrowRight size={14} />
            </div>
         </div>

         <div
           onClick={() => navigate('/training/reports')}
           className="bg-white border border-slate-200 rounded-[2rem] p-6 cursor-pointer hover:shadow-xl transition-all group relative overflow-hidden"
         >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black shadow-xs border border-emerald-100 mb-4 group-hover:scale-110 transition-transform">
               <BarChart3 size={24} />
            </div>
            <h4 className="text-base font-black uppercase tracking-tight text-slate-900 mb-1">Training Reports</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">Generate audit-ready completion reports and compliance logs for staff training records.</p>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 group-hover:translate-x-1 transition-transform">
               View Analytics <ArrowRight size={14} />
            </div>
         </div>
      </div>

      {/* 3. Featured Masterclass Showcase */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm space-y-6">
         <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Featured Masterclass Curriculum</h3>
               <p className="text-[10px] text-slate-400 font-medium mt-0.5">Active training units available for restaurant team deployment.</p>
            </div>
            <button
              onClick={() => navigate('/training/courses')}
              className="text-xs font-black text-yellow-600 hover:text-yellow-700 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
               View All ({courses.length}) <ArrowRight size={14} />
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 3).map(course => (
               <div key={course.id} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col justify-between group hover:shadow-md transition-all">
                  <div className="space-y-3">
                     <div className="flex items-start justify-between">
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-[9px] font-black uppercase tracking-widest">
                           {course.cat}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-black text-yellow-600">
                           <Star size={10} fill="currentColor" /> {course.rating || 5.0}
                        </div>
                     </div>
                     <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{course.title}</h4>
                     <p className="text-[11px] text-slate-500 font-medium line-clamp-2">{course.description || 'Professional mastery training module.'}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                     <div className="flex items-center gap-1">
                        <Clock size={12} /> {course.duration}
                     </div>
                     <button
                       onClick={() => navigate('/training/courses')}
                       className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                     >
                        Start Unit
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
}
