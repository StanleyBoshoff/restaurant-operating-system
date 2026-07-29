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
 * Dispatches engine correction feedback to the administrator.
 */
export const submitEngineFeedback = async (data) => {
  const { managerName, originalFacts, generatedDraft, correctionNotes } = data;

  console.log(`[Feedback System] Dispatching correction request to stanleyboshoff@gmail.com`);

  const emailBody = `
    ENGINE CORRECTION REQUEST
    FROM: ${managerName}

    ORIGINAL FACTS:
    ${originalFacts}

    SYSTEM OUTPUT:
    ${generatedDraft}

    MANAGER NOTES (WHY IT WAS WRONG):
    ${correctionNotes}
  `;

  console.log("Email Dispatching:", emailBody);

  // Future: Link to Edge Function for actual email delivery
  return { success: true };
};

/**
 * Triggers a disciplinary consultation notice to an employee.
 */
export const notifyStaffOfDisciplinaryConsultation = async (employee, incidentType) => {
  const message = `DISCIPLINARY NOTICE: Hi ${employee.first_name}, please see your manager (${employee.manager_name || 'Department Manager'}) for a disciplinary consultation regarding the recent incident (${incidentType || 'General Misconduct'}).`;

  console.log(`[WhatsApp Dispatch Simulation] To: ${employee.phone_number || 'No Phone recorded'} | Message: "${message}"`);

  return { success: true };
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
  if (leaveType === 'Sick Leave') return true;
  if (leaveType === 'Family Responsibility') return true;
  if (days > 2) return true; // BCEA rule: more than 2 consecutive days
  return false;
};
