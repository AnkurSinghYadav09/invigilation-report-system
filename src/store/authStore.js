import { create } from 'zustand';
import { supabase } from '../lib/supabase';

/**
 * Authentication Store using Zustand
 * Manages user session, role detection, and auth state
 */
export const useAuthStore = create((set, get) => ({
    user: null,
    role: null, // 'admin' or 'instructor'
    instructorId: null, // UUID for instructors
    loading: true,

    /**
     * Initialize auth state from Supabase session
     */
    initialize: async () => {
        try {
            // Get fresh session from Supabase
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
                console.error('Session error:', sessionError);
                set({ user: null, role: null, instructorId: null, loading: false });
                return;
            }

            if (session?.user) {
                // Get role from user_metadata (which was just updated)
                const role = session.user.user_metadata?.role || 'instructor';
                const instructorId = session.user.user_metadata?.instructor_id || null;
                
                console.log('✅ Session initialized with role:', role);

                set({
                    user: session.user,
                    role,
                    instructorId,
                    loading: false
                });
            } else {
                console.log('No session found');
                set({ user: null, role: null, instructorId: null, loading: false });
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            set({ user: null, role: null, instructorId: null, loading: false });
        }
    },

    /**
     * Login with email and password
     * @param {string} email 
     * @param {string} password 
     * @returns {Object} { success, error }
     */
    login: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            const role = data.user.user_metadata?.role || 'instructor';
            const instructorId = data.user.user_metadata?.instructor_id || null;

            set({
                user: data.user,
                role,
                instructorId,
                loading: false
            });

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Logout current user
     */
    logout: async () => {
        try {
            // Clear all local session data FIRST
            set({ user: null, role: null, instructorId: null, loading: false });
            
            // Then sign out from Supabase
            await supabase.auth.signOut();
            
            // Force clear browser cache/session storage
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear Supabase client cache
            try {
                await supabase.auth.refreshSession();
            } catch (e) {
                // Ignore refresh errors during logout
            }
            
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Check if user is admin
     */
    isAdmin: () => {
        return get().role === 'admin';
    },

    /**
     * Check if user is instructor
     */
    isInstructor: () => {
        return get().role === 'instructor';
    }
}));

// Listen to auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
        const role = session.user.user_metadata?.role || 'instructor';
        const instructorId = session.user.user_metadata?.instructor_id || null;

        useAuthStore.setState({
            user: session.user,
            role,
            instructorId,
            loading: false
        });
    } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({
            user: null,
            role: null,
            instructorId: null,
            loading: false
        });
    }
});
