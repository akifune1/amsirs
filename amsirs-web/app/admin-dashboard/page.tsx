import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { updateStudent, updateStaff } from './actions';
import { logout } from '../auth/actions';

export default async function AdminDashboard() {
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
  const { data: staff } = await supabase
    .from('user_profiles')
    .select('*')
    .order('last_name');

  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('last_name');

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
      <nav className="sys-navbar">
        <div className="flex items-center gap-3">
          <div className="badge-primary">AMSIRS</div>
          <div className="hidden md:block">
            <p className="sys-label leading-none">Cavite National High School</p>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">Root Control</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="sys-label text-gray-400">Admin Session</p>
            <p className="text-xs font-bold text-cavite-maroon mt-0.5">{user?.email}</p>
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

      {/* MAIN DASHBOARD CONTENT */}
      <main className="sys-container w-full">
        
        <div className="mb-10">
          <h1 className="sys-title">Root Control</h1>
          <p className="sys-subtitle">Administrative Tier Isolation Active</p>
        </div>

        <div className="space-y-12">
          
          {/* ==========================================
              STAFF SECTION 
              ========================================== */}
          <section className="space-y-4">
            <h2 className="sys-label text-gray-400">Institutional Staff</h2>
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
            </div>
          </section>

          {/* ==========================================
              STUDENT SECTION 
              ========================================== */}
          <section className="space-y-4">
            <h2 className="sys-label text-gray-400">Student Body</h2>
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
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}