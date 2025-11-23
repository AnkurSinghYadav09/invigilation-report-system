import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

/**
 * Custom hook for managing exams
 */
export function useExams() {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchExams = async () => {
        try {
            setLoading(true);

            const { data, error: fetchError } = await supabase
                .from('exams')
                .select('*')
                .order('date', { ascending: true });

            if (fetchError) throw fetchError;

            setExams(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching exams:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createExam = async (examData) => {
        try {
            console.log('Creating exam:', examData);
            const { data, error: insertError } = await supabase
                .from('exams')
                .insert([examData]);

            if (insertError) {
                console.error('Supabase insert error:', insertError);
                throw insertError;
            }

            console.log('Exam created successfully:', data);
            await fetchExams();
            return { success: true };
        } catch (err) {
            console.error('Error creating exam:', err);
            const errorMessage = err.message || 'Failed to create exam. Check permissions.';
            alert(`Error: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    };

    const updateExam = async (examId, updates) => {
        try {
            console.log('Updating exam:', examId, updates);
            const { data, error: updateError } = await supabase
                .from('exams')
                .update(updates)
                .eq('id', examId);

            if (updateError) {
                console.error('Supabase update error:', updateError);
                throw updateError;
            }

            console.log('Exam updated successfully:', data);
            await fetchExams();
            return { success: true };
        } catch (err) {
            console.error('Error updating exam:', err);
            const errorMessage = err.message || 'Failed to update exam. Check permissions.';
            alert(`Error: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    };

    const deleteExam = async (examId) => {
        try {
            console.log('Deleting exam:', examId);
            const { data, error: deleteError } = await supabase
                .from('exams')
                .delete()
                .eq('id', examId);

            if (deleteError) {
                console.error('Supabase delete error:', deleteError);
                throw deleteError;
            }

            console.log('Exam deleted successfully:', data);
            await fetchExams();
            return { success: true };
        } catch (err) {
            console.error('Error deleting exam:', err);
            const errorMessage = err.message || 'Failed to delete exam. Check permissions.';
            alert(`Error: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    return {
        exams,
        loading,
        error,
        createExam,
        updateExam,
        deleteExam,
        refresh: fetchExams
    };
}

/**
 * Custom hook for managing rooms
 */
export function useRooms() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRooms = async () => {
        try {
            setLoading(true);

            const { data, error: fetchError } = await supabase
                .from('rooms')
                .select('*')
                .order('name');

            if (fetchError) throw fetchError;

            setRooms(data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching rooms:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createRoom = async (roomData) => {
        try {
            console.log('Creating room:', roomData);
            const { data, error: insertError } = await supabase
                .from('rooms')
                .insert([roomData]);

            if (insertError) {
                console.error('Supabase insert error:', insertError);
                throw insertError;
            }

            console.log('Room created successfully:', data);
            await fetchRooms();
            return { success: true };
        } catch (err) {
            console.error('Error creating room:', err);
            const errorMessage = err.message || 'Failed to create room. Check permissions.';
            alert(`Error: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    };

    const updateRoom = async (roomId, updates) => {
        try {
            console.log('Updating room:', roomId, updates);
            const { data, error: updateError } = await supabase
                .from('rooms')
                .update(updates)
                .eq('id', roomId);

            if (updateError) {
                console.error('Supabase update error:', updateError);
                throw updateError;
            }

            console.log('Room updated successfully:', data);
            await fetchRooms();
            return { success: true };
        } catch (err) {
            console.error('Error updating room:', err);
            const errorMessage = err.message || 'Failed to update room. Check permissions.';
            alert(`Error: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    };

    const deleteRoom = async (roomId) => {
        try {
            console.log('Deleting room:', roomId);
            const { data, error: deleteError } = await supabase
                .from('rooms')
                .delete()
                .eq('id', roomId);

            if (deleteError) {
                console.error('Supabase delete error:', deleteError);
                throw deleteError;
            }

            console.log('Room deleted successfully:', data);
            await fetchRooms();
            return { success: true };
        } catch (err) {
            console.error('Error deleting room:', err);
            const errorMessage = err.message || 'Failed to delete room. Check permissions.';
            alert(`Error: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    return {
        rooms,
        loading,
        error,
        createRoom,
        updateRoom,
        deleteRoom,
        refresh: fetchRooms
    };
}
