import { supabase } from '../../supabaseClient';
import { DISCIPLINARY_LEVELS } from './registry';

/**
 * Service for Evaluative History Scanning
 * Retrieves and filters warnings according to Annexure B validity periods.
 */

export const getHistoryContext = async (employeeId, currentOffenceId, currentDNA = []) => {
  const { data: rawHistory } = await supabase
    .from('employee_warnings')
    .select('*')
    .eq('employee_id', employeeId);

  const now = new Date();

  // 1. Filter for ACTIVE warnings only
  const activeWarnings = (rawHistory || []).map(w => {
    const levelKey = Object.keys(DISCIPLINARY_LEVELS).find(k => DISCIPLINARY_LEVELS[k].label === w.warning_level);
    const monthsValid = DISCIPLINARY_LEVELS[levelKey]?.duration_months || 6;

    const expiryDate = new Date(w.incident_date);
    expiryDate.setMonth(expiryDate.getMonth() + monthsValid);

    return { ...w, is_active: expiryDate > now };
  }).filter(w => w.is_active);

  // 2. Pillar Analysis
  return {
    same_offence_count: activeWarnings.filter(w => w.offence_id === currentOffenceId).length,
    behavioural_patterns: activeWarnings.filter(w => {
        // Match by Taxonomy DNA (Informational only)
        return (w.dna_tags || []).some(tag => currentDNA.includes(tag));
    }),
    total_active_warnings: activeWarnings.length,
    raw: activeWarnings
  };
};
