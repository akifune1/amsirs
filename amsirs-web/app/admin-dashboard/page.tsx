import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { updateStudent, updateStaff, resetUserPassword, bulkApproveStudents } from './actions';
import { logout } from '../auth/actions';
import { decrypt, hashString } from '@/lib/encryption';
import CreateStaffModal from './CreateStaffModal';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ActionForm from '../components/ActionForm';
import FilterDropdown from '../components/FilterDropdown';
import ConfirmChangesForm from './components/ConfirmChangesForm';
import EditStudentModal from './EditStudentModal';
import EditStaffModal from './EditStaffModal';

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
    .select('id, role')
    .eq('id', user?.id)
    .maybeSingle();

  if (!adminAuth || adminAuth.role === 'school_admin') redirect('/unauthorized');

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
  const staffRole = searchParams?.staffRole as string;
  const staffStatus = searchParams?.staffStatus as string;

  if (activeTab === 'staff') {
    let staffQuery = supabase.from('user_profiles').select('*', { count: 'exact' });
    if (staffQ) {
      staffQuery = staffQuery.or(`first_name.ilike.%${staffQ}%,last_name.ilike.%${staffQ}%`);
    }
    if (staffRole) staffQuery = staffQuery.eq('role', staffRole);
    if (staffStatus === 'active') staffQuery = staffQuery.eq('is_active', true);
    if (staffStatus === 'suspended') staffQuery = staffQuery.eq('is_active', false);
    
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
  const studentGrade = searchParams?.studentGrade as string;
  const studentStatus = searchParams?.studentStatus as string;

  if (activeTab === 'students') {
    let studentQuery = supabase.from('students').select('*', { count: 'exact' });
    if (studentQ) {
      const isLrnFormat = /^\d{12}$/.test(studentQ);
      let orQuery = `first_name.ilike.%${studentQ}%,last_name.ilike.%${studentQ}%,student_id.ilike.%${studentQ}%`;
      if (isLrnFormat) {
        orQuery += `,lrn_hash.eq.${hashString(studentQ)}`;
      }
      studentQuery = studentQuery.or(orQuery);
    }
    if (studentGrade) studentQuery = studentQuery.eq('grade_level', studentGrade);
    if (studentStatus === 'approved') studentQuery = studentQuery.eq('is_approved', true);
    if (studentStatus === 'pending') studentQuery = studentQuery.eq('is_approved', false);
    
    const { data, count } = await studentQuery
      .order('last_name')
      .range((studentPage - 1) * ITEMS_PER_PAGE, studentPage * ITEMS_PER_PAGE - 1);
    
    students = (data || []).map((student: any) => ({
      ...student,
      lrn: student.lrn && student.lrn.includes(':') ? decrypt(student.lrn) : student.lrn,
      address: student.address && student.address.includes(':') ? decrypt(student.address) : student.address,
      birthday: student.birthday && student.birthday.includes(':') ? decrypt(student.birthday) : student.birthday // we will decrypt if it has colon formatting for ciphertext to prevent crash on unmigrated data
    }));
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
              <div className="mb-6">
                <h2 className="sys-label">Institutional Staff Directory</h2>
              </div>
              <div className="sys-card">
                <div className="p-4 border-b border-cavite-border bg-zinc-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h3 className="sys-label m-0 text-sm">Filter Directory</h3>
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <FilterDropdown paramName="staffRole" placeholder="Role" options={[{label:'All Roles', value:'All'}, {label:'Guard', value:'guard'}, {label:'Guidance', value:'guidance'}, {label:'School Admin', value:'school_admin'}, {label:'IT Admin', value:'it_admin'}]} />
                    <FilterDropdown paramName="staffStatus" placeholder="Status" options={[{label:'All Status', value:'All'}, {label:'Active', value:'active'}, {label:'Suspended', value:'suspended'}]} />
                    <div className="w-full sm:w-64">
                      <SearchBar paramName="staffQ" placeholder="Search staff..." />
                    </div>
                    <CreateStaffModal /> 
                  </div>
                </div>
                <div className="sys-table-wrapper max-h-[600px] overflow-auto">
                  <table className="sys-table">
                    <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
                    <tr className="table-header-row">
                      <th className="table-th w-16">ID</th>
                      <th className="table-th min-w-[180px]">Last Name</th>
                      <th className="table-th min-w-[180px]">First Name</th>
                      <th className="table-th min-w-[120px]">Date Added</th>
                      <th className="table-th min-w-[140px]">Role</th>
                      <th className="table-th min-w-[120px]">Status</th>
                      <th className="table-th min-w-[120px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {staff.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-16 text-center text-zinc-400 bg-white">
                          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                          <p className="text-base font-medium">No staff members found.</p>
                          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                        </td>
                      </tr>
                    ) : (staff.map((member) => {
                      return (
                        <tr key={member.id} className="hover:bg-gray-50 group transition-colors">
                          
                          {/* ID Column */}
                          <td className="table-td" data-label="ID">
                            <span className="text-zinc-500 font-mono text-xs">
                              {member.internal_id}
                            </span>
                          </td>

                          {/* Last Name */}
                          <td className="table-td" data-label="Last Name">
                            <span className="text-sm font-medium px-2 py-1 block w-full min-w-[160px]">{member.last_name}</span>
                          </td>

                          {/* First Name */}
                          <td className="table-td" data-label="First Name">
                            <span className="text-sm font-medium px-2 py-1 block w-full min-w-[160px]">{member.first_name}</span>
                          </td>

                          {/* Created At */}
                          <td className="table-td text-zinc-500 text-sm whitespace-nowrap" data-label="Date Added">
                            {formatDate(member.created_at)}
                          </td>

                          {/* Role */}
                          <td className="table-td" data-label="Role">
                            <span className="text-sm font-medium px-2 py-1 block w-full max-w-[120px]">
                              {member.role === 'guard' ? 'Guard' :
                               member.role === 'guidance' ? 'Guidance' :
                               member.role === 'school_admin' ? 'School Admin' :
                               member.role === 'it_admin' ? 'IT Admin' : member.role}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="table-td" data-label="Status">
                            <span className={`inline-flex text-xs font-medium px-2.5 py-1.5 rounded-full border ${member.is_active !== false ? 'bg-success-bg text-success-text border-success-border' : 'bg-danger-bg text-danger-text border-danger-border'}`}>
                              {member.is_active !== false ? 'Active' : 'Suspended'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="table-td text-right" data-label="Actions">
                            <div className="flex justify-end gap-2 items-center">
                              {(() => {
                                const defaultStaffPw = `Mabuhay${(member.last_name || '').toUpperCase()}1902`;
                                return (
                                  <ActionForm action={resetUserPassword} confirmMessage={`Reset this user's password to '${defaultStaffPw}'?`}>
                                    <input type="hidden" name="userId" value={member.id} />
                                    <input type="hidden" name="newPassword" value={defaultStaffPw} />
                                    <button type="submit" className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm border border-zinc-200">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg> 
                                      <span className="hidden sm:inline">Reset PW</span>
                                    </button>
                                  </ActionForm>
                                );
                              })()}
                              <EditStaffModal staff={member} />
                            </div>
                          </td>
                        </tr>
                      );
                    }))}
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
              <div className="mb-6">
                <h2 className="sys-label">Student Body Database</h2>
              </div>
              <div className="sys-card">
                <div className="p-4 border-b border-cavite-border bg-zinc-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h3 className="sys-label m-0 text-sm">Filter Students</h3>
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <FilterDropdown paramName="studentGrade" placeholder="Grade" options={[{label:'All Grades', value:'All'}, {label:'Grade 11', value:'Grade 11'}, {label:'Grade 12', value:'Grade 12'}]} />
                    <FilterDropdown paramName="studentStatus" placeholder="Status" options={[{label:'All Status', value:'All'}, {label:'Approved', value:'approved'}, {label:'Pending', value:'pending'}]} />
                    <div className="w-full sm:w-64">
                      <SearchBar paramName="studentQ" placeholder="Search by name or ID..." />
                    </div>
                  </div>
                </div>
              <form id="bulk-approve-form" action={async (formData) => {
                'use server';
                const ids = formData.getAll('studentIds') as string[];
                await bulkApproveStudents(ids);
              }} />
              <div className="p-4 border-b border-cavite-border bg-zinc-50 flex justify-between items-center">
                <span className="text-sm text-zinc-500 font-medium">Select pending students to approve them all at once.</span>
                <button type="submit" form="bulk-approve-form" className="btn-primary m-0 py-1.5 px-4 text-xs">Bulk Approve Selected</button>
              </div>
              <div className="sys-table-wrapper max-h-[600px] overflow-auto">
                  <table className="sys-table">
                    <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
                      <tr className="table-header-row">
                        <th className="table-th w-10 text-center">✓</th>
                        <th className="table-th min-w-[160px]">Student ID</th>
                        <th className="table-th min-w-[180px]">Last Name</th>
                        <th className="table-th min-w-[180px]">First Name</th>
                        <th className="table-th min-w-[120px]">Date Reg.</th>
                        <th className="table-th min-w-[140px]">Grade Level</th>
                        <th className="table-th min-w-[140px]">Section</th>
                        <th className="table-th min-w-[120px]">Status</th>
                        <th className="table-th min-w-[120px] text-right">Actions</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-gray-50">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-16 text-center text-zinc-400 bg-white">
                          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                          <p className="text-base font-medium">No students found.</p>
                          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                        </td>
                      </tr>
                    ) : (students.map((student) => {
                      return (
                        <tr key={student.id} className="hover:bg-gray-50 group transition-colors">
                          
                          {/* Checkbox for Bulk Approve */}
                          <td className="table-td text-center" data-label="Approve">
                            {!student.is_approved && (
                              <input type="checkbox" name="studentIds" value={student.id} form="bulk-approve-form" className="rounded border-gray-300 text-cavite-maroon focus:ring-cavite-maroon cursor-pointer" />
                            )}
                          </td>
                          
                          {/* Student ID */}
                          <td className="table-td" data-label="Student ID">
                            <span className="text-zinc-500 font-mono text-xs">
                              {student.student_id}
                            </span>
                          </td>

                          {/* Last Name */}
                          <td className="table-td" data-label="Last Name">
                            <span className="text-sm font-medium px-2 py-1 block w-full min-w-[160px]">{student.last_name}</span>
                          </td>

                          {/* First Name */}
                          <td className="table-td" data-label="First Name">
                            <span className="text-sm font-medium px-2 py-1 block w-full min-w-[160px]">{student.first_name}</span>
                          </td>

                          {/* Created At */}
                          <td className="table-td text-zinc-500 text-sm whitespace-nowrap" data-label="Date Reg.">
                            {formatDate(student.created_at)}
                          </td>

                          {/* Grade Level */}
                          <td className="table-td" data-label="Grade Level">
                            <span className="text-sm font-medium px-2 py-1 block w-full max-w-[110px]">{student.grade_level}</span>
                          </td>

                          {/* Section */}
                          <td className="table-td" data-label="Section">
                            <span className="text-sm font-medium px-2 py-1 block w-full min-w-[120px]">{student.section || '-'}</span>
                          </td>

                          {/* Approval Status */}
                          <td className="table-td" data-label="Status">
                            <span className={`inline-flex text-xs font-medium px-2.5 py-1.5 rounded-full border ${
                                student.is_approved ? 'bg-success-bg text-success-text border-success-border' : 'bg-warning-bg text-warning-text border-warning-border'
                              }`}>
                              {student.is_approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="table-td text-right" data-label="Actions">
                            <div className="flex justify-end gap-2 items-center">
                              {(() => {
                                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                let monthStr = "Jan";
                                if (student.birthday && student.birthday.includes('-')) {
                                  const parts = student.birthday.split('-');
                                  if (parts.length >= 2) {
                                    const monthIdx = parseInt(parts[1], 10) - 1;
                                    if (monthIdx >= 0 && monthIdx <= 11) monthStr = monthNames[monthIdx];
                                  }
                                }
                                const defaultStudentPw = `${monthStr}${student.student_id}`;
                                return (
                                  <ActionForm action={resetUserPassword} confirmMessage={`Reset this student's password to '${defaultStudentPw}'?`}>
                                    <input type="hidden" name="userId" value={student.account_id} />
                                    <input type="hidden" name="newPassword" value={defaultStudentPw} />
                                    <button type="submit" className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm border border-zinc-200">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                                      <span className="hidden sm:inline">Reset PW</span>
                                    </button>
                                  </ActionForm>
                                );
                              })()}
                              <EditStudentModal student={student} />
                            </div>
                          </td>
                        </tr>
                      );
                    }))}
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