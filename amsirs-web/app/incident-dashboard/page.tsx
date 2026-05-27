import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import IncidentRow from './incidentRow';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { logout } from '../auth/actions';

// This forces the page to always fetch fresh data (no caching)
export const revalidate = 0; 

export default async function DashboardPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = props.searchParams ? await props.searchParams : {};
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

  // ==========================================
  // UPDATED NESTED QUERY: 
  // We are grabbing the report AND the linked students
  // ==========================================
  const { data: reports } = await supabase
    .from('incident_reports')
    .select(`
      *,
      incident_involvements (
        id,
        students ( 
          id, 
          student_id, 
          first_name, 
          last_name, 
          grade_level 
        )
      )
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen font-sans">
      

      <main className="sys-container">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight">Recent Incident Reports</h2>
          <p className="text-gray-500 font-medium mt-1">
            Official security logs for Cavite National High School. All descriptions are stored with <span className="text-cavite-maroon font-bold">AES-256 Encryption</span>.
          </p>
        </div>

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