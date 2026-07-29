import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { getSaHolidaysForYear } from '../utils/saHolidayEngine';
import EmployeeFollowUpView from './EmployeeFollowUpView';
import SummaryCard from './common/SummaryCard';
import StatusBadge from './common/StatusBadge';
import ModuleWorkspaceHeader from './common/ModuleWorkspaceHeader';
import { LayoutDashboard, Calendar as CalendarIcon, ClipboardList, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

export default function Dashboard({ onNavigateToEmployee }) {
  const [allEvents, setAllEvents] = useState([]);
  const [sidebarAgenda, setSidebarAgenda] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeAlerts, setEmployeeAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  const fetchAndAssembleCalendar = async () => {
    try {
      setLoading(true);
      const currentYear = new Date().getFullYear();

      // 1. Calculate automated South African holidays
      const computedHolidays = getSaHolidaysForYear(currentYear).map(holiday => ({
        id: `statutory-${holiday.date}`,
        title: holiday.name,
        event_type: 'Public Holiday',
        start_date: holiday.date,
        end_date: holiday.date
      }));

      // 2. Fetch custom operational closure rows
      const { data: dbEvents } = await supabase
        .from('calendar_events')
        .select('*');

      // 3. Fetch approved employee leave blocks
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

      // 5. Build Sidebar Agenda: Next 30 days
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
  }, []);

  useEffect(() => {
    const fetchEmployeeAlerts = async () => {
      try {
        setAlertsLoading(true);

        const { data: employeesData, error: employeeError } = await supabase
          .from('employees')
          .select('id, first_name, last_name, role, branch, employee_number, department, employment_type, employment_status, nationality, phone_number, email, start_date, manager_name, probation_status, salary_wage, emergency_contact_name, emergency_contact_number, sa_id_number');

        if (employeeError) throw employeeError;

        const { data: documentsData, error: documentError } = await supabase
          .from('employee_documents')
          .select('employee_id, document_type');

        if (documentError) throw documentError;

        const docsByEmployee = new Map();
        (documentsData || []).forEach((doc) => {
          if (!docsByEmployee.has(doc.employee_id)) {
            docsByEmployee.set(doc.employee_id, []);
          }
          docsByEmployee.get(doc.employee_id).push(doc.document_type);
        });

        const requiredInfoFields = [
          { key: 'employee_number', label: 'employee number' },
          { key: 'department', label: 'department' },
          { key: 'employment_type', label: 'employment type' },
          { key: 'employment_status', label: 'employment status' },
          { key: 'nationality', label: 'nationality' },
          { key: 'phone_number', label: 'phone number' },
          { key: 'email', label: 'email address' },
          { key: 'start_date', label: 'start date' },
          { key: 'manager_name', label: 'manager' },
          { key: 'probation_status', label: 'probation status' },
          { key: 'sa_id_number', label: 'ID or passport number' }
        ];

        const getRequiredDocuments = (employee) => {
          const identityValue = (employee?.sa_id_number || '').trim();
          if (/^\d{13}$/.test(identityValue)) {
            return ['ID Copy', 'Tax Certificate', 'Proof of Address'];
          }
          return ['Passport', 'Work Permit', 'Visa', 'Tax Certificate', 'Proof of Address'];
        };

        const alerts = (employeesData || [])
          .map((employee) => {
            const missingInfo = requiredInfoFields.filter((field) => {
              const value = employee[field.key];
              return value === null || value === undefined || String(value).trim() === '';
            });

            const requiredDocuments = getRequiredDocuments(employee);
            const uploadedDocumentTypes = new Set(docsByEmployee.get(employee.id) || []);
            const missingDocuments = requiredDocuments.filter((docType) => !uploadedDocumentTypes.has(docType));

            if (missingInfo.length === 0 && missingDocuments.length === 0) {
              return null;
            }

            return {
              id: employee.id,
              employee,
              missingInfo: missingInfo.slice(0, 4).map((field) => field.label),
              missingDocuments: missingDocuments.slice(0, 4)
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.missingInfo.length + a.missingDocuments.length - (b.missingInfo.length + b.missingDocuments.length));

        setEmployeeAlerts(alerts);
      } catch (err) {
        console.error('Failed to assemble employee follow-up queue:', err.message);
      } finally {
        setAlertsLoading(false);
      }
    };

    fetchEmployeeAlerts();

    const fetchPendingLeave = async () => {
      const { count } = await supabase
        .from('employee_leave')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending');
      setPendingLeaveCount(count || 0);
    };
    fetchPendingLeave();
  }, []);

  return (
    <div className="space-y-6">
      <ModuleWorkspaceHeader
        title="Management Command Center"
        description="Real-time automated operations and workforce deployment tracking."
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Main Feed: Operational Agenda */}
        <div className="lg:col-span-2 space-y-6">
          <SummaryCard
            title="Operational Agenda"
            icon={ClipboardList}
            badge={<span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{sidebarAgenda.length} UPCOMING</span>}
          >
            <div className="space-y-4">
              <p className="text-slate-400 text-[11px] -mt-1 font-medium">Next 30 days: Public holidays, approved leave, and company events.</p>

              {loading ? (
                <p className="text-center text-slate-400 italic animate-pulse text-xs py-12">Syncing dynamic runtime schedules...</p>
              ) : sidebarAgenda.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-xs">
                  Clean schedule. No team items or holidays logged within next 30 days.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sidebarAgenda.map(item => {
                    const status = item.event_type === 'Public Holiday' ? 'Holiday' : item.event_type === 'Leave Block' ? 'Leave' : 'Event';

                    return (
                      <div key={`agenda-${item.id}`} className="p-4 border border-slate-100 rounded-2xl flex items-center justify-between gap-4 bg-white hover:bg-slate-50 transition-all border-l-4 border-l-slate-200 hover:border-l-yellow-600 shadow-3xs">
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 block truncate text-xs">{item.title}</span>
                          <span className="text-[10px] text-slate-400 block font-bold mt-0.5">
                            {item.start_date === item.end_date
                              ? new Date(item.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
                              : `${new Date(item.start_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })} - ${new Date(item.end_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}`
                            }
                          </span>
                        </div>
                        <StatusBadge status={status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </SummaryCard>

          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-2xl font-black mb-3 text-yellow-500 uppercase tracking-tighter">BCEA Compliance Engine</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl font-medium">
                The Restaurant Operating System (ROS) utilizes a real-time statutory engine. It automatically manages 3-year sick leave cycles, flags 18-month leave expiries, and enforces SA labor law constraints across all branch locations.
              </p>
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-yellow-600/10 rounded-full blur-3xl group-hover:bg-yellow-600/20 transition-all duration-700"></div>
          </div>
        </div>

        {/* Sidebar: Alerts & Follow-ups */}
        <div className="space-y-6">
          {pendingLeaveCount > 0 && (
            <div className="bg-white border-2 border-yellow-600 p-5 rounded-3xl shadow-xl flex items-center justify-between group hover:bg-yellow-50 transition-all cursor-pointer animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-600 flex items-center justify-center text-white shadow-lg shadow-yellow-600/20">
                  <Inbox size={24} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Action Required</p>
                  <h4 className="text-lg font-black text-slate-900 leading-none">{pendingLeaveCount} Pending Requests</h4>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-400 group-hover:text-yellow-600 transition-all" />
            </div>
          )}

          <EmployeeFollowUpView compact onNavigateToEmployee={onNavigateToEmployee} />
        </div>

      </div>
    </div>
  );
}