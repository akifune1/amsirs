import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import IncidentRow from './incidentRow';
import { logout } from '../auth/actions';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
      cookies: { 
        getAll() { return cookieStore.getAll() } 
      } 
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: reports } = await supabase
    .from('incident_reports')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen font-sans">
      
      {/* SYNCED TOP NAVIGATION BAR */}
      <nav className="sys-navbar">
        <div className="flex items-center gap-3">
          <div className="badge-primary">AMSIRS</div>
          <div className="hidden md:block">
            <p className="sys-label leading-none">Cavite National High School</p>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">Management Dashboard</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="sys-label text-gray-400">Active Personnel</p>
            <p className="text-xs font-bold text-cavite-maroon mt-0.5">{user.email}</p>
          </div>

          <form action={logout}>
            <button type="submit" className="btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </form>
        </div>
      </nav>

      <main className="sys-container">
        
        {/* DASHBOARD HEADER */}
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight">Recent Incident Reports</h2>
          <p className="text-gray-500 font-medium mt-1">
            Official security logs for Cavite National High School. All descriptions are stored with <span className="text-cavite-maroon font-bold">AES-256 Encryption</span>.
          </p>
        </div>

        {/* STATS SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="stat-card">
            <p className="sys-label">Total Reports</p>
            <p className="stat-value">{reports?.length || 0}</p>
          </div>
          <div className="stat-card">
            <p className="sys-label">High Severity</p>
            <p className="stat-value-danger">
              {reports?.filter(r => r.severity === 'High').length || 0}
            </p>
          </div>
          <div className="stat-card">
            <p className="sys-label">Status</p>
            <p className="stat-value-success">System Secure</p>
          </div>
        </div>

        {/* THE INCIDENT TABLE */}
        <div className="sys-card">
          <div className="sys-table-wrapper">
            <table className="sys-table">
              <thead>
                <tr className="table-header-row">
                  <th className="table-th">Date & Time</th>
                  <th className="table-th">Student Involved</th>
                  <th className="table-th">Location</th>
                  <th className="table-th">Severity</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cavite-border/50">
                {reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <IncidentRow key={report.id} report={report} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center bg-white">
                      <div className="flex flex-col items-center text-gray-400">
                        <svg className="w-10 h-10 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path></svg>
                        <p className="text-sm font-medium">No reports found in the secure vault.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="mt-12 text-center">
          <p className="sys-label tracking-[0.4em]">
            AMSIRS Security Intelligence Interface
          </p>
        </footer>
      </main>
    </div>
  );
}