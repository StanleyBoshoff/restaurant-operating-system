import React, { useState } from 'react';
import SummaryCard from '../common/SummaryCard';
import { BookOpen, Clock, Award, Star, Search, Play, CheckCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CoursePlayer from './CoursePlayer';
import { waiterBasicsCourse } from './mockQuizData';

export default function TabCourses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [activeCourse, setActiveCourse] = useState(null);

  // Manage course progress locally for now
  const [courseProgress, setCourseProgress] = useState({
    1: 0 // Waiter Basics ID
  });

  const COURSES = [
    {
      ...waiterBasicsCourse,
      id: 1,
      cat: 'Service',
      duration: '45 mins',
      difficulty: 'Beginner',
      rating: 5.0,
      status: 'Mandatory',
      progress: courseProgress[1] || 0
    }
  ];

  const categories = ['All', ...new Set(COURSES.map(c => c.cat))];

  const filtered = COURSES.filter(c =>
    (selectedCat === 'All' || c.cat === selectedCat) &&
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProgressUpdate = (courseId, newProgress) => {
    setCourseProgress(prev => ({
      ...prev,
      [courseId]: Math.max(prev[courseId] || 0, newProgress)
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* Filtering Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                selectedCat === cat
                ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search curriculum..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-yellow-500/20 shadow-3xs"
          />
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(course => (
          <div key={course.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="h-32 bg-slate-900 relative p-4 flex flex-col justify-end">
               <div className="absolute top-4 left-4">
                 <StatusBadge status={course.status} />
               </div>
               <div className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-black text-yellow-500">
                 <Star size={10} fill="currentColor" />
                 {course.rating}
               </div>
               <h3 className="text-white font-black text-sm leading-tight group-hover:text-yellow-500 transition-colors uppercase tracking-tight">{course.title}</h3>
            </div>

            <div className="p-4 flex-1 space-y-4">
               <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {course.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Award size={12} />
                    {course.difficulty}
                  </div>
               </div>

               <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
                    <span className="text-slate-500 text-[8px] tracking-[0.1em]">PROGRESS</span>
                    <span className="text-slate-900">{course.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 ${course.progress === 100 ? 'bg-green-500' : 'bg-yellow-600'}`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
               </div>

               <button
                onClick={() => setActiveCourse(course)}
                className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-[0.97] ${
                 course.progress === 100
                 ? 'bg-green-50 text-green-700 border border-green-100 shadow-3xs'
                 : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
               }`}>
                 {course.progress === 100 ? (
                   <>
                     <CheckCircle size={14} className="text-green-600" />
                     Certified Complete
                   </>
                 ) : (
                   <>
                     <Play size={14} />
                     {course.progress > 0 ? 'Resume Course' : 'Start Course'}
                   </>
                 )}
               </button>
            </div>

            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{course.cat} Unit</span>
               <button className="text-[9px] font-black text-slate-900 uppercase tracking-widest hover:text-yellow-600 transition-colors">Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <SummaryCard title="Curriculum Insights" icon={BookOpen}>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-2">
            <div>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Active Enrollments</p>
               <h4 className="text-2xl font-black text-slate-900">{COURSES.length}</h4>
            </div>
            <div>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Completed Units</p>
               <h4 className="text-2xl font-black text-green-600">
                 {COURSES.filter(c => c.progress === 100).length}
               </h4>
            </div>
            <div>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Mandatory Overdue</p>
               <h4 className="text-2xl font-black text-rose-600">0</h4>
            </div>
            <div>
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Training Hours</p>
               <h4 className="text-2xl font-black text-slate-900">0h</h4>
            </div>
         </div>
      </SummaryCard>

      {activeCourse && (
        <CoursePlayer
          course={activeCourse}
          onClose={() => setActiveCourse(null)}
          onProgressUpdate={(percentage) => handleProgressUpdate(activeCourse.id, percentage)}
        />
      )}
    </div>
  );
}
