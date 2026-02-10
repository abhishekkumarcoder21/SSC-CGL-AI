'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// Check if Supabase is configured
function isSupabaseConfigured() {
    return (
        typeof window !== 'undefined' &&
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'
    );
}

function getSupabase() {
    if (!isSupabaseConfigured()) return null;
    const { createClient } = require('../../lib/supabase/client');
    return createClient();
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [supabase] = useState(() => getSupabase());

    useEffect(() => {
        if (!supabase) {
            // No Supabase — use local-only mode
            setLoading(false);
            return;
        }

        // Get initial session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };
        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase]);

    // Send OTP
    const sendOtp = useCallback(async (phone) => {
        if (!supabase) throw new Error('Supabase not configured. Add env vars to .env.local');
        const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
        const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
        if (error) throw error;
        return true;
    }, [supabase]);

    // Verify OTP
    const verifyOtp = useCallback(async (phone, token) => {
        if (!supabase) throw new Error('Supabase not configured');
        const fullPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
        const { data, error } = await supabase.auth.verifyOtp({
            phone: fullPhone,
            token,
            type: 'sms',
        });
        if (error) throw error;
        return data;
    }, [supabase]);

    // Logout
    const signOut = useCallback(async () => {
        if (supabase) await supabase.auth.signOut();
        setUser(null);
    }, [supabase]);

    // Check if user has a profile
    const checkProfile = useCallback(async () => {
        if (!user || !supabase) return null;
        const { data } = await supabase
            .from('user_profile')
            .select('*')
            .eq('id', user.id)
            .single();
        return data;
    }, [user, supabase]);

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        isConfigured: !!supabase,
        sendOtp,
        verifyOtp,
        signOut,
        checkProfile,
        supabase,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
