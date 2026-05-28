import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { updateStudent, updateStaff } from './actions';
import { logout } from '../auth/actions';
import CreateStaffModal from './CreateStaffModal';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ActionForm from '../components/ActionForm'; // <-- NEW IMPORT

export default async function AdminDashboard(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = props.searchParams ? await props.searchParams : {};
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
    .select('id')
    .eq('id', user?.id)
    .maybeSingle();

  if (!adminAuth) redirect('/unauthorized');

  // ==========================================
  // 📊 DATA FETCHING: STAFF & STUDENTS
  // ==========================================
  const activeTab = (searchParams?.tab as string) || 'staff';
  const ITEMS_PER_PAGE = 10;

  // STAFF TAB DATA
  let staff: any[] = [];
  let staffCount = 0;
  let staffTotalPages = 0;
  const staffQ = (searchParams?.staffQ as string) || '';
  const staffPage = Number(searchParams?.staffPage) || 1;

  if (activeTab === 'staff') {
    let staffQuery = supabase.from('user_profiles').select('*', { count: 'exact' });
    if (staffQ) {
      staffQuery = staffQuery.or(`first_name.ilike.%${staffQ}%,last_name.ilike.%${staffQ}%`);
    }
    const { data, count } = await staffQuery
      .order('last_name')
      .range((staffPage - 1) * ITEMS_PER_PAGE, staffPage * ITEMS_PER_PAGE - 1);
    
    staff = data || [];
    staffCount = count || 0;
    staffTotalPages = Math.ceil(staffCount / ITEMS_PER_PAGE);
  }

  // STUDENT TAB DATA
  let students: any[] = [];
  let studentCount = 0;
  let studentTotalPages = 0;
  const studentQ = (searchParams?.studentQ as string) || '';
  const studentPage = Number(searchParams?.studentPage) || 1;

  if (activeTab === 'students') {
    let studentQuery = supabase.from('students').select('*', { count: 'exact' });
    if (studentQ) {
      studentQuery = studentQuery.or(`first_name.ilike.%${studentQ}%,last_name.ilike.%${studentQ}%,student_id.ilike.%${studentQ}%`);
    }
    const { data, count } = await studentQuery
      .order('last_name')
      .range((studentPage - 1) * ITEMS_PER_PAGE, studentPage * ITEMS_PER_PAGE - 1);
    
    students = data || [];
    studentCount = count || 0;
    studentTotalPages = Math.ceil(studentCount / ITEMS_PER_PAGE);
  }

  // Helper to format timestamps cleanly
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-PH', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* GLOBAL TOP NAVIGATION BAR */}
      

      {/* MAIN DASHBOARD CONTENT */}
      <main className="sys-container w-full">
        
        <div className="mb-10">
          <h1 className="sys-title">Root Control</h1>
          <p className="sys-subtitle">Administrative Tier Isolation Active</p>
        </div>

        
        {/* TAB NAVIGATION */}
        <div className="flex items-center gap-4 border-b border-cavite-border mb-8">
          <Link 
            href="?tab=staff"
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${
              activeTab === 'staff' 
                ? 'border-cavite-maroon text-cavite-maroon' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Institutional Staff
          </Link>
          <Link 
            href="?tab=students"
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${
              activeTab === 'students' 
                ? 'border-cavite-maroon text-cavite-maroon' 
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Student Body
          </Link>
        </div>

        <div className="space-y-12">
          
          {/* ==========================================
              STAFF SECTION 
              ========================================== */}
          {activeTab === 'staff' && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="sys-label text-gray-400">Institutional Staff</h2>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-full sm:w-64">
                  <SearchBar paramName="staffQ" placeholder="Search staff..." />
                </div>
                <CreateStaffModal /> 
              </div>
            </div>
            <div className="sys-card">
              <div className="sys-table-wrapper">
                <table className="sys-table">
                  <thead>
                    <tr className="table-header-row">
                      <th className="table-th w-16">ID</th>
                      <th className="table-th">Last Name</th>
                      <th className="table-th">First Name</th>
                      <th className="table-th">Date Added</th>
                      <th className="table-th">Role</th>
                      <th className="table-th text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cavite-border/50">
                    {(staff || []).map((member) => {
                      const formId = `staff-form-${member.id}`;
                      return (
                        <tr key={member.id} className="group hover:bg-cavite-gray/50 transition-colors">
                          
                          {/* ID Column */}
                          <td className="table-td">
                            <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                              #{member.internal_id}
                            </span>
                          </td>

                          {/* Hidden Form Definition */}
                          <td className="hidden">
                            <form id={formId} action={updateStaff}>
                              <input type="hidden" name="id" value={member.id} />
                            </form>
                          </td>

                          {/* Last Name */}
                          <td className="table-td">
                            <input form={formId} name="lastName" defaultValue={member.last_name} className="bg-transparent font-bold focus:ring-2 focus:ring-cavite-maroon/20 rounded px-2 py-1 outline-none w-full border border-transparent hover:border-cavite-border transition-all" />
                          </td>

                          {/* First Name */}
                          <td className="table-td">
                            <input form={formId} name="firstName" defaultValue={member.first_name} className="bg-transparent font-bold focus:ring-2 focus:ring-cavite-maroon/20 rounded px-2 py-1 outline-none w-full border border-transparent hover:border-cavite-border transition-all" />
                          </td>

                          {/* Created At */}
                          <td className="table-td text-xs text-gray-500 font-medium">
                            {formatDate(member.created_at)}
                          </td>

                          {/* Role */}
                          <td className="table-td">
                            <select form={formId} name="role" defaultValue={member.role} className="bg-cavite-gray text-xs font-bold px-3 py-1.5 rounded border border-cavite-border outline-none focus:ring-2 focus:ring-cavite-maroon/20 cursor-pointer w-full max-w-[120px]">
                              <option value="guard">Guard</option>
                              <option value="guidance">Guidance</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="table-td text-right">
                            <button form={formId} type="submit" className="text-[10px] font-black text-green-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity underline decoration-2 underline-offset-4 hover:text-green-800 cursor-pointer">
                              Save
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination totalPages={staffTotalPages} paramName="staffPage" />
            </div>
          </section>
          )}

          {/* ==========================================
              STUDENT SECTION (UNCHANGED)
              ========================================== */}
          {activeTab === 'students' && (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h2 className="sys-label text-gray-400">Student Body</h2>
              <div className="w-full sm:w-80">
                <SearchBar paramName="studentQ" placeholder="Search by name or ID..." />
              </div>
            </div>
            <div className="sys-card">
              <div className="sys-table-wrapper">
                <table className="sys-table">
                  <thead>
                    <tr className="table-header-row">
                      <th className="table-th w-32">Student ID</th>
                      <th className="table-th">Last Name</th>
                      <th className="table-th">First Name</th>
                      <th className="table-th">Date Reg.</th>
                      <th className="table-th">Placement</th>
                      <th className="table-th">Status</th>
                      <th className="table-th text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cavite-border/50">
                    {(students || []).map((student) => {
                      const formId = `student-form-${student.id}`;
                      return (
                        <tr key={student.id} className="group hover:bg-cavite-gray/50 transition-colors">
                          
                          {/* Student ID */}
                          <td className="table-td">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">
                              {student.student_id}
                            </span>
                          </td>

                          {/* Hidden Form Definition */}
                          <td className="hidden">
                            <form id={formId} action={updateStudent}>
                              <input type="hidden" name="id" value={student.id} />
                            </form>
                          </td>

                          {/* Last Name */}
                          <td className="table-td">
                            <input form={formId} name="lastName" defaultValue={student.last_name} className="bg-transparent font-bold focus:ring-2 focus:ring-cavite-maroon/20 rounded px-2 py-1 outline-none w-full border border-transparent hover:border-cavite-border transition-all" />
                          </td>

                          {/* First Name */}
                          <td className="table-td">
                            <input form={formId} name="firstName" defaultValue={student.first_name} className="bg-transparent font-bold focus:ring-2 focus:ring-cavite-maroon/20 rounded px-2 py-1 outline-none w-full border border-transparent hover:border-cavite-border transition-all" />
                          </td>

                          {/* Created At */}
                          <td className="table-td text-xs text-gray-500 font-medium">
                            {formatDate(student.created_at)}
                          </td>

                          {/* Placement (Grade + Section) */}
                          <td className="table-td">
                            <div className="flex flex-col gap-1">
                              <select form={formId} name="gradeLevel" defaultValue={student.grade_level} className="bg-transparent text-xs font-bold outline-none px-1 focus:ring-2 focus:ring-cavite-maroon/20 rounded cursor-pointer w-full max-w-[100px]">
                                <option value="Grade 11">Grade 11</option>
                                <option value="Grade 12">Grade 12</option>
                              </select>
                              <input form={formId} name="section" defaultValue={student.section} className="bg-transparent text-[10px] font-black text-gray-400 uppercase outline-none px-1 hover:border-cavite-border border border-transparent rounded focus:ring-2 focus:ring-cavite-maroon/20 transition-all w-full max-w-[100px]" placeholder="SECTION" />
                            </div>
                          </td>

                          {/* Approval Status */}
                          <td className="table-td">
                            <select 
                              form={formId}
                              name="isApproved" 
                              defaultValue={String(student.is_approved)} 
                              className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border outline-none focus:ring-2 focus:ring-cavite-maroon/20 cursor-pointer transition-all ${
                                student.is_approved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                              }`}
                            >
                              <option value="true">Approved</option>
                              <option value="false">Pending</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="table-td text-right">
                            <button form={formId} type="submit" className="text-[10px] font-black text-green-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity underline decoration-2 underline-offset-4 hover:text-green-800 cursor-pointer">
                              Apply
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination totalPages={studentTotalPages} paramName="studentPage" />
            </div>
          </section>
          )}
        </div>
      </main>
    </div>
  );
}