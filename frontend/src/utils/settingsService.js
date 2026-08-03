import { supabase } from '../supabaseClient';

/**
 * Service for managing System Settings (Roles, Permissions, etc.)
 */

export const getPositions = async () => {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .order('authority_level', { ascending: true });

  if (error) throw error;
  return data;
};

export const savePosition = async (position) => {
  const { data, error } = await supabase
    .from('roles')
    .upsert([position])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deletePosition = async (id) => {
  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const updateRolePermissions = async (roleId, permissions) => {
  const { data, error } = await supabase
    .from('roles')
    .update({ permissions })
    .eq('id', roleId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
