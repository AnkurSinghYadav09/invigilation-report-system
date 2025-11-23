import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useDutiesByDate } from '../../lib/hooks/useDuties';
import { supabase } from '../../lib/supabase';
import DutyCard from '../../components/instructor/DutyCard';
import Navbar from '../../components/shared/Navbar';

/**
 * Instructor Dashboard
 * Shows upcoming and past duties grouped by date
 */
export default function InstructorDashboard() {
    const { instructorId, user } = useAuthStore();
    const { dutiesByDate, loading, error, markArrival } = useDutiesByDate(instructorId);
    const [expandedDates, setExpandedDates] = useState(new Set());
    const [instructorName, setInstructorName] = useState('');

    useEffect(() => {
        const fetchInstructorName = async () => {
            if (instructorId) {
                const { data } = await supabase
                    .from('instructors')
                    .select('name')
                    .eq('id', instructorId)
                    .single();
                if (data) setInstructorName(data.name);
            }
        };
        fetchInstructorName();
    }, [instructorId]);

    const handleMarkArrival = async (dutyId, reportingTime) => {
        const result = await markArrival(dutyId, reportingTime);

        if (result.success) {
            alert(`Arrival marked successfully! Status: ${result.status}`);
        } else {
            alert(`Error: ${result.error}`);
        }
    };

    const toggleDate = (date) => {
        const newExpanded = new Set(expandedDates);
        if (newExpanded.has(date)) {
            newExpanded.delete(date);
        } else {
            newExpanded.add(date);
        }
        setExpandedDates(newExpanded);
    };


    // Separate today, upcoming, and past duties
    const today = new Date().toISOString().split('T')[0];

    const todayDates = Object.keys(dutiesByDate)
        .filter(date => date === today)
        .sort();

    const upcomingDates = Object.keys(dutiesByDate)
        .filter(date => date > today)
        .sort();

    const pastDates = Object.keys(dutiesByDate)
        .filter(date => date < today)
        .sort()
        .reverse();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading duties...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Check if instructor account is linked to an instructor record
    if (!instructorId) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
                        <p className="mt-2 text-gray-600">{instructorName || user?.email}</p>
                    </div>

                    {/* No Instructor Profile Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-3 flex-1">
                                <h3 className="text-lg font-semibold text-yellow-900">
                                    Instructor Profile Not Linked
                                </h3>
                                <p className="mt-2 text-yellow-700">
                                    Your account has been created and approved, but it hasn't been linked to an instructor profile yet.
                                </p>
                                <div className="mt-4 bg-white border border-yellow-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-yellow-900 mb-2">What you need to do:</h4>
                                    <ol className="list-decimal list-inside text-yellow-700 space-y-2">
                                        <li>Contact your system administrator</li>
                                        <li>Ask them to create an instructor profile for you in the system</li>
                                        <li>Ask them to link your account to that profile</li>
                                        <li>Once linked, logout and login again to see your duties</li>
                                    </ol>
                                </div>
                                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-900 mb-2">For Administrators:</h4>
                                    <p className="text-sm text-blue-700">
                                        To link this account:
                                    </p>
                                    <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1 mt-2">
                                        <li>Go to <strong>Admin → Instructors</strong></li>
                                        <li>Create a new instructor with this email: <strong>{user?.email}</strong></li>
                                        <li>The system will automatically link the account</li>
                                    </ol>
                                    <p className="text-sm text-blue-700 mt-2">
                                        Or run this SQL to link manually:
                                    </p>
                                    <pre className="mt-2 bg-blue-100 p-2 rounded text-xs text-blue-900 overflow-x-auto">
                                        {`-- First, create instructor if not exists
INSERT INTO instructors (name, email, department, phone)
VALUES ('${user?.user_metadata?.name || 'Instructor Name'}', '${user?.email}', 'Department', 'Phone');

-- Then link to user account
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{instructor_id}',
  (SELECT to_jsonb(id) FROM instructors WHERE email = '${user?.email}')
)
WHERE email = '${user?.email}';`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                        <p className="text-danger-700">Error loading duties: {error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
                    <p className="mt-2 text-gray-600">{user?.email}</p>
                </div>


                {/* Today's Duties */}
                {todayDates.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-green-600 mb-6">Today's Duties</h2>

                        <div className="space-y-6">
                            {todayDates.map(date => {
                                const duties = dutiesByDate[date];
                                const isExpanded = expandedDates.has(date) || duties.length === 1;

                                return (
                                    <div key={date} className="card">
                                        <div
                                            className="flex items-center justify-between cursor-pointer"
                                            onClick={() => duties.length > 1 && toggleDate(date)}
                                        >
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {new Date(date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {duties.length} {duties.length === 1 ? 'duty' : 'duties'}
                                                </p>
                                            </div>
                                            {duties.length > 1 && (
                                                <svg
                                                    className={`h-6 w-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <div className="mt-4 space-y-4">
                                                {duties.map(duty => (
                                                    <DutyCard
                                                        key={duty.id}
                                                        duty={duty}
                                                        onMarkArrival={handleMarkArrival}
                                                        canMarkArrival={true}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Upcoming Duties */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-yellow-600 mb-6">Upcoming Duties</h2>

                    {upcomingDates.length === 0 ? (
                        <div className="card text-center py-12">
                            <p className="text-gray-500">No upcoming duties scheduled</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {upcomingDates.map(date => {
                                const duties = dutiesByDate[date];
                                const isExpanded = expandedDates.has(date) || duties.length === 1;

                                return (
                                    <div key={date} className="card">
                                        <div
                                            className="flex items-center justify-between cursor-pointer"
                                            onClick={() => duties.length > 1 && toggleDate(date)}
                                        >
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {new Date(date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {duties.length} {duties.length === 1 ? 'duty' : 'duties'}
                                                </p>
                                            </div>
                                            {duties.length > 1 && (
                                                <svg
                                                    className={`h-6 w-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <div className="mt-4 space-y-4">
                                                {duties.map(duty => (
                                                    <DutyCard
                                                        key={duty.id}
                                                        duty={duty}
                                                        onMarkArrival={handleMarkArrival}
                                                        canMarkArrival={true}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Past Duties */}
                {pastDates.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-red-600 mb-6">Past Duties</h2>

                        <div className="space-y-4">
                            {pastDates.map(date => {
                                const duties = dutiesByDate[date];
                                const isExpanded = expandedDates.has(date);

                                return (
                                    <div key={date} className="card">
                                        <div
                                            className="flex items-center justify-between cursor-pointer"
                                            onClick={() => toggleDate(date)}
                                        >
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-700">
                                                    {new Date(date).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {duties.length} {duties.length === 1 ? 'duty' : 'duties'}
                                                </p>
                                            </div>
                                            <svg
                                                className={`h-6 w-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>

                                        {isExpanded && (
                                            <div className="mt-4 space-y-4">
                                                {duties.map(duty => (
                                                    <DutyCard
                                                        key={duty.id}
                                                        duty={duty}
                                                        onMarkArrival={handleMarkArrival}
                                                        canMarkArrival={false}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
