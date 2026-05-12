import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import IncidentRow from './incidentRow';
import { logout } from '../auth/actions'; // Using the centralized logout logic

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

  // Security Check: Verify user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetching the incident reports with the latest first
  const { data: reports } = await supabase
    .from('incident_reports')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* SYNCED TOP NAVIGATION BAR */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-cavite-maroon text-white px-3 py-1.5 rounded-lg font-black text-lg shadow-sm">
            AMSIRS
          </div>
          <div className="hidden md:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none">
              Cavite National High School
            </p>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">
              Management Dashboard
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Personnel</p>
            <p className="text-xs font-bold text-cavite-maroon">{user.email}</p>
          </div>

          {/* Logout Form using the shared Server Action */}
          <form action={logout}>
            <button 
              type="submit"
              className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-cavite-maroon transition-all uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-200 hover:border-cavite-maroon/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </form>
        </div>
      </nav>

      <main className="p-6 md:p-12 max-w-7xl mx-auto">
        
        {/* DASHBOARD HEADER */}
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recent Incident Reports</h2>
          <p className="text-gray-500 font-medium mt-1">
            Official security logs for Cavite National High School. All descriptions are stored with <span className="text-cavite-maroon font-bold">AES-256 Encryption</span>.
          </p>
        </div>

        {/* STATS SUMMARY (Optional but helpful for non-tech users) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Reports</p>
            <p className="text-3xl font-black text-gray-900">{reports?.length || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">High Severity</p>
            <p className="text-3xl font-black text-red-600">
              {reports?.filter(r => r.severity === 'High').length || 0}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
            <p className="text-3xl font-black text-green-600">System Secure</p>
          </div>
        </div>

        {/* THE INCIDENT TABLE */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date & Time</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student Involved</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Location</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Severity</th>
                  <th className="p-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <IncidentRow key={report.id} report={report} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path></svg>
                        <p className="text-lg font-bold uppercase tracking-widest">No reports found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.4em]">
            AMSIRS Security Intelligence Interface
          </p>
        </footer>
      </main>
    </div>
  );
}