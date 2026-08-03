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

/**
 * 10-Level Matrix Operations
 */

export const getAllAuthorityLevels = async () => {
  const { data, error } = await supabase
    .from('authority_levels')
    .select('*')
    .order('level', { ascending: false });

  if (error) throw error;
  return data;
};

export const saveAuthorityMatrix = async (matrixData) => {
  const { error } = await supabase
    .from('authority_levels')
    .upsert(matrixData);

  if (error) throw error;
};
