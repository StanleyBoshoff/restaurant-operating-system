import { supabase } from '../supabaseClient';

/**
 * Service for managing Operational Engine Settings
 */

export const getOperationalSettings = async () => {
  const { data, error } = await supabase
    .from('operational_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  // Return defaults if not found
  if (!data) {
    return {
      opening_shift_start: '07:00:00',
      closing_shift_start: '12:00:00',
      arrival_threshold_mins: 15,
      task_threshold_mins: 30
    };
  }

  return data;
};

export const updateOperationalSettings = async (settings) => {
  const { error } = await supabase
    .from('operational_settings')
    .upsert([settings]);

  if (error) throw error;
};
