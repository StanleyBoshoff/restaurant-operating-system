import { supabase } from '../../supabaseClient';
import { DISCIPLINARY_LEVELS } from '../disciplinaryEngine';

/**
 * Service for fetching active disciplinary history.
 */
export const fetchActiveHistory = async (employeeId) => {
  const { data: rawHistory, error } = await supabase
    .from('employee_warnings')
    .select('*')
    .eq('employee_id', employeeId);

  if (error) {
    console.error("Failed to fetch history:", error.message);
    return [];
  }

  const now = new Date();

  // Filter for ACTIVE warnings only (based on standard durations)
  return (rawHistory || []).map(w => {
    // Map label back to key to get duration
    const levelKey = Object.keys(DISCIPLINARY_LEVELS).find(k => DISCIPLINARY_LEVELS[k].label === w.warning_level);
    const durationStr = DISCIPLINARY_LEVELS[levelKey]?.duration || '6 months';
    const monthsValid = parseInt(durationStr) || 6;

    const expiryDate = new Date(w.incident_date);
    expiryDate.setMonth(expiryDate.getMonth() + monthsValid);

    return { ...w, is_active: expiryDate > now };
  }).filter(w => w.is_active);
};
