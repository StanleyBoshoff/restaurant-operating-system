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
 * Checks if a leave type requires mandatory document proof.
 */
export const requiresProof = (leaveType, days) => {
  if (leaveType === 'Sick Leave') return true;
  if (leaveType === 'Family Responsibility') return true;
  if (days > 2) return true; // BCEA rule: more than 2 consecutive days
  return false;
};
