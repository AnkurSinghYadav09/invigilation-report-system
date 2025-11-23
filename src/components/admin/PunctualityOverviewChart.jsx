import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * PunctualityOverviewChart Component
 * Shows punctuality metrics with exam filtering
 */
export default function PunctualityOverviewChart({ duties }) {
    const [selectedExamId, setSelectedExamId] = useState('all');

    // Get unique exams from duties
    const exams = Array.from(
        new Set(duties.map(d => d.exam_id).filter(Boolean))
    ).map(examId => {
        const duty = duties.find(d => d.exam_id === examId);
        return {
            id: examId,
            name: duty?.exam?.name || 'Unknown Exam',
            date: duty?.exam?.date || ''
        };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter duties based on selected exam
    const filteredDuties = selectedExamId === 'all'
        ? duties
        : duties.filter(d => d.exam_id === selectedExamId);

    // Calculate punctuality metrics
    const onTimeDuties = filteredDuties.filter(d => d.status === 'on-time').length;
    const lateDuties = filteredDuties.filter(d => d.status === 'late').length;
    const pendingDuties = filteredDuties.filter(d => d.status === 'pending').length;
    const completedDuties = onTimeDuties + lateDuties;

    const punctualityRate = completedDuties > 0
        ? Math.round((onTimeDuties / completedDuties) * 100)
        : 0;

    // Chart data
    const chartData = [
        { name: 'On Time', value: onTimeDuties, color: '#22c55e' },
        { name: 'Late', value: lateDuties, color: '#ef4444' },
        { name: 'Pending', value: pendingDuties, color: '#9ca3af' }
    ].filter(item => item.value > 0); // Only show non-zero values

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const total = onTimeDuties + lateDuties + pendingDuties;
            const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;

            return (
                <div className="bg-white px-4 py-3 border border-gray-200 rounded-lg shadow-xl">
                    <p className="font-bold text-gray-900 text-sm mb-2">{data.name}</p>
                    <div className="space-y-1 text-xs">
                        <p className="text-gray-600">
                            Count: <span className="font-semibold">{data.value}</span>
                        </p>
                        <p className="text-gray-600">
                            Percentage: <span className="font-semibold">{percent}%</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Get selected exam details
    const selectedExam = selectedExamId === 'all'
        ? null
        : exams.find(e => e.id === selectedExamId);

    return (
        <div className="card">
            {/* Header with Dropdown */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Punctuality Overview</h3>
                    {completedDuties > 0 && (
                        <div className={`text-2xl font-bold ${punctualityRate >= 80 ? 'text-green-600' :
                                punctualityRate >= 60 ? 'text-yellow-600' :
                                    'text-red-600'
                            }`}>
                            {punctualityRate}%
                        </div>
                    )}
                </div>

                {/* Exam Selector */}
                <div className="relative">
                    <select
                        value={selectedExamId}
                        onChange={(e) => setSelectedExamId(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    >
                        <option value="all">All Exams</option>
                        {exams.map(exam => (
                            <option key={exam.id} value={exam.id}>
                                {exam.name} {exam.date && `(${new Date(exam.date).toLocaleDateString()})`}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {selectedExam && (
                    <p className="mt-2 text-xs text-gray-500">
                        Showing data for: <span className="font-medium text-gray-700">{selectedExam.name}</span>
                    </p>
                )}
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <p className="text-xs font-medium text-green-600 uppercase tracking-wide">On Time</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{onTimeDuties}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Late</p>
                    <p className="text-2xl font-bold text-red-900 mt-1">{lateDuties}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Pending</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{pendingDuties}</p>
                </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="#fff"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value, entry) => (
                                <span className="text-sm text-gray-700">
                                    {value} ({entry.payload.value})
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2 text-sm">No punctuality data available</p>
                        {selectedExamId !== 'all' && (
                            <p className="text-xs text-gray-400 mt-1">for this exam</p>
                        )}
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            {completedDuties > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500">Completed Arrivals</p>
                            <p className="text-lg font-semibold text-gray-900">{completedDuties}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Punctuality Rate</p>
                            <p className={`text-lg font-semibold ${punctualityRate >= 80 ? 'text-green-600' :
                                    punctualityRate >= 60 ? 'text-yellow-600' :
                                        'text-red-600'
                                }`}>
                                {punctualityRate}%
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert for poor punctuality */}
            {completedDuties > 0 && punctualityRate < 60 && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-900">
                                Low punctuality detected! Only {punctualityRate}% of instructors arrived on time
                                {selectedExam && ` for ${selectedExam.name}`}.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
