import { useState } from 'react';
import { useExams } from '../../lib/hooks/useExamsRooms';
import Navbar from '../../components/shared/Navbar';

/**
 * Admin Exams Management Page
 * Create, edit, and delete exams
 */
export default function ExamsManagement() {
    const { exams, loading, createExam, updateExam, deleteExam } = useExams();
    const [showForm, setShowForm] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        start_time: '',
        end_time: '',
        subject: '',
        course_code: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (editingExam) {
            await updateExam(editingExam.id, formData);
        } else {
            await createExam(formData);
        }

        // Reset form
        setFormData({
            name: '',
            date: '',
            start_time: '',
            end_time: '',
            subject: '',
            course_code: ''
        });
        setShowForm(false);
        setEditingExam(null);
    };

    const handleEdit = (exam) => {
        setEditingExam(exam);
        setFormData({
            name: exam.name,
            date: exam.date,
            start_time: exam.start_time,
            end_time: exam.end_time,
            subject: exam.subject || '',
            course_code: exam.course_code || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this exam?')) {
            await deleteExam(id);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingExam(null);
        setFormData({
            name: '',
            date: '',
            start_time: '',
            end_time: '',
            subject: '',
            course_code: ''
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading exams...</p>
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
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
                        <p className="mt-2 text-gray-600">Create and manage exam schedules</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary"
                    >
                        {showForm ? 'Cancel' : '+ Add New Exam'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="card mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            {editingExam ? 'Edit Exam' : 'Create New Exam'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Exam Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., Mid-Term Examination"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Course Code
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.course_code}
                                        onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., CS101"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., Computer Science"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Time *
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Time *
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button type="submit" className="btn-primary">
                                    {editingExam ? 'Update Exam' : 'Create Exam'}
                                </button>
                                <button type="button" onClick={handleCancel} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Exams List */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">All Exams</h2>

                    {exams.length === 0 ? (
                        <p className="text-center py-12 text-gray-500">
                            No exams created yet. Click "Add New Exam" to get started.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Exam Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Course Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {exams.map((exam) => (
                                        <tr key={exam.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{exam.name}</div>
                                                {exam.subject && (
                                                    <div className="text-sm text-gray-500">{exam.subject}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {exam.course_code || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(exam.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {exam.start_time} - {exam.end_time}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleEdit(exam)}
                                                    className="text-primary-600 hover:text-primary-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exam.id)}
                                                    className="text-danger-600 hover:text-danger-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
