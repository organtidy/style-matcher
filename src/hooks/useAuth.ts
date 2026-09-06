import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type Profile = {
  id: string;
  email: string;
  plan_type: 'free' | 'pro' | 'ultra';
  subscription_status: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) setProfile(data as Profile);
    } catch (e) {
      console.debug('No profile found or error:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Timeout safety fallback so app never gets stuck on Carregando...
    const timeout = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 1500);

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!isMounted) return;
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      );

      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          if (!isMounted) return;
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchProfile(session.user.id);
          }
          setLoading(false);
        })
        .catch(() => {
          if (isMounted) setLoading(false);
        });

      return () => {
        isMounted = false;
        clearTimeout(timeout);
        subscription?.unsubscribe();
      };
    } catch (e) {
      setLoading(false);
      clearTimeout(timeout);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { display_name: displayName },
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return { user, profile, session, loading, signIn, signUp, signOut };
}
