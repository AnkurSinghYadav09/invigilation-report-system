import { useInstructors } from '../../lib/hooks/useInstructors';
import { useDuties } from '../../lib/hooks/useDuties';
import { flagImbalances } from '../../lib/utils/workload';
import { analyzeWorkload } from '../../lib/utils/workload';
import Navbar from '../../components/shared/Navbar';
import StatsCard from '../../components/shared/StatsCard';
import DutyDistributionChart from '../../components/admin/DutyDistributionChart';
import DepartmentWorkloadChart from '../../components/admin/DepartmentWorkloadChart';
import PunctualityOverviewChart from '../../components/admin/PunctualityOverviewChart';


/**
 * Admin Dashboard
 * Analytics overview with charts and alerts
 */
export default function AdminDashboard() {
    const { instructors, loading: instructorsLoading } = useInstructors();
    const { duties, loading: dutiesLoading } = useDuties();

    const loading = instructorsLoading || dutiesLoading;

    // Calculate statistics
    const totalInstructors = instructors.length;
    const totalDuties = duties.length;

    const onTimeDuties = duties.filter(d => d.status === 'on-time').length;
    const lateDuties = duties.filter(d => d.status === 'late').length;
    const completedDuties = onTimeDuties + lateDuties;
    const punctualityRate = completedDuties > 0
        ? Math.round((onTimeDuties / completedDuties) * 100)
        : 0;

    // Get current month duties
    const currentMonth = new Date().toISOString().slice(0, 7);
    const thisMonthDuties = duties.filter(d =>
        d.exam?.date?.startsWith(currentMonth)
    ).length;

    // Workload analysis
    const workloadAnalysis = analyzeWorkload(instructors);
    const alerts = flagImbalances(workloadAnalysis);

    // Late offenders (instructors with 3+ late arrivals)
    const lateOffenders = instructors.filter(i => i.late_count >= 3);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="mt-2 text-gray-600">System overview and analytics</p>
                </div>

                {/* Alerts */}
                {(alerts.length > 0 || lateOffenders.length > 0) && (
                    <div className="mb-8 space-y-4">
                        {lateOffenders.length > 0 && (
                            <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                                <h3 className="font-semibold text-danger-900 mb-2">
                                    ⚠️ Late Arrival Alerts
                                </h3>
                                <p className="text-danger-700 text-sm">
                                    {lateOffenders.length} instructor(s) with 3+ late arrivals: {' '}
                                    {lateOffenders.map(i => i.name).join(', ')}
                                </p>
                            </div>
                        )}

                        {alerts.map((alert, index) => (
                            <div
                                key={index}
                                className={`rounded-lg p-4 border ${alert.type === 'warning'
                                    ? 'bg-yellow-50 border-yellow-200'
                                    : 'bg-blue-50 border-blue-200'
                                    }`}
                            >
                                <h3 className={`font-semibold mb-2 ${alert.type === 'warning' ? 'text-yellow-900' : 'text-blue-900'
                                    }`}>
                                    {alert.title}
                                </h3>
                                <p className={`text-sm ${alert.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                                    }`}>
                                    {alert.message}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                        title="Total Instructors"
                        value={totalInstructors}
                        subtitle="Active in system"
                    />
                    <StatsCard
                        title="Duties This Month"
                        value={thisMonthDuties}
                        subtitle={`${totalDuties} total`}
                    />
                    <StatsCard
                        title="Punctuality Rate"
                        value={`${punctualityRate}%`}
                        subtitle={`${onTimeDuties} on-time, ${lateDuties} late`}
                    />
                    <StatsCard
                        title="Active Exams"
                        value={new Set(duties.map(d => d.exam_id)).size}
                        subtitle="Scheduled"
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Duty Distribution */}
                    <div className="card">
                        <DutyDistributionChart instructors={instructors} />
                    </div>

                    {/* Punctuality Overview */}
                    <PunctualityOverviewChart duties={duties} />

                    {/* Department Workload Chart */}
                    <DepartmentWorkloadChart duties={duties} instructors={instructors} />
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Arrivals</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Instructor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Exam
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Arrival Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {duties
                                    .filter(d => d.arrival_time)
                                    .sort((a, b) => new Date(b.arrival_time) - new Date(a.arrival_time))
                                    .slice(0, 10)
                                    .map((duty) => (
                                        <tr key={duty.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {duty.instructor?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {duty.exam?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(duty.arrival_time).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${duty.status === 'on-time'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {duty.status === 'on-time' ? 'ON TIME' : 'LATE'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        {duties.filter(d => d.arrival_time).length === 0 && (
                            <p className="text-center py-8 text-gray-500">No arrivals recorded yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
