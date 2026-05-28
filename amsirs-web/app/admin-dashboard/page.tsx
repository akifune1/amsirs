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
    <>
      {/* MAIN DASHBOARD CONTENT */}
      <main className="sys-container w-full">
        
        <div className="mb-10">
          <h1 className="sys-title">Root Control</h1>
          <p className="sys-subtitle">Administrative Tier Isolation Active</p>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex items-center gap-1 mb-8 bg-gray-100 p-2 rounded-2xl w-fit border border-transparent">
          <Link 
            href="?tab=staff"
            className={`px-6 py-2.5 text-sm transition-all rounded-xl ${
              activeTab === 'staff' 
                ? 'bg-white text-gray-900 shadow-sm font-bold' 
                : 'text-gray-500 hover:text-gray-900 font-semibold hover:bg-gray-200/50'
            }`}
          >
            Institutional Staff
          </Link>
          <Link 
            href="?tab=students"
            className={`px-6 py-2.5 text-sm transition-all rounded-xl ${
              activeTab === 'students' 
                ? 'bg-white text-gray-900 shadow-sm font-bold' 
                : 'text-gray-500 hover:text-gray-900 font-semibold hover:bg-gray-200/50'
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
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="sys-label">Institutional Staff Directory</h2>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-full sm:w-72">
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
                  <tbody className="divide-y divide-gray-50">
                    {(staff || []).map((member) => {
                      const formId = `staff-form-${member.id}`;
                      return (
                        <tr key={member.id} className="hover:bg-gray-50 group transition-colors">
                          
                          {/* ID Column */}
                          <td className="table-td">
                            <span className="text-zinc-500 font-mono text-xs">
                              {member.internal_id}
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
                            <input form={formId} name="lastName" defaultValue={member.last_name} className="bg-transparent text-sm font-medium focus:ring-1 focus:ring-cavite-maroon rounded px-2 py-1 outline-none w-full border border-transparent hover:border-cavite-border transition-all" />
                          </td>

                          {/* First Name */}
                          <td className="table-td">
                            <input form={formId} name="firstName" defaultValue={member.last_name} className="bg-transparent text-sm font-medium focus:ring-1 focus:ring-cavite-maroon rounded px-2 py-1 outline-none w-full border border-transparent hover:border-cavite-border transition-all" />
                          </td>

                          {/* Created At */}
                          <td className="table-td text-zinc-500 text-sm">
                            {formatDate(member.created_at)}
                          </td>

                          {/* Role */}
                          <td className="table-td">
                            <select form={formId} name="role" defaultValue={member.role} className="bg-zinc-50 text-xs font-medium px-2.5 py-1.5 rounded-md border border-cavite-border outline-none focus:ring-1 focus:ring-cavite-maroon cursor-pointer w-full max-w-[120px]">
                              <option value="guard">Guard</option>
                              <option value="guidance">Guidance</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="table-td text-right">
                            <button form={formId} type="submit" className="text-xs font-semibold text-cavite-maroon opacity-0 group-hover:opacity-100 transition-opacity hover:text-cavite-hover cursor-pointer">
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
              STUDENT SECTION
              ========================================== */}
          {activeTab === 'students' && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="sys-label">Student Body Database</h2>
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
                  <tbody className="divide-y divide-gray-50">
                    {(students || []).map((student) => {
                      const formId = `student-form-${student.id}`;
                      return (
                        <tr key={student.id} className="hover:bg-gray-50 group transition-colors">
                          
                          {/* Student ID */}
                          <td className="table-td">
                            <span className="text-zinc-500 font-mono text-xs">
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
                            <input form={formId} name="lastName" defaultValue={student.last_name} className="bg-transparent text-sm font-medium focus:ring-1 focus:ring-cavite-maroon rounded px-2 py-1 outline-none w-full border border-transparent hover:border-cavite-border transition-all" />
                          </td>

                          {/* First Name */}
                          <td className="table-td">
                            <input form={formId} name="firstName" defaultValue={student.first_name} className="bg-transparent text-sm font-medium focus:ring-1 focus:ring-cavite-maroon rounded px-2 py-1 outline-none w-full border border-transparent hover:border-cavite-border transition-all" />
                          </td>

                          {/* Created At */}
                          <td className="table-td text-zinc-500 text-sm">
                            {formatDate(student.created_at)}
                          </td>

                          {/* Placement (Grade + Section) */}
                          <td className="table-td">
                            <div className="flex flex-col gap-1.5">
                              <select form={formId} name="gradeLevel" defaultValue={student.grade_level} className="bg-transparent text-xs font-medium outline-none px-1 py-0.5 hover:bg-zinc-100 focus:ring-1 focus:ring-cavite-maroon rounded border border-transparent hover:border-cavite-border cursor-pointer w-full max-w-[100px] transition-all">
                                <option value="Grade 11">Grade 11</option>
                                <option value="Grade 12">Grade 12</option>
                              </select>
                              <input form={formId} name="section" defaultValue={student.section} className="bg-transparent text-xs text-zinc-500 outline-none px-1 py-0.5 hover:bg-zinc-100 hover:text-cavite-black border border-transparent hover:border-cavite-border rounded focus:ring-1 focus:ring-cavite-maroon transition-all w-full max-w-[100px]" placeholder="SECTION" />
                            </div>
                          </td>

                          {/* Approval Status */}
                          <td className="table-td">
                            <select 
                              form={formId}
                              name="isApproved" 
                              defaultValue={String(student.is_approved)} 
                              className={`text-xs font-medium px-2.5 py-1.5 rounded-full border outline-none focus:ring-1 focus:ring-cavite-maroon cursor-pointer transition-all ${
                                student.is_approved ? 'bg-success-bg text-success-text border-success-border' : 'bg-warning-bg text-warning-text border-warning-border'
                              }`}
                            >
                              <option value="true">Approved</option>
                              <option value="false">Pending</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="table-td text-right">
                            <button form={formId} type="submit" className="text-xs font-semibold text-cavite-maroon opacity-0 group-hover:opacity-100 transition-opacity hover:text-cavite-hover cursor-pointer">
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
    </>
  );
}