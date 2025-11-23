import { useState } from 'react';
import { useInstructors } from '../../lib/hooks/useInstructors';
import Navbar from '../../components/shared/Navbar';

/**
 * Admin Instructors Management Page
 * Create, edit, and delete instructors (invigilators)
 */
export default function InstructorsManagement() {
    const { instructors, loading, createInstructor, updateInstructor, deleteInstructor } = useInstructors();
    const [showForm, setShowForm] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        phone: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (editingInstructor) {
            await updateInstructor(editingInstructor.id, formData);
        } else {
            await createInstructor(formData);
        }

        // Reset form
        setFormData({
            name: '',
            email: '',
            department: '',
            phone: ''
        });
        setShowForm(false);
        setEditingInstructor(null);
    };

    const handleEdit = (instructor) => {
        setEditingInstructor(instructor);
        setFormData({
            name: instructor.name,
            email: instructor.email,
            department: instructor.department || '',
            phone: instructor.phone || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this instructor? This will also delete all their duty assignments.')) {
            await deleteInstructor(id);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingInstructor(null);
        setFormData({
            name: '',
            email: '',
            department: '',
            phone: ''
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading instructors...</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">Instructor Management</h1>
                        <p className="mt-2 text-gray-600">Add and manage invigilators</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary"
                    >
                        {showForm ? 'Cancel' : '+ Add New Instructor'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="card mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            {editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., Dr. John Smith"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., john.smith@university.edu"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department *
                                    </label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Computer Science">Computer Science</option>
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="Physics">Physics</option>
                                        <option value="Chemistry">Chemistry</option>
                                        <option value="Biology">Biology</option>
                                        <option value="Engineering">Engineering</option>
                                        <option value="Business">Business</option>
                                        <option value="Arts">Arts</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., +1 234 567 8900"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button type="submit" className="btn-primary">
                                    {editingInstructor ? 'Update Instructor' : 'Add Instructor'}
                                </button>
                                <button type="button" onClick={handleCancel} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Instructors List */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">All Instructors</h2>

                    {instructors.length === 0 ? (
                        <p className="text-center py-12 text-gray-500">
                            No instructors added yet. Click "Add New Instructor" to get started.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total Duties
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Punctuality
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {instructors.map((instructor) => {
                                        const totalCompleted = (instructor.on_time_count || 0) + (instructor.late_count || 0);
                                        const punctualityRate = totalCompleted > 0
                                            ? Math.round(((instructor.on_time_count || 0) / totalCompleted) * 100)
                                            : 0;

                                        return (
                                            <tr key={instructor.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                                                    {instructor.phone && (
                                                        <div className="text-sm text-gray-500">{instructor.phone}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {instructor.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {instructor.department}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {instructor.total_duties || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {totalCompleted > 0 ? (
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${punctualityRate >= 90
                                                                ? 'bg-success-100 text-success-800'
                                                                : punctualityRate >= 70
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-danger-100 text-danger-800'
                                                            }`}>
                                                            {punctualityRate}%
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(instructor)}
                                                        className="text-primary-600 hover:text-primary-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(instructor.id)}
                                                        className="text-danger-600 hover:text-danger-900"
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
                    )}
                </div>
            </div>
        </div>
    );
}
