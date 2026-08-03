/**
 * Manager Notification Service
 * Handles triggers for SMS, WhatsApp, and Email notifications.
 */

export const NOTIFICATION_CHANNELS = {
  SMS: 'SMS',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email'
};

/**
 * Dispatches a notification to the responsible manager.
 */
export const notifyManagerOfLeaveApproval = async (employee, leaveRequest) => {
  console.log(`[Notification Service] Initializing dispatch for ${employee.first_name} ${employee.last_name}'s leave approval.`);

  const managerName = employee.manager_name || 'Department Manager';
  const message = `LEAVE APPROVED: ${employee.first_name} ${employee.last_name} (${employee.department}) will be on ${leaveRequest.leave_type} from ${leaveRequest.start_date} to ${leaveRequest.end_date}.`;

  // Placeholders for actual integration
  console.log(`Triggering ${NOTIFICATION_CHANNELS.EMAIL} to ${managerName}: "${message}"`);

  // Future: Integrate with Twilio, SendGrid, or Supabase Edge Functions here

  return { success: true, dispatchedChannels: [NOTIFICATION_CHANNELS.EMAIL] };
};

/**
 * Triggers a disciplinary consultation notice to an employee.
 */
export const notifyStaffOfDisciplinaryConsultation = async (employee, incidentType) => {
  const message = `RESTURAISE DISCIPLINARY NOTICE: Hi ${employee.first_name}, please report to your manager (${employee.manager_name || 'Department Manager'}) for a formal disciplinary consultation regarding the recent incident (${incidentType || 'General Misconduct'}). This is a requirement for operational compliance.`;

  console.log(`[WhatsApp Dispatch Dispatching to ${employee.phone_number || 'N/A'}]: "${message}"`);

  return { success: true };
};

/**
 * Dispatches engine correction feedback to the administrator.
 */
export const submitEngineFeedback = async (data) => {
  const { managerName, originalFacts, generatedDraft, correctionNotes } = data;

  const payload = {
    to: 'stanleyboshoff@gmail.com',
    subject: `Disciplinary Engine Correction Request - ${managerName}`,
    body: `
      OFFLINE ENGINE FEEDBACK
      MANAGER: ${managerName}
      FACTS: ${originalFacts}
      OUTPUT: ${generatedDraft}
      NOTES: ${correctionNotes}
    `
  };

  console.log("[Feedback Email Sim] Dispatching to Stanley:", payload);
  return { success: true };
};

/**
 * Checks if a leave type requires mandatory document proof.
 */
export const requiresProof = (leaveType, days) => {
  // BCEA: Sick Leave requires medical cert if > 2 days (or other specific cases)
  // For this system, we'll flag it for all Sick Leave to be safe, as per user request.
  if (leaveType === 'Sick Leave') return true;

  // Family Responsibility typically requires proof (Death Cert / Birth Cert)
  if (leaveType === 'Family Responsibility') return true;

  // Annual Leave and Unpaid Leave do not require proof documents
  return false;
};
