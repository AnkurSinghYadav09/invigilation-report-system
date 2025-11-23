import { supabase } from '../supabase';

/**
 * Debug utility to check authentication and permissions
 * Helps diagnose why data operations might be failing
 */
export async function debugAuth() {
    try {
        console.log('🔍 Running auth debug...\n');

        // 1. Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error('❌ Error getting session:', sessionError);
            return;
        }

        if (!session) {
            console.warn('⚠️  No active session. User not logged in.');
            return;
        }

        console.log('✅ Session found:');
        console.log('   User ID:', session.user.id);
        console.log('   Email:', session.user.email);
        console.log('   User Metadata:', session.user.user_metadata);
        console.log('   App Metadata:', session.user.app_metadata);

        // 2. Decode JWT and check claims
        const accessToken = session.access_token;
        const parts = accessToken.split('.');
        
        if (parts.length === 3) {
            try {
                const payload = JSON.parse(atob(parts[1]));
                console.log('\n✅ JWT Payload:');
                console.log('   role:', payload.role || '(missing)');
                console.log('   instructor_id:', payload.instructor_id || '(missing)');
                console.log('   email:', payload.email);
                console.log('   sub (user_id):', payload.sub);
            } catch (e) {
                console.error('❌ Error decoding JWT:', e);
            }
        }

        // 3. Test read permissions
        console.log('\n📖 Testing read permissions...');
        const { data: instructors, error: readError } = await supabase
            .from('instructors')
            .select('id, name, email')
            .limit(1);

        if (readError) {
            console.error('❌ Cannot read instructors:', readError.message);
        } else {
            console.log('✅ Can read instructors:', instructors?.length || 0, 'found');
        }

        // 4. Test write permissions
        console.log('\n✍️  Testing write permissions...');
        const testData = {
            name: 'Test Instructor',
            email: `test-${Date.now()}@university.edu`,
            department: 'Testing'
        };

        const { data: insertResult, error: insertError } = await supabase
            .from('instructors')
            .insert([testData])
            .select();

        if (insertError) {
            console.error('❌ Cannot insert instructors:', insertError.message);
            console.error('   Details:', insertError.details);
            console.error('   Hint:', insertError.hint);
        } else {
            console.log('✅ Can insert instructors');
            
            // Clean up test data
            if (insertResult?.length > 0) {
                await supabase
                    .from('instructors')
                    .delete()
                    .eq('id', insertResult[0].id);
                console.log('   (Test record cleaned up)');
            }
        }

        // 5. Summary
        console.log('\n📋 SUMMARY:');
        const isAdmin = session.user.user_metadata?.role === 'admin';
        const isInstructor = session.user.user_metadata?.role === 'instructor';
        
        console.log('   Claimed role:', session.user.user_metadata?.role || '(missing)');
        console.log('   Is Admin:', isAdmin ? '✅ YES' : '❌ NO');
        console.log('   Is Instructor:', isInstructor ? '✅ YES' : '❌ NO');

        if (!isAdmin && !isInstructor) {
            console.warn('\n⚠️  WARNING: User has no valid role! Must set role in user metadata.');
            console.warn('   Fix: Go to Supabase Auth → Users → Edit your user');
            console.warn('   Add to User Metadata: {"role": "admin"}');
        }

    } catch (err) {
        console.error('❌ Debug error:', err);
    }
}

/**
 * Check if current user has admin role
 */
export async function isUserAdmin() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.user?.user_metadata?.role === 'admin';
    } catch (err) {
        console.error('Error checking admin status:', err);
        return false;
    }
}

/**
 * Check current JWT claims
 */
export async function getJWTClaims() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return null;

        const parts = session.access_token.split('.');
        if (parts.length !== 3) return null;

        return JSON.parse(atob(parts[1]));
    } catch (err) {
        console.error('Error getting JWT claims:', err);
        return null;
    }
}
