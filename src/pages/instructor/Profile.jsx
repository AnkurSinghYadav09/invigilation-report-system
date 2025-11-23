import { useAuthStore } from '../../store/authStore';
import { useInstructorDetails } from '../../lib/hooks/useInstructors';
import Navbar from '../../components/shared/Navbar';
import StatsCard from '../../components/shared/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Instructor Profile Page
 * Shows personal statistics and performance metrics
 */
export default function InstructorProfile() {
    const { instructorId } = useAuthStore();
    const { instructor, duties, stats, loading, error } = useInstructorDetails(instructorId);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !instructor) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                        <p className="text-danger-700">Error loading profile: {error || 'Instructor not found'}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Prepare chart data (monthly breakdown)
    const getMonthlyData = () => {
        const monthlyStats = {};

        duties.forEach(duty => {
            if (!duty.exam?.date) return;

            const date = new Date(duty.exam.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = { month: monthKey, onTime: 0, late: 0, pending: 0 };
            }

            if (duty.status === 'on-time') monthlyStats[monthKey].onTime++;
            else if (duty.status === 'late') monthlyStats[monthKey].late++;
            else monthlyStats[monthKey].pending++;
        });

        return Object.values(monthlyStats).sort((a, b) => a.month.localeCompare(b.month));
    };

    const chartData = getMonthlyData();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{instructor.name}</h1>
                    <p className="mt-2 text-gray-600">{instructor.email}</p>
                    <p className="text-gray-600">{instructor.department}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Duties"
                        value={stats?.totalDuties || 0}
                        subtitle="All time"
                    />
                    <StatsCard
                        title="On-Time Arrivals"
                        value={stats?.onTimeDuties || 0}
                        subtitle={`${stats?.punctualityRate || 0}% punctuality rate`}
                    />
                    <StatsCard
                        title="Late Arrivals"
                        value={stats?.lateDuties || 0}
                        subtitle={stats?.lateDuties > 3 ? 'Needs improvement' : 'Good record'}
                    />
                    <StatsCard
                        title="Pending Duties"
                        value={stats?.pendingDuties || 0}
                        subtitle="Upcoming"
                    />
                </div>

                {/* Performance Chart */}
                {chartData.length > 0 && (
                    <div className="card mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Punctuality Trend</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="onTime" fill="#22c55e" name="On Time" />
                                <Bar dataKey="late" fill="#ef4444" name="Late" />
                                <Bar dataKey="pending" fill="#9ca3af" name="Pending" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Performance Insights */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Insights</h2>

                    <div className="space-y-4">
                        {stats?.punctualityRate >= 90 && (
                            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                                <p className="text-success-700 font-medium">
                                    🎉 Excellent punctuality record! You're in the top performers.
                                </p>
                            </div>
                        )}

                        {stats?.punctualityRate < 70 && stats?.punctualityRate > 0 && (
                            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                                <p className="text-danger-700 font-medium">
                                    ⚠️ Your punctuality rate is below average. Please try to arrive 30 minutes before reporting time.
                                </p>
                            </div>
                        )}

                        {stats?.lateDuties >= 3 && (
                            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                                <p className="text-danger-700 font-medium">
                                    ⚠️ You have {stats.lateDuties} late arrivals. This may be flagged by administration.
                                </p>
                            </div>
                        )}

                        {stats?.totalDuties === 0 && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <p className="text-gray-700">
                                    No duties assigned yet. Check back later for assignments.
                                </p>
                            </div>
                        )}

                        {stats?.pendingDuties > 0 && (
                            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                                <p className="text-primary-700 font-medium">
                                    📅 You have {stats.pendingDuties} upcoming {stats.pendingDuties === 1 ? 'duty' : 'duties'}.
                                    Remember to arrive 30 minutes before reporting time!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
