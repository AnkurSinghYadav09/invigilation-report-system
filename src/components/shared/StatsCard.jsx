/**
 * StatsCard Component
 * Reusable card for displaying metrics
 */
export default function StatsCard({ title, value, subtitle, icon, trend }) {
    return (
        <div className="card">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                    {subtitle && (
                        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                    )}
                </div>
                {icon && (
                    <div className="ml-4 flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                            {icon}
                        </div>
                    </div>
                )}
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={`font-medium ${trend.positive ? 'text-success-600' : 'text-danger-600'}`}>
                        {trend.value}
                    </span>
                    <span className="ml-2 text-gray-500">{trend.label}</span>
                </div>
            )}
        </div>
    );
}
