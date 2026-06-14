import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ActionForm from '../components/ActionForm';
import { revokeSession } from './actions';

export default async function ActiveSessionsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
    {
      cookies: { getAll() { return cookieStore.getAll() } }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: adminAuth } = await supabase
    .from('system_admins')
    .select('id, role')
    .eq('id', user?.id)
    .maybeSingle();

  if (!adminAuth || adminAuth.role !== 'super_admin') redirect('/unauthorized');

  // Fetch active sessions
  const { data: activeSessionsData } = await supabase
    .from('active_sessions')
    .select('*')
    .eq('is_active', true)
    .order('last_active_at', { ascending: false });

  const activeSessions = activeSessionsData || [];

  // Extract user IDs
  const userIds = activeSessions.map(s => s.user_id);

  // Fetch corresponding staff profiles and system admins manually
  // This avoids foreign key setup issues
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, first_name, last_name, role')
    .in('id', userIds);

  const { data: admins } = await supabase
    .from('system_admins')
    .select('id, role')
    .in('id', userIds);

  const profileMap = new Map((profiles || []).map(p => [p.id, p]));
  const adminMap = new Map((admins || []).map(a => [a.id, a]));

  // Combine and filter out users who are purely students (not in profiles or admins)
  const combinedSessions = activeSessions
    .map(session => {
      const profile = profileMap.get(session.user_id);
      const admin = adminMap.get(session.user_id);
      
      let displayName = 'Unknown User';
      let displayRole = 'Unknown Role';

      if (profile) {
        displayName = `${profile.first_name} ${profile.last_name}`;
        displayRole = profile.role === 'guard' ? 'Guard' :
                      profile.role === 'guidance' ? 'Guidance' : profile.role;
      } else if (admin) {
        displayName = 'Administrator';
        displayRole = admin.role === 'super_admin' ? 'Super Admin' :
                      admin.role === 'school_admin' ? 'School Admin' :
                      admin.role === 'it_admin' ? 'IT Admin' : admin.role;
      }

      return {
        ...session,
        displayName,
        displayRole,
        isStaffOrAdmin: !!(profile || admin),
        isSelf: session.user_id === user?.id
      };
    })
    .filter(s => s.isStaffOrAdmin); // Exclude students

  // Helper to format timestamps cleanly
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('en-PH', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <main className="sys-container w-full">
      <div className="mb-10">
        <h1 className="sys-title">Active Sessions</h1>
        <p className="sys-subtitle">Monitor and revoke staff access across devices.</p>
      </div>

      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="sys-card">
          <div className="p-4 border-b border-cavite-border bg-zinc-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="sys-label m-0 text-sm">Currently Active Staff Devices</h3>
          </div>
          <div className="sys-table-wrapper max-h-[600px] overflow-auto">
            <table className="sys-table">
              <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
              <tr className="table-header-row">
                <th className="table-th min-w-[180px]">User Name</th>
                <th className="table-th min-w-[120px]">Role</th>
                <th className="table-th min-w-[180px]">Device Info</th>
                <th className="table-th min-w-[140px]">IP Address</th>
                <th className="table-th min-w-[140px]">Logged In At</th>
                <th className="table-th min-w-[120px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {combinedSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-16 text-center text-zinc-400 bg-white">
                    <p className="text-base font-medium">No active staff sessions found.</p>
                  </td>
                </tr>
              ) : (combinedSessions.map((session) => {
                return (
                  <tr key={session.session_id} className="hover:bg-gray-50 group transition-colors">
                    
                    <td className="table-td" data-label="User Name">
                      <span className="text-sm font-medium px-2 py-1 block w-full min-w-[160px] flex items-center gap-2">
                        {session.displayName}
                        {session.isSelf && <span className="text-[10px] bg-cavite-light text-cavite-maroon px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">You</span>}
                      </span>
                    </td>

                    <td className="table-td" data-label="Role">
                      <span className="text-sm font-medium px-2 py-1 block w-full max-w-[120px]">
                        {session.displayRole}
                      </span>
                    </td>

                    <td className="table-td" data-label="Device Info">
                      <span className="text-sm text-zinc-600 px-2 py-1 block w-full">
                        {session.device_info || 'Unknown Device'}
                      </span>
                    </td>

                    <td className="table-td text-zinc-500 font-mono text-xs" data-label="IP Address">
                      {session.ip_address || '—'}
                    </td>

                    <td className="table-td text-zinc-500 text-sm whitespace-nowrap" data-label="Logged In At">
                      {formatDateTime(session.created_at)}
                    </td>

                    <td className="table-td text-right" data-label="Actions">
                      <div className="flex justify-end gap-2 items-center">
                        <ActionForm action={revokeSession} confirmMessage={`Are you sure you want to forcibly logout ${session.displayName}?`}>
                          <input type="hidden" name="sessionId" value={session.session_id} />
                          <input type="hidden" name="userId" value={session.user_id} />
                          <button type="submit" className="px-3 py-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm border border-red-100" disabled={session.isSelf}>
                            <span className="hidden sm:inline">Revoke</span>
                          </button>
                        </ActionForm>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </main>
  );
}
