import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { calculatePunctualityRate } from '../utils/punctuality';

/**
 * Custom hook for managing instructors
 * Provides CRUD operations and statistics
 */
export function useInstructors() {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all instructors with stats
    const fetchInstructors = async () => {
        try {
            setLoading(true);

            const { data, error: fetchError } = await supabase
                .from('instructor_stats')
                .select('*')
                .order('name');

            if (fetchError) throw fetchError;

            setInstructors(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching instructors:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Create new instructor
    const createInstructor = async (instructorData) => {
        try {
            console.log('Creating instructor:', instructorData);

            const { data, error: insertError } = await supabase
                .from('instructors')
                .insert([instructorData])
                .select()
                .single();

            if (insertError) {
                console.error('Supabase insert error:', insertError);
                throw insertError;
            }

            console.log('Instructor created successfully:', data);

            // Show success message with linking information
            alert(
                `✅ Instructor created successfully!\n\n` +
                `Email: ${instructorData.email}\n\n` +
                `📝 Next Steps:\n` +
                `• If they already have an account, they should logout and login again\n` +
                `• If they don't have an account yet, they should sign up with this email\n` +
                `• Their account will be automatically linked when they sign up/login`
            );

            await fetchInstructors();
            return { success: true };
        } catch (err) {
            console.error('Error creating instructor:', err);
            const errorMessage = err.message || 'Failed to create instructor. Check permissions.';
            alert(`Error: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    };

    // Update instructor
    const updateInstructor = async (instructorId, updates) => {
        try {
            console.log('Updating instructor:', instructorId, updates);
            const { data, error: updateError } = await supabase
                .from('instructors')
                .update(updates)
                .eq('id', instructorId);

            if (updateError) {
                console.error('Supabase update error:', updateError);
                throw updateError;
            }

            console.log('Instructor updated successfully:', data);
            await fetchInstructors();
            return { success: true };
        } catch (err) {
            console.error('Error updating instructor:', err);
            const errorMessage = err.message || 'Failed to update instructor. Check permissions.';
            alert(`Error: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    };

    // Delete instructor
    const deleteInstructor = async (instructorId) => {
        try {
            console.log('Deleting instructor:', instructorId);
            const { data, error: deleteError } = await supabase
                .from('instructors')
                .delete()
                .eq('id', instructorId);

            if (deleteError) {
                console.error('Supabase delete error:', deleteError);
                throw deleteError;
            }

            console.log('Instructor deleted successfully:', data);
            await fetchInstructors();
            return { success: true };
        } catch (err) {
            console.error('Error deleting instructor:', err);
            const errorMessage = err.message || 'Failed to delete instructor. Check permissions.';
            alert(`Error: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchInstructors();
    }, []);

    return {
        instructors,
        loading,
        error,
        createInstructor,
        updateInstructor,
        deleteInstructor,
        refresh: fetchInstructors
    };
}

/**
 * Hook to get single instructor with detailed stats
 */
export function useInstructorDetails(instructorId) {
    const [instructor, setInstructor] = useState(null);
    const [duties, setDuties] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);

                // Fetch instructor
                const { data: instructorData, error: instructorError } = await supabase
                    .from('instructors')
                    .select('*')
                    .eq('id', instructorId)
                    .single();

                if (instructorError) throw instructorError;

                // Fetch duties
                const { data: dutiesData, error: dutiesError } = await supabase
                    .from('duties')
                    .select(`
            *,
            exam:exams(*),
            room:rooms(*)
          `)
                    .eq('instructor_id', instructorId)
                    .order('created_at', { ascending: false });

                if (dutiesError) throw dutiesError;

                // Calculate stats
                const totalDuties = dutiesData.length;
                const onTimeDuties = dutiesData.filter(d => d.status === 'on-time').length;
                const lateDuties = dutiesData.filter(d => d.status === 'late').length;
                const pendingDuties = dutiesData.filter(d => d.status === 'pending').length;
                const punctualityRate = calculatePunctualityRate(dutiesData);

                setInstructor(instructorData);
                setDuties(dutiesData);
                setStats({
                    totalDuties,
                    onTimeDuties,
                    lateDuties,
                    pendingDuties,
                    punctualityRate
                });
                setError(null);
            } catch (err) {
                console.error('Error fetching instructor details:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (instructorId) {
            fetchDetails();
        }
    }, [instructorId]);

    return { instructor, duties, stats, loading, error };
}
