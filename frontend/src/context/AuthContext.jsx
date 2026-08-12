import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user);
      else setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user);
      else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🚀 REALTIME PERMISSION SYNC: 100% Database Driven
  useEffect(() => {
    if (!user || !user.role_data) return;

    const myLevel = user.role_data.authority_level;

    const channel = supabase
      .channel(`realtime-perms-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'authority_levels',
          filter: `level=eq.${myLevel}`
        },
        (payload) => {
          console.log(`🟢 [CLIENT] Instant Permission Sync for Level ${myLevel}!`);

          // 🚀 INSTANT INJECTION: Update the local state directly from the realtime payload
          // This bypasses any database delays or caching.
          const updatedPermissions = payload.new.permissions;

          setUser(prev => {
              if (!prev) return prev;
              return {
                  ...prev,
                  role_data: {
                      ...prev.role_data,
                      permissions: updatedPermissions
                  }
              };
          });
        }
      )
      .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [user?.role_data?.authority_level]);

  const fetchUserProfile = async (authUser) => {
    try {
      // 1. Fetch Employee Record
      let { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('email', authUser.email)
        .maybeSingle();

      if (employee) {
        // 2. Fetch Role Data
        const { data: roleData } = await supabase
            .from('roles')
            .select('*')
            .eq('id', employee.role_id)
            .single();

        setUser({ ...employee, role_data: roleData, auth_user: authUser });
      } else {
        // Guest/No Profile: Use the Auth ID as a fallback to prevent "undefined" crashes
        setUser({
            id: authUser.id,
            first_name: 'Guest',
            last_name: 'User',
            auth_user: authUser,
            role_data: { authority_level: 1, permissions: {} }
        });
      }
    } catch (err) {
      console.error("Critical error in profile fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
