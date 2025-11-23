// Run this in browser console to check your JWT
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token;
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('=== JWT DEBUG ===');
console.log('Full payload:', payload);
console.log('Role claim:', payload.role);
console.log('User metadata:', payload.user_metadata);
console.log('App metadata:', payload.app_metadata);
