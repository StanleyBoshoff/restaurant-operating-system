/**
 * Employer / Company Configuration
 * Customisable rules and thresholds for a specific restaurant/business.
 */

export const COMPANY_RULES = {
  // --- Attendance ---
  'attendance_notification_deadline': '06:00:00', // Time by which manager must be notified
  'attendance_grace_period_mins': 5,            // Lateness before it becomes a breach
  'attendance_severe_threshold_mins': 60,      // Threshold for "Extensive Delay" (Aggravating)

  // --- Operational ---
  'default_warning_expiry_months': 6,

  // --- Supporting Reasons Logic ---
  // Determines which generic reasons are appended to operational misconduct
  'standard_supporting_reasons': [
    'Not following company procedure.',
    'Conduct detrimental to the company.'
  ]
};
