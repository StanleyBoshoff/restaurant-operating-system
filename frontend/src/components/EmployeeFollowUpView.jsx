import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function EmployeeFollowUpView({ compact = false, onOpenEmployee }) {
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
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-900">Employee follow-up queue</h4>
          <p className="text-slate-500 text-[11px]">
            {compact
              ? 'Resolve onboarding gaps and missing documents directly from here.'
              : 'Click an item to open the employee profile and resolve onboarding gaps or missing documents.'}
          </p>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">{employeeAlerts.length} open</span>
      </div>

      {alertsLoading ? (
        <p className="text-slate-400 italic">Loading follow-up queue...</p>
      ) : employeeAlerts.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-lg p-4 text-slate-400 text-center">
          No onboarding follow-up items at the moment.
        </div>
      ) : (
        <div className="space-y-2">
          {employeeAlerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              onClick={() => onOpenEmployee?.(alert.employee)}
              className="w-full text-left rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-800">
                    {alert.employee.first_name} {alert.employee.last_name}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {alert.missingInfo.length > 0 && `Missing info: ${alert.missingInfo.join(', ')}`}
                    {alert.missingInfo.length > 0 && alert.missingDocuments.length > 0 ? ' • ' : ''}
                    {alert.missingDocuments.length > 0 && `Missing docs: ${alert.missingDocuments.join(', ')}`}
                  </div>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                  Review
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
