import { useState } from 'react';
import { useDuties } from '../../lib/hooks/useDuties';
import { useInstructors } from '../../lib/hooks/useInstructors';
import { useExams } from '../../lib/hooks/useExamsRooms';
import { useRooms } from '../../lib/hooks/useExamsRooms';
import { suggestInstructor } from '../../lib/utils/workload';
import Navbar from '../../components/shared/Navbar';
import StatusBadge from '../../components/shared/StatusBadge';
import { format } from 'date-fns';

/**
 * Admin Duties Management Page
 * Exam-centric view with current/upcoming/past sections
 */
export default function DutiesManagement() {
    const { duties, loading: dutiesLoading, createDuty, updateDuty, deleteDuty } = useDuties();
    const { instructors, loading: instructorsLoading } = useInstructors();
    const { exams, loading: examsLoading } = useExams();
    const { rooms, loading: roomsLoading } = useRooms();

    const [showForm, setShowForm] = useState(false);
    const [editingDuty, setEditingDuty] = useState(null);
    const [expandedExams, setExpandedExams] = useState(new Set());
    const [formData, setFormData] = useState({
        exam_id: '',
        instructor_id: '',
        room_id: '',
        reporting_time: '',
        deadline_minutes: 30
    });
    const [suggestion, setSuggestion] = useState(null);

    const loading = dutiesLoading || instructorsLoading || examsLoading || roomsLoading;

    // Group duties by exam
    const groupDutiesByExam = () => {
        const grouped = {};

        duties.forEach(duty => {
            const examId = duty.exam_id;
            if (!grouped[examId]) {
                grouped[examId] = [];
            }
            grouped[examId].push(duty);
        });

        // Sort duties within each exam by room number
        Object.keys(grouped).forEach(examId => {
            grouped[examId].sort((a, b) => {
                const roomA = a.room?.name || '';
                const roomB = b.room?.name || '';
                return roomA.localeCompare(roomB, undefined, { numeric: true });
            });
        });

        return grouped;
    };

    // Categorize exams into current, upcoming, and past
    const categorizeExams = () => {
        const dutiesByExam = groupDutiesByExam();
        const now = new Date();

        const current = [];
        const upcoming = [];
        const past = [];

        Object.entries(dutiesByExam).forEach(([examId, examDuties]) => {
            const exam = exams.find(e => e.id === examId);
            if (!exam) return;

            const examDate = new Date(exam.date);

            // Get reporting time from first duty
            const reportingTime = examDuties[0]?.reporting_time || '00:00';
            const [hours, minutes] = reportingTime.split(':').map(Number);

            const examDateTime = new Date(examDate);
            examDateTime.setHours(hours, minutes, 0, 0);

            // Exam ends 3 hours after start
            const examEnd = new Date(examDateTime.getTime() + 3 * 60 * 60 * 1000);

            if (now >= examDateTime && now <= examEnd) {
                current.push({ exam, duties: examDuties });
            } else if (examDateTime > now) {
                upcoming.push({ exam, duties: examDuties });
            } else {
                past.push({ exam, duties: examDuties });
            }
        });

        // Sort
        current.sort((a, b) => new Date(a.exam.date) - new Date(b.exam.date));
        upcoming.sort((a, b) => new Date(a.exam.date) - new Date(b.exam.date));
        past.sort((a, b) => new Date(b.exam.date) - new Date(a.exam.date));

        return { current, upcoming, past };
    };

    // Check arrival status for real-time monitoring
    const getArrivalStatus = (duty) => {
        const now = new Date();
        const examDate = new Date(duty.exam?.date);
        const [hours, minutes] = (duty.reporting_time || '00:00').split(':').map(Number);

        const reportingDateTime = new Date(examDate);
        reportingDateTime.setHours(hours, minutes, 0, 0);

        // If reporting time has passed
        if (now >= reportingDateTime) {
            if (!duty.arrival_time) {
                return 'missing'; // RED - not arrived yet
            } else {
                return 'arrived'; // GREEN - has arrived
            }
        }

        return 'pending'; // Normal - before reporting time
    };

    const toggleExam = (examId) => {
        const newExpanded = new Set(expandedExams);
        if (newExpanded.has(examId)) {
            newExpanded.delete(examId);
        } else {
            newExpanded.add(examId);
        }
        setExpandedExams(newExpanded);
    };

    const handleExamChange = (examId) => {
        setFormData({ ...formData, exam_id: examId });
        if (examId && instructors.length > 0) {
            const suggested = suggestInstructor(instructors);
            setSuggestion(suggested);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingDuty) {
            await updateDuty(editingDuty.id, formData);
        } else {
            await createDuty(formData);
        }
        setFormData({ exam_id: '', instructor_id: '', room_id: '', reporting_time: '', deadline_minutes: 30 });
        setSuggestion(null);
        setShowForm(false);
        setEditingDuty(null);
    };

    const handleEdit = (duty) => {
        setEditingDuty(duty);
        setFormData({
            exam_id: duty.exam_id,
            instructor_id: duty.instructor_id,
            room_id: duty.room_id,
            reporting_time: duty.reporting_time,
            deadline_minutes: duty.deadline_minutes || 30
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this duty assignment?')) {
            await deleteDuty(id);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingDuty(null);
        setSuggestion(null);
        setFormData({ exam_id: '', instructor_id: '', room_id: '', reporting_time: '', deadline_minutes: 30 });
    };

    // Render exam section
    const renderExamSection = (examData) => {
        const { exam, duties: examDuties } = examData;
        const isExpanded = expandedExams.has(exam.id);

        // Calculate stats
        const onTimeCount = examDuties.filter(d => d.status === 'on-time').length;
        const lateCount = examDuties.filter(d => d.status === 'late').length;
        const missingCount = examDuties.filter(d => getArrivalStatus(d) === 'missing').length;

        return (
            <div key={exam.id} className="card mb-4">
                {/* Exam Header - Clickable */}
                <div
                    onClick={() => toggleExam(exam.id)}
                    className="cursor-pointer flex items-center justify-between hover:bg-gray-50 -m-6 p-6 rounded-lg transition-colors"
                >
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{exam.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            📅 {format(new Date(exam.date), 'MMMM dd, yyyy')} •
                            🕐 {examDuties[0]?.reporting_time || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                            👥 {examDuties.length} instructor{examDuties.length !== 1 ? 's' : ''} assigned
                        </p>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Quick Stats */}
                        {missingCount > 0 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700">
                                ⚠️ {missingCount} NOT ARRIVED
                            </span>
                        )}
                        {onTimeCount > 0 && (
                            <span className="text-green-600 font-medium text-sm">
                                {onTimeCount} ON TIME
                            </span>
                        )}
                        {lateCount > 0 && (
                            <span className="text-red-600 font-medium text-sm">
                                {lateCount} LATE
                            </span>
                        )}

                        {/* Expand Icon */}
                        <svg
                            className={`w-6 h-6 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Room
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Instructor
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Reporting Time
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Arrival Time
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {examDuties.map((duty) => {
                                        const arrivalStatus = getArrivalStatus(duty);
                                        const rowClass = arrivalStatus === 'missing'
                                            ? 'bg-red-50'
                                            : arrivalStatus === 'arrived'
                                                ? 'bg-green-50'
                                                : '';
                                        const nameClass = arrivalStatus === 'missing'
                                            ? 'font-bold text-red-700'
                                            : 'text-gray-900';

                                        return (
                                            <tr key={duty.id} className={rowClass}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {duty.room?.name || 'N/A'}
                                                    {duty.room?.floor && ` (Floor ${duty.room.floor})`}
                                                </td>
                                                <td className={`px-4 py-3 whitespace-nowrap text-sm ${nameClass}`}>
                                                    {arrivalStatus === 'missing' && '⚠️ '}
                                                    {duty.instructor?.name || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {duty.reporting_time || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                    {duty.arrival_time
                                                        ? format(new Date(duty.arrival_time), 'hh:mm:ss a')
                                                        : arrivalStatus === 'missing'
                                                            ? '🔴 NOT ARRIVED'
                                                            : '-'
                                                    }
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <StatusBadge status={duty.status} />
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(duty)}
                                                        className="text-primary-600 hover:text-primary-900 font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(duty.id)}
                                                        className="text-danger-600 hover:text-danger-900 font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };

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

    const { current, upcoming, past } = categorizeExams();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Duty Management</h1>
                        <p className="mt-2 text-gray-600">Assign instructors to exams and track arrivals</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-primary"
                    >
                        + Assign Duty
                    </button>
                </div>

                {/* Assignment Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    {editingDuty ? 'Edit Duty Assignment' : 'Assign New Duty'}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Exam Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Exam *
                                        </label>
                                        <select
                                            value={formData.exam_id}
                                            onChange={(e) => handleExamChange(e.target.value)}
                                            className="input"
                                            required
                                        >
                                            <option value="">Select an exam</option>
                                            {exams.map(exam => (
                                                <option key={exam.id} value={exam.id}>
                                                    {exam.name} - {format(new Date(exam.date), 'MMM dd, yyyy')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Instructor Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Instructor *
                                        </label>
                                        <select
                                            value={formData.instructor_id}
                                            onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
                                            className="input"
                                            required
                                        >
                                            <option value="">Select an instructor</option>
                                            {instructors.map(instructor => (
                                                <option key={instructor.id} value={instructor.id}>
                                                    {instructor.name} - {instructor.department}
                                                </option>
                                            ))}
                                        </select>
                                        {suggestion && (
                                            <p className="mt-2 text-sm text-primary-600">
                                                💡 Suggested: {suggestion.recommendation}
                                            </p>
                                        )}
                                    </div>

                                    {/* Room Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Room *
                                        </label>
                                        <select
                                            value={formData.room_id}
                                            onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                                            className="input"
                                            required
                                        >
                                            <option value="">Select a room</option>
                                            {rooms.map(room => (
                                                <option key={room.id} value={room.id}>
                                                    {room.name} - Floor {room.floor} (Capacity: {room.capacity})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Reporting Time */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Reporting Time *
                                            </label>
                                            <input
                                                type="time"
                                                value={formData.reporting_time}
                                                onChange={(e) => setFormData({ ...formData, reporting_time: e.target.value })}
                                                className="input"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Deadline Buffer (min)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="120"
                                                value={formData.deadline_minutes}
                                                onChange={(e) => setFormData({ ...formData, deadline_minutes: parseInt(e.target.value) })}
                                                className="input"
                                                required
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Minutes before reporting time to be on-time</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end space-x-3 pt-4 border-t">
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-primary">
                                            {editingDuty ? 'Update' : 'Assign'} Duty
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Current/Ongoing Exams */}
                {current.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-red-600 mb-6">🔴 Current/Ongoing Exams</h2>
                        {current.map(renderExamSection)}
                    </div>
                )}

                {/* Upcoming Exams */}
                {upcoming.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-yellow-600 mb-6">🟡 Upcoming Scheduled Exams</h2>
                        {upcoming.map(renderExamSection)}
                    </div>
                )}

                {/* Past Exams */}
                {past.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-green-600 mb-6">Past Exams</h2>
                        {past.map(renderExamSection)}
                    </div>
                )}

                {/* Empty State */}
                {current.length === 0 && upcoming.length === 0 && past.length === 0 && (
                    <div className="card text-center py-12">
                        <p className="text-gray-500 text-lg">No duty assignments yet</p>
                        <p className="text-gray-400 mt-2">Click "Assign Duty" to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}
