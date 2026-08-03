import { supabase } from '../supabaseClient';

/**
 * Service for managing Operational Checklists.
 */

/**
 * Fetches all items for a specific checklist by name.
 */
export const getChecklistItems = async (checklistName) => {
  const { data: checklist, error: clError } = await supabase
    .from('checklists')
    .select('id')
    .eq('name', checklistName)
    .maybeSingle();

  if (clError) throw clError;
  if (!checklist) return [];

  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('checklist_id', checklist.id)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Submits a completed checklist.
 */
export const submitChecklist = async (checklistName, submissionData, managerName) => {
  const { data: checklist, error: clError } = await supabase
    .from('checklists')
    .select('id')
    .eq('name', checklistName)
    .maybeSingle();

  if (clError) throw clError;

  const { data, error } = await supabase
    .from('checklist_submissions')
    .insert([{
      checklist_id: checklist?.id,
      submitted_by_name: managerName,
      submission_data: submissionData
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};
