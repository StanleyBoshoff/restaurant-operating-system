import { supabase } from '../supabaseClient';

/**
 * Service for handling operational form submissions.
 * Consolidates Incidents, Cash-Ups, Temp Logs, etc.
 */

/**
 * Submits a form to the database.
 * @param {string} formType 'Incident', 'CashUp', 'TempLog', 'Maintenance'
 * @param {object} data The structured form data
 * @param {string} employeeId Optional UUID of the person submitting
 */
export const submitForm = async (formType, data, employeeId = null) => {
  const { data: result, error } = await supabase
    .from('forms_submissions')
    .insert([{
      form_type: formType,
      submitted_by: employeeId,
      data: data
    }])
    .select()
    .single();

  if (error) throw error;
  return result;
};

/**
 * Fetches recent submissions for a specific form type.
 */
export const getFormSubmissions = async (formType) => {
  const { data, error } = await supabase
    .from('forms_submissions')
    .select('*')
    .eq('form_type', formType)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
