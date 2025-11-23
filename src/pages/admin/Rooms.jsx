import { useState } from 'react';
import { useRooms } from '../../lib/hooks/useExamsRooms';
import Navbar from '../../components/shared/Navbar';

/**
 * Admin Rooms Management Page
 * Create, edit, and delete examination rooms
 */
export default function RoomsManagement() {
    const { rooms, loading, createRoom, updateRoom, deleteRoom } = useRooms();
    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        building: '',
        capacity: '',
        floor: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const roomData = {
            ...formData,
            capacity: parseInt(formData.capacity)
        };

        if (editingRoom) {
            await updateRoom(editingRoom.id, roomData);
        } else {
            await createRoom(roomData);
        }

        // Reset form
        setFormData({
            name: '',
            building: '',
            capacity: '',
            floor: ''
        });
        setShowForm(false);
        setEditingRoom(null);
    };

    const handleEdit = (room) => {
        setEditingRoom(room);
        setFormData({
            name: room.name,
            building: room.building,
            capacity: room.capacity.toString(),
            floor: room.floor || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            await deleteRoom(id);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingRoom(null);
        setFormData({
            name: '',
            building: '',
            capacity: '',
            floor: ''
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading rooms...</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
                        <p className="mt-2 text-gray-600">Manage examination venues</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary"
                    >
                        {showForm ? 'Cancel' : '+ Add New Room'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="card mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            {editingRoom ? 'Edit Room' : 'Add New Room'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Room Name/Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., Room 101"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Building *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.building}
                                        onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., Main Building"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Capacity *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., 50"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Floor
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.floor}
                                        onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                                        className="input-field"
                                        placeholder="e.g., 1st Floor"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button type="submit" className="btn-primary">
                                    {editingRoom ? 'Update Room' : 'Add Room'}
                                </button>
                                <button type="button" onClick={handleCancel} className="btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Rooms List */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">All Rooms</h2>

                    {rooms.length === 0 ? (
                        <p className="text-center py-12 text-gray-500">
                            No rooms added yet. Click "Add New Room" to get started.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rooms.map((room) => (
                                <div key={room.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                                            <p className="text-sm text-gray-500">{room.building}</p>
                                            {room.floor && (
                                                <p className="text-sm text-gray-500">{room.floor}</p>
                                            )}
                                        </div>
                                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                                            {room.capacity} seats
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => handleEdit(room)}
                                            className="flex-1 text-sm text-primary-600 hover:text-primary-900 font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(room.id)}
                                            className="flex-1 text-sm text-danger-600 hover:text-danger-900 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
