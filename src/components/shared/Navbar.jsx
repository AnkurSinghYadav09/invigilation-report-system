import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';

/**
 * Navbar Component
 * Role-based navigation with mobile responsiveness
 */
export default function Navbar() {
    const { user, role, logout } = useAuthStore();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const adminLinks = [
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/duties', label: 'Duties' },
        { to: '/admin/instructors', label: 'Instructors' },
        { to: '/admin/exams', label: 'Exams' },
        { to: '/admin/rooms', label: 'Rooms' }
    ];

    const instructorLinks = [
        { to: '/instructor/dashboard', label: 'Dashboard' },
        { to: '/instructor/profile', label: 'Profile' }
    ];

    const links = role === 'admin' ? adminLinks : instructorLinks;

    return (
        <nav className="bg-white shadow-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to={role === 'admin' ? '/admin/dashboard' : '/instructor/dashboard'} className="flex flex-col">
                            <span className="text-xl font-bold text-primary-600">IRS</span>
                            <span className="text-xs text-gray-500">Invigilation Report System</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-6">
                        {links.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* User Menu */}
                        <div className="ml-4 flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                {user?.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="btn-secondary text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
                        >
                            <span className="sr-only">Open menu</span>
                            {mobileMenuOpen ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200">
                    <div className="space-y-1 px-4 pb-3 pt-2">
                        {links.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="border-t border-gray-200 pt-2">
                            <p className="px-3 text-sm text-gray-600">{user?.email}</p>
                            <button
                                onClick={handleLogout}
                                className="mt-2 w-full btn-secondary text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
