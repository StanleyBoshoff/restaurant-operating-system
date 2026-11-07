import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { BookOpen, Clock, Award, Star, Play, CheckCircle, GraduationCap } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import CoursePlayer from '../training/CoursePlayer';
import { waiterBasicsCourse } from '../training/mockQuizData';

export default function TabPerformanceTraining({ employee }) {
  const [coursesList, setCoursesList] = useState([]);
  const [courseProgress, setCourseProgress] = useState(() => {
    try {
      const saved = localStorage.getItem('rems_training_progress');
      return saved ? JSON.parse(saved) : { 1: 0 };
    } catch (e) {
      return { 1: 0 };
    }
  });
  const [activeCourse, setActiveCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoursesAndEnrollments();
  }, [employee]);

  const fetchCoursesAndEnrollments = async () => {
    setLoading(true);
    try {
      // 1. Fetch custom masterclass courses
      const { data: coursesData } = await supabase.from('training_courses').select('*');
      let custom = [];
      if (coursesData && coursesData.length > 0) {
        custom = coursesData.map((c) => {
          const s = c.steps || {};
          return {
            id: c.id,
            title: c.title,
            cat: c.category || 'Service',
            description: s.description || c.description,
            duration: s.duration || s.duration || '30 mins',
            difficulty: s.difficulty || s.difficulty || 'Beginner',
            rating: 5.0,
            status: c.status || 'Mandatory',
            progress: courseProgress[c.id] || 0,
            youtubeId: s.youtubeId || c.youtubeId || 'dQw4w9WgXcQ',
            flashcards: s.flashcards || s.flashcards || [],
            quiz: s.quiz || s.quiz || { questions: [] },
            stepsList: s.stepsList || s.steps || [],
            target_roles: s.target_roles || c.target_roles || ['Waiter', 'General Staff']
          };
        });
      }

      // 2. Fetch employee enrollments / progress
      const { data: enrollData } = await supabase.from('training_enrollments').select('*');
      const progMap = { ...courseProgress };
      if (enrollData && enrollData.length > 0) {
        enrollData.forEach(en => {
          if (en.course_id) {
            progMap[en.course_id] = en.progress || 0;
          }
        });
        setCourseProgress(progMap);
      }

      const allCourses = [
        {
          ...waiterBasicsCourse,
          id: 1,
          cat: 'Service',
          duration: '45 mins',
          difficulty: 'Beginner',
          rating: 5.0,
          status: 'Mandatory',
          progress: progMap[1] || 0,
          target_roles: ['Waiter', 'General Staff']
        },
        ...custom
      ];

      // 3. Filter courses matching employee role or general staff
      const empRole = (employee?.role || '').toLowerCase();
      const filtered = allCourses.filter(c => {
        const roles = (c.target_roles || []).map(r => r.toLowerCase());
        if (roles.length === 0) return true;
        if (roles.includes('general staff') || roles.includes('all staff')) return true;
        return roles.some(r => empRole.includes(r) || r.includes(empRole));
      });

      setCoursesList(filtered);
    } catch (err) {
      console.error("Failed to load employee training courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = async (courseId, newProgress) => {
    const updatedProgress = Math.max(courseProgress[courseId] || 0, newProgress);
    const newMap = {
      ...courseProgress,
      [courseId]: updatedProgress
    };
    setCourseProgress(newMap);
    localStorage.setItem('rems_training_progress', JSON.stringify(newMap));

    try {
      const status = updatedProgress === 100 ? 'Completed' : 'In Progress';
      const { data: existing } = await supabase
        .from('training_enrollments')
        .select('id')
        .eq('course_id', courseId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('training_enrollments')
          .update({ progress: updatedProgress, status })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('training_enrollments')
          .insert([{ course_id: courseId, progress: updatedProgress, status }]);
      }
    } catch (err) {
      console.error("Failed to sync enrollment progress:", err);
    }
  };

  if (loading) {
    return <div className="py-12 text-center italic text-slate-400 text-xs">Loading employee training curriculum...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
         <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Assigned Training & Certifications</h3>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
               Curriculum automatically filtered for <span className="font-bold text-slate-900">{employee?.role || 'Staff Member'}</span>.
            </p>
         </div>
      </div>

      {coursesList.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs italic">
           No active training courses assigned for this role yet. Configure target roles in the Masterclass Studio.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {coursesList.map(course => {
              const currentProgress = courseProgress[course.id] || 0;
              return (
                 <div key={course.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                    <div className="h-28 bg-slate-900 relative p-4 flex flex-col justify-end">
                       <div className="absolute top-3 left-3">
                          <StatusBadge status={course.status} />
                       </div>
                       <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-black text-yellow-500">
                          <Star size={10} fill="currentColor" /> {course.rating || 5.0}
                       </div>
                       <h3 className="text-white font-black text-xs leading-tight group-hover:text-yellow-500 transition-colors uppercase tracking-tight">{course.title}</h3>
                    </div>

                    <div className="p-4 flex-1 space-y-4">
                       <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <div className="flex items-center gap-1">
                             <Clock size={12} /> {course.duration}
                          </div>
                          <div className="flex items-center gap-1">
                             <Award size={12} /> {course.difficulty}
                          </div>
                       </div>

                       <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter">
                             <span className="text-slate-500 text-[8px] tracking-[0.1em]">PROGRESS</span>
                             <span className="text-slate-900">{currentProgress}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                             <div
                               className={`h-full transition-all duration-700 ${currentProgress === 100 ? 'bg-green-500' : 'bg-yellow-600'}`}
                               style={{ width: `${currentProgress}%` }}
                             />
                          </div>
                       </div>

                       <button
                         onClick={() => setActiveCourse(course)}
                         className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-[0.97] cursor-pointer ${
                            currentProgress === 100
                            ? 'bg-green-50 text-green-700 border border-green-100 shadow-3xs'
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                         }`}
                       >
                          {currentProgress === 100 ? (
                             <>
                                <CheckCircle size={14} className="text-green-600" />
                                Certified Complete
                             </>
                          ) : (
                             <>
                                <Play size={14} />
                                {currentProgress > 0 ? 'Resume Course' : 'Start Course'}
                             </>
                          )}
                       </button>
                    </div>

                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{course.cat} Unit</span>
                       <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Employee Profile</span>
                    </div>
                 </div>
              );
           })}
        </div>
      )}

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
