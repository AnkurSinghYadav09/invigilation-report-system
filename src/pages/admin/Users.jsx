import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Navbar from '../../components/shared/Navbar';

/**
 * Admin Users Management Page
 * View and manage user accounts and roles
 */
export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [showLinkModal, setShowLinkModal] = useState(null);
    const [selectedInstructor, setSelectedInstructor] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchInstructors();
    }, []);

    const fetchInstructors = async () => {
        try {
            const { data, error } = await supabase
                .from('instructors')
                .select('id, name, email, department')
                .order('name');

            if (error) throw error;
            setInstructors(data || []);
        } catch (err) {
            console.error('Error fetching instructors:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);

            // Call our custom database function that returns users as JSON
            const { data, error } = await supabase.rpc('get_all_users');

            if (error) {
                console.error('Error fetching users:', error);
                throw error;
            }

            console.log('Users fetched:', data);

            // Data is returned as JSON, parse it if it's a string
            const usersArray = typeof data === 'string' ? JSON.parse(data) : data;
            setUsers(Array.isArray(usersArray) ? usersArray : []);
        } catch (err) {
            console.error('Error fetching users:', err);
            alert(`Failed to fetch users: ${err.message}\n\nMake sure you:\n1. Re-ran supabase/admin-user-functions.sql (it was updated!)\n2. Are logged in as admin\n3. Logged out and logged in again after becoming admin`);
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            setUpdating(userId);

            // Call our custom database function to update user role
            const { error } = await supabase.rpc('update_user_role', {
                user_id: userId,
                new_role: newRole
            });

            if (error) {
                console.error('Error updating role:', error);
                throw error;
            }

            alert(`User role updated to ${newRole}!\n\nThe user needs to logout and login again for changes to take effect.`);
            await fetchUsers();
        } catch (err) {
            console.error('Error updating user role:', err);
            alert(`Failed to update user role: ${err.message}`);
        } finally {
            setUpdating(null);
        }
    };

    const linkInstructor = async (userId, instructorId) => {
        try {
            setUpdating(userId);

            // Update user metadata with instructor_id
            const { error } = await supabase.rpc('update_user_metadata', {
                user_id: userId,
                new_role: 'instructor',
                new_instructor_id: instructorId
            });

            if (error) throw error;

            alert('Instructor linked successfully!\n\nUser needs to logout and login again to see their duties.');
            setShowLinkModal(null);
            setSelectedInstructor('');
            await fetchUsers();
        } catch (err) {
            console.error('Error linking instructor:', err);
            alert(`Failed to link instructor: ${err.message}`);
        } finally {
            setUpdating(null);
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?\n\nThis action cannot be undone.')) {
            return;
        }

        try {
            setUpdating(userId);

            // Call our custom database function to delete user
            const { error } = await supabase.rpc('delete_user_account', {
                user_id: userId
            });

            if (error) {
                console.error('Error deleting user:', error);
                throw error;
            }

            alert('User deleted successfully!');
            await fetchUsers();
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(`Failed to delete user: ${err.message}`);
        } finally {
            setUpdating(null);
        }
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800';
            case 'instructor':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading users...</p>
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
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="mt-2 text-gray-600">Manage user accounts and roles</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-4">
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg shadow p-4">
                        <p className="text-sm text-purple-600">Admins</p>
                        <p className="text-2xl font-bold text-purple-900">
                            {users.filter(u => u.role === 'admin').length}
                        </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg shadow p-4">
                        <p className="text-sm text-blue-600">Instructors</p>
                        <p className="text-2xl font-bold text-blue-900">
                            {users.filter(u => u.role === 'instructor').length}
                        </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg shadow p-4">
                        <p className="text-sm text-yellow-600">Pending Approval</p>
                        <p className="text-2xl font-bold text-yellow-900">
                            {users.filter(u => u.role === 'pending').length}
                        </p>
                    </div>
                </div>

                {/* Pending Users Alert */}
                {users.some(u => u.role === 'pending') && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-yellow-900 mb-2">
                            ⚠️ Pending Approvals
                        </h3>
                        <p className="text-yellow-700 text-sm">
                            {users.filter(u => u.role === 'pending').length} user(s) are waiting for role assignment.
                        </p>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.name || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                                                {user.role || 'none'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                            {user.role !== 'admin' && (
                                                <button
                                                    onClick={() => updateUserRole(user.id, 'admin')}
                                                    disabled={updating === user.id}
                                                    className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                                                >
                                                    Make Admin
                                                </button>
                                            )}
                                            {user.role !== 'instructor' && (
                                                <button
                                                    onClick={() => {
                                                        setShowLinkModal(user.id);
                                                        setSelectedInstructor('');
                                                    }}
                                                    disabled={updating === user.id}
                                                    className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                                >
                                                    Make Instructor
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                disabled={updating === user.id}
                                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {users.length === 0 && (
                            <p className="text-center py-8 text-gray-500">No users found</p>
                        )}
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 How User Management Works</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• New signups get <strong>role: pending</strong> automatically</li>
                        <li>• Click <strong>"Make Admin"</strong> to make user an admin</li>
                        <li>• Click <strong>"Make Instructor"</strong> and select an instructor profile to link</li>
                        <li>• Users must <strong>logout and login again</strong> for the role change to take effect</li>
                        <li>• Deleting a user is permanent and cannot be undone</li>
                    </ul>
                </div>
            </div>

            {/* Link Instructor Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Link Instructor Profile
                        </h3>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Select an instructor profile to link with this user:
                            </p>

                            <select
                                value={selectedInstructor}
                                onChange={(e) => setSelectedInstructor(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Select Instructor --</option>
                                {instructors.map((instructor) => (
                                    <option key={instructor.id} value={instructor.id}>
                                        {instructor.name} ({instructor.email})
                                    </option>
                                ))}
                            </select>

                            {instructors.length === 0 && (
                                <p className="mt-2 text-sm text-orange-600">
                                    ⚠️ No instructor profiles found. Please create instructors first in the Instructors page.
                                </p>
                            )}
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={() => {
                                    if (!selectedInstructor) {
                                        alert('Please select an instructor');
                                        return;
                                    }
                                    linkInstructor(showLinkModal, selectedInstructor);
                                }}
                                disabled={!selectedInstructor || updating === showLinkModal}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Link Instructor
                            </button>
                            <button
                                onClick={() => {
                                    setShowLinkModal(null);
                                    setSelectedInstructor('');
                                }}
                                disabled={updating === showLinkModal}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
