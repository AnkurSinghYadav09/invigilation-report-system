import StatusBadge from '../shared/StatusBadge';
import { formatTime, getDeadlineTime } from '../../lib/utils/punctuality';
import { format } from 'date-fns';

/**
 * DutyCard Component
 * Displays individual duty information with mark arrival button
 */
export default function DutyCard({ duty, onMarkArrival, canMarkArrival = false }) {
    const { exam, room, reporting_time, arrival_time, status, deadline_minutes } = duty;

    const handleMarkArrival = async () => {
        console.log('🔴 BUTTON CLICKED! Duty ID:', duty.id);
        console.log('🔴 Calling onMarkArrival...');
        await onMarkArrival(duty.id, reporting_time, deadline_minutes);
    };

    const isToday = () => {
        if (!exam?.date) return false;
        const today = new Date();
        const dutyDate = new Date(exam.date);

        // Compare just the date parts (ignore time)
        const isSameDay = (
            dutyDate.getFullYear() === today.getFullYear() &&
            dutyDate.getMonth() === today.getMonth() &&
            dutyDate.getDate() === today.getDate()
        );

        console.log('Date check:', {
            exam: exam?.name,
            dutyDate: exam?.date,
            today: today.toISOString().split('T')[0],
            isSameDay,
            status,
            canMarkArrival
        });

        return isSameDay;
    };

    const isWithinArrivalWindow = () => {
        if (!isToday() || !reporting_time) return false;

        const now = new Date();
        const [hours, minutes] = reporting_time.split(':').map(Number);

        // Create reporting time for today
        const reportingDateTime = new Date();
        reportingDateTime.setHours(hours, minutes, 0, 0);

        // Calculate 10 minutes before reporting time
        const windowStart = new Date(reportingDateTime.getTime() - 10 * 60 * 1000);

        // Button visible from 10 minutes before until reporting time
        return now >= windowStart && now <= reportingDateTime;
    };

    const showMarkButton = canMarkArrival && isToday() && status === 'pending';

    console.log('DutyCard:', {
        exam: exam?.name,
        showMarkButton,
        canMarkArrival,
        isToday: isToday(),
        status
    });

    return (
        <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{exam?.name || 'Unknown Exam'}</h3>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p>
                            <span className="font-medium">Room:</span> {room?.name || 'N/A'}
                            {room?.floor && ` (Floor ${room.floor})`}
                        </p>
                        <p>
                            <span className="font-medium">Date:</span>{' '}
                            {exam?.date ? format(new Date(exam.date), 'MMMM dd, yyyy') : 'N/A'}
                        </p>
                        <p>
                            <span className="font-medium">Exam Start:</span> {formatTime(exam?.start_time || reporting_time)}
                        </p>
                        <p>
                            <span className="font-medium">Exam End:</span> {formatTime(exam?.end_time || reporting_time)}
                        </p>
                        <p className="text-xs text-green-600 font-medium">
                            ⏰ Arrive before {getDeadlineTime(exam?.start_time || reporting_time, deadline_minutes)} to be on time
                        </p>
                        {arrival_time && (
                            <p>
                                <span className="font-medium">Arrived At:</span>{' '}
                                {format(new Date(arrival_time), 'hh:mm a')}
                            </p>
                        )}
                    </div>
                </div>

                <div className="ml-4 flex flex-col items-end space-y-2">
                    <StatusBadge status={status} />
                    {showMarkButton && (
                        <button
                            onClick={handleMarkArrival}
                            className="btn-primary text-sm"
                        >
                            ARRIVED 🥳
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
