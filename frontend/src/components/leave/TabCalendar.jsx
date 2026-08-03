import React, { useState, useEffect, useMemo } from 'react';
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
        .select(`id, leave_type, start_date, end_date, employees(id, first_name, last_name, department)`)
        .eq('status', 'Approved');

      const formattedLeave = (leaveSpans || []).map(item => ({
        id: item.id,
        employee_id: item.employees?.id,
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

  // 🏎️ Lane Assignment Engine
  // Ensures that continuous leave bars stay in the same vertical slot
  const eventToLaneMap = useMemo(() => {
    const lanes = [];

    // Sort events by start date, then duration (longest first to stabilize lanes)
    const sortedEvents = [...allEvents].sort((a, b) => {
      const startDiff = new Date(a.start_date) - new Date(b.start_date);
      if (startDiff !== 0) return startDiff;
      const aDur = new Date(a.end_date) - new Date(a.start_date);
      const bDur = new Date(b.end_date) - new Date(b.start_date);
      return bDur - aDur;
    });

    const mapping = {};

    sortedEvents.forEach(event => {
      let assignedLane = -1;

      // Try to find the first lane where this event fits without overlap
      for (let i = 0; i < lanes.length; i++) {
        const laneEvents = lanes[i];
        const hasOverlap = laneEvents.some(existing =>
          (event.start_date <= existing.end_date && event.end_date >= existing.start_date)
        );

        if (!hasOverlap) {
          assignedLane = i;
          lanes[i].push(event);
          break;
        }
      }

      if (assignedLane === -1) {
        assignedLane = lanes.length;
        lanes.push([event]);
      }

      mapping[event.id] = assignedLane;
    });

    return { mapping, maxLane: lanes.length - 1 };
  }, [allEvents]);

  const getEventsForDay = (dayNumber) => {
    const paddedDay = dayNumber < 10 ? `0${dayNumber}` : dayNumber;
    const paddedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : currentMonth + 1;
    const targetDateStr = `${currentYear}-${paddedMonth}-${paddedDay}`;

    const dayEvents = allEvents.filter(event =>
      targetDateStr >= event.start_date && targetDateStr <= event.end_date
    );

    // Build an array of events by lane for this specific day
    const lanesForDay = [];
    for (let i = 0; i <= eventToLaneMap.maxLane; i++) {
      const ev = dayEvents.find(e => eventToLaneMap.mapping[e.id] === i);
      lanesForDay.push(ev || null);
    }
    return lanesForDay;
  };

  const now = new Date();
  const todayISO = now.toISOString().split('T')[0];

  // Currently Away (Today)
  const currentlyAway = allEvents
    .filter(ev => ev.event_type === 'Leave Block' && todayISO >= ev.start_date && todayISO <= ev.end_date)
    .map(ev => ({
      id: ev.id,
      ...ev.employee_data,
      leave_type: ev.title.split(' - ')[1],
      start_date: ev.start_date,
      end_date: ev.end_date
    }));

  // Upcoming Leave (Future)
  const upcoming = allEvents
    .filter(ev => ev.event_type === 'Leave Block' && ev.start_date > todayISO)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .map(ev => ({
      id: ev.id,
      ...ev.employee_data,
      leave_type: ev.title.split(' - ')[1],
      start_date: ev.start_date,
      end_date: ev.end_date
    }));

  const calendarCells = [];
  // Adjust starting cell index for the grid
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(
      <div key={`blank-${i}`} className="bg-slate-50/20 border-r border-b border-slate-100 min-h-[100px]"></div>
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const paddedDay = day < 10 ? `0${day}` : day;
    const paddedMonth = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : currentMonth + 1;
    const dateStr = `${currentYear}-${paddedMonth}-${paddedDay}`;
    const dayEvents = getEventsForDay(day);
    const isToday = dateStr === todayISO;

    calendarCells.push(
      <div
        key={`day-${day}`}
        className={`relative min-h-[100px] flex flex-col group border-r border-b border-slate-100 transition-all ${
          isToday ? 'bg-yellow-50/30' : 'bg-white'
        }`}
      >
        <span className={`p-2 font-black text-[10px] ${isToday ? 'text-yellow-600' : 'text-slate-300'}`}>
          {day}
        </span>

        <div className="flex-1 px-0 pb-1 space-y-0.5 overflow-hidden">
          {dayEvents.map((ev, idx) => {
            if (!ev) return <div key={`empty-${idx}`} className="h-5"></div>;

            const isStart = dateStr === ev.start_date;
            const isEnd = dateStr === ev.end_date;

            const colors = ev.event_type === 'Public Holiday' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                          ev.event_type === 'Leave Block' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-700 border-blue-200';

            return (
              <div
                key={ev.id}
                className={`
                  h-5 flex items-center px-1.5 text-[8px] font-black uppercase tracking-tight border-y truncate
                  ${colors}
                  ${isStart ? 'rounded-l-md ml-1 border-l' : 'border-l-0'}
                  ${isEnd ? 'rounded-r-md mr-1 border-r' : 'border-r-0'}
                `}
              >
                {isStart || dateStr.endsWith('-01') || firstDayIndex === new Date(dateStr).getDay() ? ev.title : ''}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* Main Calendar Grid */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                  <CalendarIcon size={20} />
                </div>
                <div>
                   <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">{monthNames[currentMonth]} {currentYear}</h3>
                   <p className="text-[10px] text-slate-400 font-bold uppercase">Store Availability Matrix</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-200 rounded-lg transition-all text-slate-400 hover:text-slate-900 border border-slate-200 bg-white shadow-3xs active:scale-90"><ChevronLeft size={16} /></button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-slate-200 rounded-lg transition-all text-slate-400 hover:text-slate-900 border border-slate-200 bg-white shadow-3xs active:scale-90"><ChevronRight size={16} /></button>
              </div>
            </div>

            <div className="p-0">
              <div className="grid grid-cols-7 text-center font-black text-slate-400 text-[9px] uppercase tracking-widest bg-slate-50/50 border-b border-slate-100 py-2">
                <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
              </div>
              {loading ? (
                <div className="py-32 text-center text-slate-400 italic animate-pulse text-xs">Reconstructing statutory grid...</div>
              ) : (
                <div className="grid grid-cols-7">
                  {calendarCells}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <SummaryCard title="Currently Away" icon={User} badge={<span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[9px] font-bold">{currentlyAway.length} STAFF</span>}>
            <div className="space-y-2">
              {currentlyAway.length === 0 ? (
                <p className="py-4 text-center text-slate-400 italic text-[10px]">No staff on leave today.</p>
              ) : (
                currentlyAway.map(staff => (
                  <div key={staff.id} className="p-2.5 bg-white border border-slate-100 rounded-xl shadow-3xs hover:border-yellow-600 transition-all flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-slate-900 text-[11px] uppercase tracking-tight">{staff.first_name} {staff.last_name}</p>
                      <StatusBadge status={staff.leave_type} />
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-50 pt-2">
                       <span className="text-[9px] font-black text-rose-600 uppercase">Until {new Date(staff.end_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</span>
                       <span className="text-[8px] font-bold text-slate-400 uppercase">{staff.department}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SummaryCard>

          <SummaryCard title="Upcoming Leave" icon={Users} badge={<span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[9px] font-bold">{upcoming.length} PLANNED</span>}>
            <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
              {upcoming.length === 0 ? (
                <p className="py-4 text-center text-slate-400 italic text-[10px]">No upcoming leave scheduled.</p>
              ) : (
                upcoming.map(staff => (
                  <div key={staff.id} className="p-3 border border-slate-100 bg-white rounded-xl shadow-3xs hover:border-indigo-600 transition-all space-y-2 group">
                    <div className="flex justify-between items-center">
                      <p className="font-black text-slate-900 text-[11px] uppercase tracking-tight group-hover:text-indigo-600">{staff.first_name} {staff.last_name}</p>
                      <span className="text-[8px] font-black text-yellow-600 uppercase bg-yellow-50 px-1.5 py-0.5 rounded">{staff.leave_type}</span>
                    </div>
                    <div className="flex flex-col gap-1 border-t border-slate-50 pt-2">
                      <p className="text-[10px] font-black text-slate-700">
                        {new Date(staff.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })} - {new Date(staff.end_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{staff.department}</p>
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
