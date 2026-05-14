import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logout } from '../auth/actions';
import IncidentClientLogs from './IncidentClientLogs';
import { decrypt } from '@/lib/encryption'; 

export default async function StudentPortal() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll() { return cookieStore.getAll() } }
    }
  );

  // 1. Verify Active Session
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Fetch Student Profile
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('account_id', user.id)
    .maybeSingle();

  if (!student) {
    return (
      <div className="layout-center">
        <div className="sys-card p-10 text-center max-w-md w-full border-t-[6px] border-t-cavite-maroon">
          <h1 className="sys-title text-2xl">Unlinked Account</h1>
          <p className="sys-subtitle mt-2">No student record found.</p>
        </div>
      </div>
    );
  }

  // --- PHOTO FIX: Generate Signed URL ---
  let photoUrl = null;
  if (student.face_photo_path) {
    const { data: photoData } = await supabase.storage
      .from('student_faces') 
      .createSignedUrl(student.face_photo_path, 3600);
    
    if (photoData) photoUrl = photoData.signedUrl;
  }

  // 3. Fetch Linked Incidents
  const { data: involvements } = await supabase
    .from('incident_involvements')
    .select(`
      incident_id,
      created_at,
      incident_reports (id, location, severity, description, status, created_at, image_path)
    `)
    .eq('student_id', student.id)
    .order('created_at', { ascending: false });

  // 4. Decrypt & Format
  const processedInvolvements = involvements ? await Promise.all(
    involvements.map(async (record) => {
      const incident = record.incident_reports as any;
      let incidentImageUrl = null;

      if (incident?.image_path) {
        const { data: imgData } = await supabase.storage
          .from('incident_attachments')
          .createSignedUrl(incident.image_path, 3600);
        if (imgData) incidentImageUrl = imgData.signedUrl;
      }

      const formattedDate = incident 
        ? new Date(incident.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
        : 'Unknown Date';

      let decryptedDescription = 'No description provided.';
      if (incident?.description) {
        try {
          decryptedDescription = incident.description.includes(':') 
            ? decrypt(incident.description) 
            : incident.description; 
        } catch (error) {
          decryptedDescription = "⚠️ [SYSTEM ERROR]: Payload decryption failed.";
        }
      }

      return {
        ...record,
        incident: { ...incident, description: decryptedDescription },
        incidentImageUrl,
        formattedDate
      };
    })
  ) : [];

  return (
    <div className="min-h-screen">
      {/* GLOBAL NAVBAR */}
      <nav className="sys-navbar">
        <div className="flex items-center gap-3">
          <div className="badge-primary">AMSIRS</div>
          <div className="hidden md:block">
            <p className="sys-label leading-none">Cavite National High School</p>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">Student Portal</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="sys-label text-gray-400">Clearance Status</p>
            <p className={`text-xs font-bold mt-0.5 ${student.is_approved ? 'text-green-600' : 'text-orange-500'}`}>
              {student.is_approved ? 'VERIFIED' : 'PENDING'}
            </p>
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

      {/* MAIN CONTAINER */}
      <main className="sys-container">
        
        <div className="mb-10 text-center md:text-left">
          <h1 className="sys-title">STUDENT PORTAL</h1>
          <p className="sys-subtitle">Personal Information & Involvement Records</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: IDENTITY DETAILS */}
          <section className="col-span-1 space-y-4">
            <div className="sys-card sticky top-24">
              <div className="sys-card-header">
                <span className="sys-label">Identity Matrix</span>
              </div>
              
              <div className="p-6 md:p-8 space-y-6">
                
                {/* PHOTO AND ID SECTION */}
                <div className="flex items-center gap-5 border-b border-cavite-border pb-6">
                  <div className="w-20 h-20 rounded-full bg-cavite-gray border border-cavite-border overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Biometric Reference" className="w-full h-full object-cover" />
                    ) : (
                      <span className="sys-label text-center px-2">No Scan</span>
                    )}
                  </div>
                  <div>
                    <label className="form-label !mb-1">Student ID</label>
                    <p className="text-2xl font-black tracking-tight text-cavite-maroon">{student.student_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">First Name</label>
                    <div className="input-field-alt text-sm">{student.first_name}</div>
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <div className="input-field-alt text-sm">{student.last_name}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Level</label>
                    <div className="input-field-alt text-sm">{student.grade_level}</div>
                  </div>
                  <div>
                    <label className="form-label">Section</label>
                    <div className="input-field-alt text-sm uppercase">{student.section}</div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: INCIDENT RECORDS */}
          <section className="col-span-1 lg:col-span-2">
            <div className="sys-card">
              <div className="sys-card-header">
                <span className="sys-label">Involvement Logs</span>
                <span className="badge-outline">Encrypted</span>
              </div>
              <IncidentClientLogs involvements={processedInvolvements} />
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}