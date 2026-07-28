import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SummaryCard from './common/SummaryCard';
import { ShieldAlert, ChevronRight } from 'lucide-react';

export default function EmployeeFollowUpView({ onNavigateToEmployee }) {
  const [employeeAlerts, setEmployeeAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

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
  }, []);

  return (
    <SummaryCard
      title="Employee Follow-up Queue"
      icon={ShieldAlert}
      badge={<span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{employeeAlerts.length} OPEN</span>}
    >
      <div className="space-y-3">
        <p className="text-slate-500 text-[10px] -mt-1 leading-relaxed">
          Resolve onboarding gaps or missing compliance documents from the profile workspace.
        </p>

        <div className="space-y-2 pt-1">
          {alertsLoading ? (
            <p className="text-center text-slate-400 italic py-4 animate-pulse text-xs">Syncing follow-up queue...</p>
          ) : employeeAlerts.length === 0 ? (
            <p className="p-4 text-slate-400 border border-dashed rounded-lg text-center bg-slate-50/50 text-xs italic">No pending compliance items.</p>
          ) : (
            employeeAlerts.map((alert) => {
              if (!alert || !alert.employee) return null;

              return (
                <button
                  key={alert.id || alert.employee.id}
                  type="button"
                  onClick={() => {
                    if (onNavigateToEmployee && alert.employee.id) {
                      onNavigateToEmployee(alert.employee.id);
                    }
                  }}
                  className="w-full text-left hover:bg-slate-50/80 p-3 rounded-xl transition-all cursor-pointer block border border-slate-100 bg-white hover:border-slate-300 shadow-3xs group"
                >
                  <div className="flex justify-between items-center gap-4">
                    <div className="space-y-1 min-w-0 text-xs">
                      <span className="font-bold text-slate-800 text-sm block group-hover:text-yellow-600 transition-colors">
                        {alert.employee.first_name} {alert.employee.last_name}
                      </span>

                      {alert.missingInfo && alert.missingInfo.length > 0 && (
                        <p className="text-[10px] text-slate-500 truncate font-medium flex items-center gap-1">
                          <span className="text-amber-600 font-bold uppercase tracking-wider text-[8px] bg-amber-50 px-1 rounded-sm border border-amber-200">Data</span>
                          {alert.missingInfo.join(', ')}
                        </p>
                      )}

                      {alert.missingDocuments && alert.missingDocuments.length > 0 && (
                        <p className="text-[10px] text-slate-500 truncate font-medium flex items-center gap-1">
                          <span className="text-rose-600 font-bold uppercase tracking-wider text-[8px] bg-rose-50 px-1 rounded-sm border border-rose-200">Vault</span>
                          {alert.missingDocuments.join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 p-1.5 bg-slate-50 border border-slate-100 rounded-lg group-hover:bg-yellow-600 group-hover:border-yellow-600 transition-all shadow-3xs">
                      <ChevronRight size={14} className="text-slate-400 group-hover:text-white" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </SummaryCard>
  );
}
