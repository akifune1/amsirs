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
  const { data: staff, error: staffError } = await supabase
    .from('user_profiles')
    .select('*')
    .order('last_name');

  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('*')
    .order('last_name');

  // --- LOG THESE TO YOUR TERMINAL ---
  console.log("--- DASHBOARD DATA DEBUG ---");
  console.log("Staff Count:", staff?.length || 0);
  console.log("Staff Error:", staffError?.message || "None");
  console.log("Student Count:", students?.length || 0);
  console.log("Student Error:", studentError?.message || "None");
  console.log("----------------------------");

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER */}
        <header className="flex justify-between items-end border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Root Control</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-1">
              Administrative Tier Isolation Active
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right mr-4 border-r border-gray-200 pr-4">
              <p className="text-[10px] font-black uppercase text-gray-400">Current Session</p>
              <p className="text-xs font-bold text-gray-900">{user?.email}</p>
            </div>
            <form action={logout}>
              <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-cavite-maroon transition-colors shadow-lg">
                Terminate Session
              </button>
            </form>
          </div>
        </header>

        {/* STAFF SECTION */}
        <section className="space-y-4">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Institutional Staff</h2>
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5">Staff Identity</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(staff || []).map((member) => {
                  const formId = `staff-form-${member.id}`;
                  return (
                    <tr key={member.id} className="group hover:bg-gray-50/50">
                      <td className="px-8 py-6">
                        {/* THE FORM IS HIDDEN HERE */}
                        <form id={formId} action={updateStaff}>
                          <input type="hidden" name="id" value={member.id} />
                        </form>
                        <div className="flex gap-2">
                          <input form={formId} name="firstName" defaultValue={member.first_name} className="bg-transparent font-bold focus:ring-2 focus:ring-maroon-100 rounded px-2 py-1 outline-none w-32 border border-transparent hover:border-gray-200" />
                          <input form={formId} name="lastName" defaultValue={member.last_name} className="bg-transparent font-bold focus:ring-2 focus:ring-maroon-100 rounded px-2 py-1 outline-none w-32 border border-transparent hover:border-gray-200" />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <select form={formId} name="role" defaultValue={member.role} className="bg-gray-50 text-xs font-bold px-3 py-1 rounded border border-gray-200 outline-none">
                          <option value="guard">Guard</option>
                          <option value="guidance">Guidance</option>
                        </select>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button form={formId} type="submit" className="text-[10px] font-black text-green-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity underline decoration-2 underline-offset-4">
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* STUDENT SECTION */}
        <section className="space-y-4">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Student Body</h2>
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5">Student Identity</th>
                  <th className="px-8 py-5">Placement</th>
                  <th className="px-8 py-5">Approval</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(students || []).map((student) => {
                  const formId = `student-form-${student.id}`;
                  return (
                    <tr key={student.id} className="group hover:bg-gray-50/50">
                      <td className="px-8 py-6">
                        {/* THE FORM IS HIDDEN HERE */}
                        <form id={formId} action={updateStudent}>
                          <input type="hidden" name="id" value={student.id} />
                        </form>
                        <p className="text-[10px] font-bold text-gray-300 uppercase mb-1">{student.student_id}</p>
                        <div className="flex gap-2">
                          <input form={formId} name="firstName" defaultValue={student.first_name} className="bg-transparent font-bold focus:ring-2 focus:ring-maroon-100 rounded px-2 py-1 outline-none w-32 border border-transparent hover:border-gray-200" />
                          <input form={formId} name="lastName" defaultValue={student.last_name} className="bg-transparent font-bold focus:ring-2 focus:ring-maroon-100 rounded px-2 py-1 outline-none w-32 border border-transparent hover:border-gray-200" />
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <select form={formId} name="gradeLevel" defaultValue={student.grade_level} className="bg-transparent text-xs font-bold outline-none block mb-1">
                          <option value="Grade 11">Grade 11</option>
                          <option value="Grade 12">Grade 12</option>
                        </select>
                        <input form={formId} name="section" defaultValue={student.section} className="bg-transparent text-[10px] font-black text-gray-400 uppercase outline-none" />
                      </td>
                      <td className="px-8 py-6">
                        <select 
                          form={formId}
                          name="isApproved" 
                          defaultValue={String(student.is_approved)} 
                          className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border transition-all ${
                            student.is_approved ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                          }`}
                        >
                          <option value="true">Approved</option>
                          <option value="false">Pending</option>
                        </select>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button form={formId} type="submit" className="text-[10px] font-black text-green-600 uppercase opacity-0 group-hover:opacity-100 transition-opacity underline decoration-2 underline-offset-4">
                          Apply
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}