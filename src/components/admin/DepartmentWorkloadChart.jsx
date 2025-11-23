import { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/**
 * DepartmentWorkloadChart Component
 * Professional department-level metrics for enterprise scale
 */
const DepartmentWorkloadChart = memo(function DepartmentWorkloadChart({ duties, instructors }) {
    // Group instructors by department and count
    const departmentStats = {};

    instructors.forEach(instructor => {
        const dept = instructor.department || 'Unassigned';
        if (!departmentStats[dept]) {
            departmentStats[dept] = {
                instructorCount: 0,
                dutyCount: 0,
                instructors: []
            };
        }
        departmentStats[dept].instructorCount++;
        departmentStats[dept].instructors.push(instructor.id);
    });

    // Count duties per department
    duties.forEach(duty => {
        const instructor = instructors.find(i => i.id === duty.instructor_id);
        if (instructor) {
            const dept = instructor.department || 'Unassigned';
            if (departmentStats[dept]) {
                departmentStats[dept].dutyCount++;
            }
        }
    });

    // Calculate metrics for each department
    const departmentMetrics = Object.entries(departmentStats).map(([name, stats]) => {
        const avgDutiesPerInstructor = stats.instructorCount > 0
            ? (stats.dutyCount / stats.instructorCount).toFixed(1)
            : 0;

        return {
            name,
            totalDuties: stats.dutyCount,
            instructorCount: stats.instructorCount,
            avgDuties: parseFloat(avgDutiesPerInstructor)
        };
    }).sort((a, b) => b.totalDuties - a.totalDuties);

    // Calculate overall metrics
    const totalDuties = departmentMetrics.reduce((sum, d) => sum + d.totalDuties, 0);
    const totalInstructors = departmentMetrics.reduce((sum, d) => sum + d.instructorCount, 0);
    const overallAvg = totalInstructors > 0 ? (totalDuties / totalInstructors).toFixed(1) : 0;

    // Prepare chart data
    const chartData = departmentMetrics.map(d => ({
        name: d.name,
        value: d.totalDuties
    }));

    // Professional color palette
    const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const dept = departmentMetrics.find(d => d.name === data.name);
            const percent = ((data.value / totalDuties) * 100).toFixed(1);

            return (
                <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg shadow-xl">
                    <p className="font-bold text-gray-900 text-sm mb-2">{data.name}</p>
                    <div className="space-y-1 text-xs">
                        <p className="text-gray-600">
                            <span className="font-semibold">{data.value}</span> total duties
                        </p>
                        <p className="text-gray-600">
                            <span className="font-semibold">{dept?.instructorCount || 0}</span> instructors
                        </p>
                        <p className="text-gray-600">
                            <span className="font-semibold">{dept?.avgDuties || 0}</span> avg per instructor
                        </p>
                        <p className="text-primary-600 font-semibold border-t border-gray-200 pt-1 mt-1">
                            {percent}% of total
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (departmentMetrics.length === 0) {
        return (
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Department Workload
                </h3>
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>No department data available</p>
                </div>
            </div>
        );
    }

    // Identify workload issues
    const mostLoaded = departmentMetrics[0];
    const leastLoaded = departmentMetrics[departmentMetrics.length - 1];
    const threshold = parseFloat(overallAvg) * 0.3; // 30% deviation

    return (
        <div className="card">
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Department Workload</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Distribution across {departmentMetrics.length} departments
                </p>
            </div>

            {/* Key Metrics Row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Total Duties</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{totalDuties}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Departments</p>
                    <p className="text-2xl font-bold text-emerald-900 mt-1">{departmentMetrics.length}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Avg/Instructor</p>
                    <p className="text-2xl font-bold text-purple-900 mt-1">{overallAvg}</p>
                </div>
            </div>

            {/* Pie Chart */}
            <div className="mb-6">
                <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="#fff"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Department Stats Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Department
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Staff
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Duties
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Avg
                            </th>
                            <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Load
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {departmentMetrics.map((dept, index) => {
                            const percent = ((dept.totalDuties / totalDuties) * 100).toFixed(1);
                            const deviation = dept.avgDuties - overallAvg;
                            const isHigh = deviation > threshold;
                            const isLow = deviation < -threshold;

                            return (
                                <tr key={dept.name} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-3 py-3 whitespace-nowrap">
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <span className="text-sm font-medium text-gray-900 truncate">
                                                {dept.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <span className="text-sm text-gray-700">{dept.instructorCount}</span>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <span className="text-sm font-semibold text-gray-900">{dept.totalDuties}</span>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <span className="text-sm text-gray-700">{dept.avgDuties}</span>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <div className="flex items-center justify-center space-x-1">
                                            <span className="text-sm font-medium text-gray-600">{percent}%</span>
                                            {isHigh && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                                    High
                                                </span>
                                            )}
                                            {isLow && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                                    Low
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Summary Alert */}
            {mostLoaded.avgDuties > parseFloat(overallAvg) * 1.3 && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-amber-900">
                                <strong>{mostLoaded.name}</strong> has {mostLoaded.avgDuties} duties per instructor,
                                {' '}{((mostLoaded.avgDuties / overallAvg - 1) * 100).toFixed(0)}% above average.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default DepartmentWorkloadChart;
