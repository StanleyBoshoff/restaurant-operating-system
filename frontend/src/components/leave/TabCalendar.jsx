import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { getSaHolidaysForYear } from '../../utils/saHolidayEngine';
import SummaryCard from '../common/SummaryCard';
import StatusBadge from '../common/StatusBadge';
import { Calendar as CalendarIcon, User, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TabCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 🗓️ Calendar Math Helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchAndAssembleCalendar = async () => {
    try {
      setLoading(true);

      // 1. South African holidays
      const computedHolidays = getSaHolidaysForYear(currentYear).map(holiday => ({
        id: `statutory-${holiday.date}`,
        title: holiday.name,
        event_type: 'Public Holiday',
        start_date: holiday.date,
        end_date: holiday.date
      }));

      // 2. Custom operational events
      const { data: dbEvents } = await supabase
        .from('calendar_events')
        .select('*');

      // 3. Approved leave
      const { data: leaveSpans } = await supabase
        .from('employee_leave')
        .select(`id, leave_type, start_date, end_date, employees(first_name, last_name, department)`)
        .eq('status', 'Approved');

      const formattedLeave = (leaveSpans || []).map(item => ({
        id: item.id,
        title: `${item.employees?.first_name || 'Staff'} - ${item.leave_type}`,
        event_type: 'Leave Block',
        start_date: item.start_date,
        end_date: item.end_date,
        employee_data: item.employees
      }));

      const masterFeed = [
        ...computedHolidays,
        ...(dbEvents || []),
        ...formattedLeave
      ];

      setAllEvents(masterFeed);
    } catch (err) {
      console.error('Operational runtime calendar error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndAssembleCalendar();
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const getEventsForDay = (dayNumber) => {
    const paddedDay = dayNumber < 10 ? `0${dayNumber}` : dayNumber;
    const paddedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : currentMonth + 1;
    const targetDateStr = `${currentYear}-${paddedMonth}-${paddedDay}`;

    return allEvents.filter(event =>
      targetDateStr === event.start_date ||
      (targetDateStr >= event.start_date && targetDateStr <= event.end_date)
    );
  };

  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];
  const isTodayMatch = (day) => {
    const paddedDay = day < 10 ? `0${day}` : day;
    const paddedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : currentMonth + 1;
    return `${currentYear}-${paddedMonth}-${paddedDay}` === todayISO;
  };

  // Currently Away (Today)
  const currentlyAway = allEvents
    .filter(ev => ev.event_type === 'Leave Block' && todayISO >= ev.start_date && todayISO <= ev.end_date)
    .map(ev => ({ id: ev.id, ...ev.employee_data, leave_type: ev.title.split(' - ')[1], end_date: ev.end_date }));

  // Upcoming Leave (Future)
  const upcoming = allEvents
    .filter(ev => ev.event_type === 'Leave Block' && ev.start_date > todayISO)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .map(ev => ({ id: ev.id, ...ev.employee_data, leave_type: ev.title.split(' - ')[1], start_date: ev.start_date }));

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(<div key={`blank-${i}`} className="bg-slate-50/40 border border-slate-100 min-h-[90px] rounded-lg"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDay(day);
    const isToday = isTodayMatch(day);

    calendarCells.push(
      <div
        key={`day-${day}`}
        className={`p-1.5 min-h-[90px] rounded-lg flex flex-col hover:border-slate-400 transition-all group border ${
          isToday ? 'border-yellow-600 border-2 bg-yellow-50/20 shadow-xs' : 'bg-white border-slate-200'
        }`}
      >
        <span className={`font-bold text-[10px] mb-1 ${isToday ? 'text-yellow-700' : 'text-slate-400'}`}>{day}</span>
        <div className="space-y-1 overflow-y-auto no-scrollbar flex-1">
          {dayEvents.map(ev => {
            const colors = ev.event_type === 'Public Holiday' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          ev.event_type === 'Leave Block' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200';
            return (
              <div key={ev.id} className={`px-1 py-0.5 rounded border-l-2 truncate font-bold text-[8px] uppercase tracking-tighter ${colors}`}>
                {ev.title}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* Main Calendar Grid */}
        <div className="lg:col-span-3">
          <SummaryCard
            title={`${monthNames[currentMonth]} ${currentYear}`}
            icon={CalendarIcon}
            badge={
              <div className="flex space-x-1">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-md transition-colors cursor-pointer text-slate-500"><ChevronLeft size={16} /></button>
                <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-md transition-colors cursor-pointer text-slate-500"><ChevronRight size={16} /></button>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 text-[9px] uppercase tracking-widest">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>
              {loading ? (
                <div className="text-center p-12 text-slate-400 italic animate-pulse text-xs">Syncing calendar matrix...</div>
              ) : (
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarCells}
                </div>
              )}
            </div>
          </SummaryCard>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <SummaryCard title="Currently Away" icon={User} badge={<span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[9px] font-bold">{currentlyAway.length} STAFF</span>}>
            <div className="space-y-2">
              {currentlyAway.length === 0 ? (
                <p className="py-4 text-center text-slate-400 italic text-[10px]">No staff on leave today.</p>
              ) : (
                currentlyAway.map(staff => (
                  <div key={staff.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-[11px] truncate">{staff.first_name} {staff.last_name}</p>
                      <p className="text-[9px] text-slate-400 font-medium uppercase">{staff.department}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <StatusBadge status={staff.leave_type} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </SummaryCard>

          <SummaryCard title="Upcoming Leave" icon={Users} badge={<span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[9px] font-bold">{upcoming.length} PLANNED</span>}>
            <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
              {upcoming.length === 0 ? (
                <p className="py-4 text-center text-slate-400 italic text-[10px]">No upcoming leave scheduled.</p>
              ) : (
                upcoming.map(staff => (
                  <div key={staff.id} className="p-2.5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-slate-900 text-[11px]">{staff.first_name} {staff.last_name}</p>
                      <span className="text-[9px] font-bold text-slate-400">{new Date(staff.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] text-slate-500 font-medium uppercase">{staff.department}</p>
                      <span className="text-[9px] font-bold text-yellow-600">{staff.leave_type}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SummaryCard>
        </div>
      </div>
    </div>
  );
}
