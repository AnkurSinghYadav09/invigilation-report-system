import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { validateArrival } from '../utils/punctuality';

/**
 * Custom hook for managing duties
 * Provides CRUD operations and real-time subscriptions
 */
export function useDuties(instructorId = null) {
    const [duties, setDuties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch duties with full details (joins)
    const fetchDuties = async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('duties')
                .select(`
          *,
          exam:exams(*),
          room:rooms(*),
          instructor:instructors(*)
        `)
                .order('created_at', { ascending: false });

            // Filter by instructor if specified
            if (instructorId) {
                query = query.eq('instructor_id', instructorId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            setDuties(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching duties:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Mark arrival for a duty
    const markArrival = async (dutyId, reportingTime, deadlineMinutes = 30) => {
        try {
            console.log('🔵 Starting mark arrival process...');
            console.log('  Duty ID:', dutyId);
            console.log('  Reporting Time:', reportingTime);
            console.log('  Deadline Minutes:', deadlineMinutes);

            const now = new Date();
            console.log('  Current Time:', now.toISOString());

            const status = validateArrival(reportingTime, now, deadlineMinutes);
            console.log('  Calculated Status:', status);

            console.log('🔵 Sending UPDATE to Supabase...');
            const { data, error: updateError } = await supabase
                .from('duties')
                .update({
                    arrival_time: now.toISOString(),
                    status
                })
                .eq('id', dutyId)
                .select(); // Add select to get the updated row

            if (updateError) {
                console.error('❌ Supabase UPDATE error:', updateError);
                console.error('  Error code:', updateError.code);
                console.error('  Error message:', updateError.message);
                console.error('  Error details:', updateError.details);
                throw updateError;
            }

            console.log('✅ Arrival marked successfully!');
            console.log('  Updated data:', data);

            // Refresh duties
            await fetchDuties();

            return { success: true, status };
        } catch (err) {
            console.error('❌ Error marking arrival:', err);
            const errorMessage = err.message || 'Failed to mark arrival. Check permissions.';
            alert(`Error marking arrival:\n\n${errorMessage}\n\nCheck console for details.`);
            return { success: false, error: errorMessage };
        }
    };

    // Create new duty (admin only)
    const createDuty = async (dutyData) => {
        try {
            console.log('Creating duty:', dutyData);
            const { data, error: insertError } = await supabase
                .from('duties')
                .insert([dutyData]);

            if (insertError) {
                console.error('Supabase insert error:', insertError);
                throw insertError;
            }

            console.log('Duty created successfully:', data);
            await fetchDuties();
            return { success: true };
        } catch (err) {
            console.error('Error creating duty:', err);
            const errorMessage = err.message || 'Failed to create duty. Check permissions.';
            alert(`Error: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    };

    // Update duty (admin only)
    const updateDuty = async (dutyId, updates) => {
        try {
            console.log('Updating duty:', dutyId, updates);
            const { data, error: updateError } = await supabase
                .from('duties')
                .update(updates)
                .eq('id', dutyId);

            if (updateError) {
                console.error('Supabase update error:', updateError);
                throw updateError;
            }

            console.log('Duty updated successfully:', data);
            await fetchDuties();
            return { success: true };
        } catch (err) {
            console.error('Error updating duty:', err);
            const errorMessage = err.message || 'Failed to update duty. Check permissions.';
            alert(`Error: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    };

    // Delete duty (admin only)
    const deleteDuty = async (dutyId) => {
        try {
            console.log('Deleting duty:', dutyId);
            const { data, error: deleteError } = await supabase
                .from('duties')
                .delete()
                .eq('id', dutyId);

            if (deleteError) {
                console.error('Supabase delete error:', deleteError);
                throw deleteError;
            }

            console.log('Duty deleted successfully:', data);
            await fetchDuties();
            return { success: true };
        } catch (err) {
            console.error('Error deleting duty:', err);
            const errorMessage = err.message || 'Failed to delete duty. Check permissions.';
            alert(`Error: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchDuties();

        // Set up real-time subscription
        const subscription = supabase
            .channel('duties_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'duties' },
                () => {
                    fetchDuties();
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [instructorId]);

    return {
        duties,
        loading,
        error,
        markArrival,
        createDuty,
        updateDuty,
        deleteDuty,
        refresh: fetchDuties
    };
}

/**
 * Hook to get duties grouped by date
 */
export function useDutiesByDate(instructorId = null) {
    const { duties, loading, error, ...rest } = useDuties(instructorId);

    const dutiesByDate = duties.reduce((acc, duty) => {
        const date = duty.exam?.date || 'Unknown';
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(duty);
        return acc;
    }, {});

    return {
        dutiesByDate,
        loading,
        error,
        ...rest
    };
}

/**
 * Hook to get upcoming duties (future dates only)
 */
export function useUpcomingDuties(instructorId = null) {
    const { duties, loading, error, ...rest } = useDuties(instructorId);

    const today = new Date().toISOString().split('T')[0];
    const upcomingDuties = duties.filter(duty => {
        return duty.exam?.date >= today;
    });

    return {
        duties: upcomingDuties,
        loading,
        error,
        ...rest
    };
}
