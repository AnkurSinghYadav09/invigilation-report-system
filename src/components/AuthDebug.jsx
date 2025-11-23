import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import { debugAuth } from '../lib/utils/authDebug';

/**
 * Debug Component - Shows current auth state and JWT info
 * Add this to any page to debug authentication issues
 */
export default function AuthDebug() {
    const { user, role, instructorId } = useAuthStore();
    const [jwtInfo, setJwtInfo] = useState(null);
    const [isDebugging, setIsDebugging] = useState(false);

    const handleDebug = async () => {
        setIsDebugging(true);
        await debugAuth();
        setIsDebugging(false);
    };

    return (
        <div className="fixed bottom-4 right-4 bg-white border-2 border-red-500 rounded-lg p-4 shadow-lg max-w-md z-50 max-h-96 overflow-y-auto">
            <h3 className="font-bold text-red-600 mb-2">🔧 Auth Debug Info</h3>

            <div className="space-y-2 text-sm">
                <div>
                    <strong>Email:</strong> {user?.email || 'Not logged in'}
                </div>
                <div>
                    <strong>Role (from store):</strong>
                    <span className={`ml-2 px-2 py-1 rounded ${role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {role || 'NULL'}
                    </span>
                </div>
                <div>
                    <strong>Instructor ID:</strong> {instructorId || 'NULL'}
                </div>

                <button
                    onClick={handleDebug}
                    disabled={isDebugging}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 disabled:opacity-50 w-full"
                >
                    {isDebugging ? 'Debugging...' : '🔍 Run Full Debug (Check Console)'}
                </button>

                {jwtInfo && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                        <div><strong>JWT Role:</strong> {jwtInfo.role || '❌ NULL'}</div>
                        <div><strong>User Metadata:</strong></div>
                        <pre className="text-xs overflow-auto">
                            {JSON.stringify(jwtInfo.userMetadata, null, 2)}
                        </pre>
                    </div>
                )}

                <div className="mt-2 text-xs text-gray-600 bg-yellow-50 p-2 rounded">
                    <strong>⚠️ If role is NULL:</strong>
                    <ol className="list-decimal list-inside mt-1">
                        <li>Open your browser console (F12)</li>
                        <li>Click "Run Full Debug" button</li>
                        <li>Read the output to find the issue</li>
                        <li>Check Supabase → Auth → Users → Edit your user</li>
                        <li>Set User Metadata: {'{'}
"role": "admin"{'}'}
                        </li>
                        <li>Logout and login again</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
