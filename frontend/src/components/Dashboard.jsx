import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getSaHolidaysForYear } from '../utils/saHolidayEngine';

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState([]);
  const [sidebarAgenda, setSidebarAgenda] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11

  // 🗓️ Calendar Math Helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchAndAssembleCalendar = async () => {
    try {
      setLoading(true);

      // 1. Calculate automated South African holidays for the active year context
      const computedHolidays = getSaHolidaysForYear(currentYear).map(holiday => ({
        id: `statutory-${holiday.date}`,
        title: holiday.name,
        event_type: 'Public Holiday',
        start_date: holiday.date,
        end_date: holiday.date
      }));

      // 2. Fetch custom operational closure rows from Supabase
      const { data: dbEvents } = await supabase
        .from('calendar_events')
        .select('*');

      // 3. Fetch approved employee leave blocks from database
      const { data: leaveSpans } = await supabase
        .from('employee_leave')
        .select(`id, leave_type, start_date, end_date, employees(first_name, last_name)`)
        .eq('status', 'Approved');

      const formattedLeave = (leaveSpans || []).map(item => ({
        id: item.id,
        title: `${item.employees?.first_name || 'Staff'} - ${item.leave_type}`,
        event_type: 'Leave Block',
        start_date: item.start_date,
        end_date: item.end_date
      }));

      // 4. Combine all sources together
      const masterFeed = [
        ...computedHolidays,
        ...(dbEvents || []),
        ...formattedLeave
      ];

      setAllEvents(masterFeed);

      // 5. Build Sidebar Agenda: Filter for upcoming items spanning the next 30 calendar days
      const todayStr = new Date().toISOString().split('T')[0];
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      const thirtyDaysLaterStr = thirtyDaysLater.toISOString().split('T')[0];

      const activeSidebarItems = masterFeed
        .filter(item => item.end_date >= todayStr && item.start_date <= thirtyDaysLaterStr)
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

      setSidebarAgenda(activeSidebarItems);
    } catch (err) {
      console.error('Operational runtime calendar error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchAndAssembleCalendar();
}, [currentDate]); // Triggered instantly whenever next/prev month buttons are clicked

  // Navigation functions for calendar controls
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

 const getEventsForDay = (dayNumber) => {
  const paddedDay = dayNumber < 10 ? `0${dayNumber}` : dayNumber;
  const paddedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : currentMonth + 1;
  const targetDateStr = `${currentYear}-${paddedMonth}-${paddedDay}`;

  return allEvents.filter(event => 
    targetDateStr === event.start_date || 
    (targetDateStr >= event.start_date && targetDateStr <= event.end_date)
  );
};

    // Generate calendar days grid array layout shell
  const calendarCells = [];
  
  // Get today's exact date metrics to check cell matches
  const now = new Date();
  const todayDay = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  // Add empty placeholder blocks for preceding blank month padding spaces
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`blank-${i}`} className="bg-slate-50/40 border border-slate-100 min-h-[85px] rounded-lg"></div>);
  }
  
  // Populate actual active month calendar numbers
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day);
    
    // Check if this specific loop cell matches the actual current calendar day
    const isToday = day === todayDay && currentMonth === todayMonth && currentYear === todayYear;

    calendarCells.push(
      <div 
        key={`day-${day}`} 
        className={`p-1.5 min-h-[85px] rounded-lg flex flex-col justify-between hover:border-slate-400 transition-all group border ${
          isToday 
            ? 'border-yellow-600 border-2 bg-yellow-50/20 shadow-xs ring-1 ring-yellow-600/20' 
            : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex justify-between items-center">
          <span className={`font-bold text-[11px] ${
            isToday ? 'text-yellow-700 bg-yellow-600/10 px-1.5 py-0.5 rounded-sm' : 'text-slate-400 group-hover:text-slate-700'
          }`}>
            {day}
          </span>
          {isToday && <span className="text-[8px] font-bold uppercase tracking-wider text-yellow-700 animate-pulse">Today</span>}
        </div>

        <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[55px] no-scrollbar">
          {dayEvents.map(ev => {
            // Softened, professional color accents
            const labelColor = 
              ev.event_type === 'Public Holiday' ? 'bg-rose-50 text-rose-700 border-rose-200' :
              ev.event_type === 'Leave Block' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-blue-50 text-blue-700 border-blue-200';
              
            return (
              <div key={ev.id} className={`px-1.5 py-0.5 rounded-md border-l-2 truncate font-medium text-[9px] uppercase tracking-tight scale-[0.98] shadow-3xs ${labelColor}`}>
                {ev.title}
              </div>
            );
          })}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 p-4 text-xs">
      {/* Dynamic Dashboard Branding Block */}
      <div>
        <h3 className="text-lg font-bold text-slate-900">Management Command Center</h3>
        <p className="text-slate-500">Real-time automated operations and workforce deployment tracking.</p>
      </div>

      {/* Main Structural Twin Workspace Viewport Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT 3 COLUMNS: The 30-Day Master Interactive Calendar Matrix */}
        <div className="lg:col-span-3 bg-white border border-slate-200 p-4 rounded-xl shadow-2xl space-y-4">
          
          {/* Calendar Header Navigation Row */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{monthNames[currentMonth]} {currentYear}</h4>
            </div>
            <div className="flex space-x-1">
              <button onClick={handlePrevMonth} className="px-2.5 py-1 bg-slate-50 border rounded-md hover:bg-slate-100 font-bold transition-colors cursor-pointer text-slate-600">&larr;</button>
              <button onClick={handleNextMonth} className="px-2.5 py-1 bg-slate-50 border rounded-md hover:bg-slate-100 font-bold transition-colors cursor-pointer text-slate-600">&rarr;</button>
            </div>
          </div>

          {/* Weekday Label Headers Row Block */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-[10px] uppercase tracking-wider">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          {/* Core Calendar Days Visual Grid Block */}
          {loading ? (
            <div className="text-center p-12 text-slate-400 italic animate-pulse">Syncing monthly operations grid matrix...</div>
          ) : (
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells}
            </div>
          )}
        </div>

        {/* RIGHT 1 COLUMN: The Unified Dynamic Sidebar Activity Feed */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
          <div>
  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Operational Agenda</h4>
  <p className="text-slate-400 text-[10px]">Rolling 30-day schedule of public holidays, staff leave, and company events.</p>
</div>

          {loading ? (
            <p className="text-center text-slate-400 italic animate-pulse">Syncing dynamic runtime schedules...</p>
          ) : sidebarAgenda.length === 0 ? (
            <div className="text-center p-8 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              Clean schedule. No team items or holidays logged within next 30 days.
            </div>
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
              {sidebarAgenda.map(item => {
                const badgeStyle = 
                  item.event_type === 'Public Holiday' ? 'bg-red-50 text-red-700 border-red-200' :
                  item.event_type === 'Leave Block' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-blue-50 text-blue-700 border-blue-200';

                return (
                  <div key={`sidebar-${item.id}`} className="p-3 border border-slate-100 rounded-lg flex items-center justify-between gap-4 bg-white hover:bg-slate-50 transition-colors shadow-3xs">
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 block truncate">{item.title}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {item.start_date === item.end_date 
                          ? new Date(item.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
                          : `${new Date(item.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })} - ${new Date(item.end_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}`
                        }
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${badgeStyle}`}>
                      {item.event_type === 'Public Holiday' ? 'Holiday' : item.event_type === 'Leave Block' ? 'Leave' : 'Event'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}