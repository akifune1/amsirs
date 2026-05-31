import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import IncidentRow from './incidentRow';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import FilterDropdown from '../components/FilterDropdown';
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
  const q = (searchParams?.q as string) || '';
  const page = Number(searchParams?.page) || 1;
  const severity = (searchParams?.severity as string) || '';
  const timeframe = (searchParams?.timeframe as string) || '';
  const ITEMS_PER_PAGE = 10;

  let query = supabase
    .from('incident_reports')
    .select(`
      *,
      incident_involvements (
        id,
        role,
        students ( 
          id, 
          student_id, 
          first_name, 
          last_name, 
          grade_level 
        )
      )
    `, { count: 'exact' });

  if (q) {
    query = query.or(`location.ilike.%${q}%,severity.ilike.%${q}%`);
  }
  if (severity) {
    query = query.eq('severity', severity);
  }
  if (timeframe) {
    const now = new Date();
    let dateRange = null;
    if (timeframe === '7days') dateRange = new Date(now.setDate(now.getDate() - 7));
    else if (timeframe === '30days') dateRange = new Date(now.setDate(now.getDate() - 30));
    
    if (dateRange) {
      query = query.gte('created_at', dateRange.toISOString());
    }
  }

  const { data: reports, count } = await query
    .order('created_at', { ascending: false })
    .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <>
      <main className="sys-container">
        <div className="mb-10">
          <h2 className="sys-title">Recent Incident Reports</h2>
          <p className="sys-subtitle mt-1">
            Official security logs for Cavite National High School. All descriptions are stored with <span className="font-semibold text-cavite-maroon">AES-256 Encryption</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Total Reports - Primary Gradient */}
          <div className="stat-card-primary">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl z-0"></div>
            <p className="stat-label-light">Total Reports</p>
            <p className="stat-value-light">{reports?.length || 0}</p>
          </div>
          
          {/* High Severity - Orange Gradient */}
          <div className="stat-card-orange">
            <p className="stat-label-light">High Severity</p>
            <p className="stat-value-light">
              {reports?.filter(r => r.severity === 'High').length || 0}
            </p>
          </div>
          
          {/* Status - Standard Soft Card */}
          <div className="stat-card">
            <p className="stat-label">Status</p>
            <p className="stat-value text-green-500">Secure</p>
          </div>
        </div>

        <div className="sys-card">
          <div className="p-4 border-b border-cavite-border bg-zinc-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="sys-label m-0 text-sm">Filter Reports</h3>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <FilterDropdown paramName="timeframe" placeholder="Time" options={[{label:'All Time', value:'All'}, {label:'Last 7 Days', value:'7days'}, {label:'Last 30 Days', value:'30days'}]} />
              <FilterDropdown paramName="severity" placeholder="Severity" options={[{label:'All Severity', value:'All'}, {label:'High', value:'High'}, {label:'Medium', value:'Medium'}, {label:'Low', value:'Low'}]} />
              <div className="w-full sm:w-72">
                <SearchBar placeholder="Search by location or severity..." />
              </div>
            </div>
          </div>
          <div className="sys-table-wrapper max-h-[600px] overflow-auto">
            <table className="sys-table">
              <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
                <tr className="table-header-row">
                  <th className="table-th">Date & Time</th>
                  <th className="table-th">Student Involved</th>
                  <th className="table-th">Location</th>
                  <th className="table-th">Severity</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <IncidentRow key={report.id} report={report} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-16 text-center bg-white border-b-0">
                      <div className="flex flex-col items-center text-zinc-400">
                        <svg className="w-8 h-8 mb-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path></svg>
                        <p className="text-sm font-medium">No reports found in the secure vault.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination totalPages={totalPages} />
        </div>

        <footer className="mt-12 text-center pb-12">
          <p className="sys-label tracking-[0.4em]">
            AMSIRS Security Intelligence Interface
          </p>
        </footer>
      </main>
    </>
  );
}