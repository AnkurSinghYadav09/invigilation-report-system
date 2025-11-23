import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyzeWorkload } from '../../lib/utils/workload';

/**
 * Duty Distribution Chart
 * Shows workload distribution across instructors with color coding
 */
export default function DutyDistributionChart({ instructors }) {
    const analysis = analyzeWorkload(instructors);

    // Prepare chart data
    const chartData = analysis.map(item => ({
        name: item.name.split(' ').slice(-1)[0], // Last name for brevity
        duties: item.total_duties || 0,
        status: item.status,
        fullName: item.name
    })).sort((a, b) => b.duties - a.duties);

    const getBarColor = (status) => {
        switch (status) {
            case 'overloaded':
                return '#ef4444'; // red
            case 'underutilized':
                return '#f59e0b'; // yellow/orange
            default:
                return '#22c55e'; // green
        }
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-gray-900">{data.fullName}</p>
                    <p className="text-sm text-gray-600">Duties: {data.duties}</p>
                    <p className="text-sm capitalize" style={{ color: getBarColor(data.status) }}>
                        {data.status}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                No instructor data available
            </div>
        );
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Duty Distribution</h3>
                <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-success-500 mr-2"></div>
                        <span className="text-gray-600">Balanced</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-gray-600">Underutilized</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-danger-500 mr-2"></div>
                        <span className="text-gray-600">Overloaded</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="duties" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
