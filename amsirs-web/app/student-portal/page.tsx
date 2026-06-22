import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logout } from '../auth/actions';
import IncidentClientLogs from './IncidentClientLogs'; // Imports your untouched table component
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

  // Decrypt Student PII
  if (student.lrn && student.lrn.includes(':')) {
    student.lrn = decrypt(student.lrn);
  }
  if (student.address && student.address.includes(':')) {
    student.address = decrypt(student.address);
  }
  if (student.birthday && student.birthday.includes(':')) {
    student.birthday = decrypt(student.birthday);
  }

  // 3. FETCH AUTOMATED FLAGGING STATUS
  const { data: flagRecord } = await supabase
    .from('student_flags')
    .select('is_flagged')
    .eq('student_id', student.id)
    .maybeSingle();

  // 4. Generate Signed URL for Profile Photo
  let photoUrl = null;
  if (student.face_photo_path) {
    const { data: photoData } = await supabase.storage
      .from('student_faces') 
      .createSignedUrl(student.face_photo_path, 3600);
    
    if (photoData) photoUrl = photoData.signedUrl;
  }

  // 5. Fetch Linked Incidents
  const { data: involvements } = await supabase
    .from('incident_involvements')
    .select(`
      incident_id,
      created_at,
      incident_reports (id, location, severity, description, status, created_at, image_path)
    `)
    .eq('student_id', student.id)
    .order('created_at', { ascending: false });

  // 6. Decrypt & Format
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
      

      {/* MAIN CONTAINER */}
      <main className="sys-container">
        
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <h1 className="sys-title">STUDENT PORTAL</h1>
            <p className="sys-subtitle">Personal Information & Involvement Records</p>
          </div>
          {/* Mobile Only Report Button */}
          <Link 
            href="/incident-reporting" 
            className="sm:hidden mt-4 w-full justify-center flex items-center gap-2 text-xs font-bold transition-all uppercase tracking-widest px-4 py-3 rounded-xl border"
            style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)', color: 'var(--sys-text-muted)' }}
          >
            File a New Report
          </Link>
        </div>

        {/* --- SYSTEM FLAG BANNER --- */}
        {flagRecord?.is_flagged && (
          <div className="bg-cavite-maroon text-white rounded-2xl shadow-xl overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-300">
            <div className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-16 h-16 shrink-0 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-200 mb-1">Mandatory Action Required</p>
                <h2 className="text-xl font-bold mb-2">Guidance Intervention Notice</h2>
                <p className="text-sm text-red-100 font-medium leading-relaxed">
                  The Campus Integrated System has flagged your profile due to your involvement in multiple or severe incidents. 
                  <strong> You must report to the Guidance Counselor's office immediately </strong> 
                  to resolve this status.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: IDENTITY DETAILS */}
          <section className="col-span-1 space-y-4">
            <div className="sys-card sticky top-24">
              <div className="sys-card-header">
                <span className="sys-label">Identity Matrix</span>
              </div>
              
              <div className="p-6 md:p-8 space-y-6">
                
                {/* PHOTO AND ID SECTION */}
                <div className="flex items-center gap-5 border-b pb-6" style={{ borderColor: 'var(--sys-border)' }}>
                  <div className="w-20 h-20 rounded-full border overflow-hidden shrink-0 flex items-center justify-center shadow-inner" style={{ backgroundColor: 'var(--sys-surface-muted)', borderColor: 'var(--sys-border)' }}>
                    {photoUrl ? (
                      <img src={photoUrl} alt="Biometric Reference" className="w-full h-full object-cover" />
                    ) : (
                      <span className="sys-label text-center px-2">No Scan</span>
                    )}
                  </div>
                  <div>
                    <label className="form-label !mb-1">Internal ID</label>
                    <p className="text-2xl font-black tracking-tight text-cavite-maroon">{student.student_id}</p>
                    <p className="text-xs font-bold mt-1" style={{ color: 'var(--sys-text-muted)' }}>LRN: {student.lrn || 'Not provided'}</p>
                  </div>
                </div>

                {/* NAME */}
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

                {/* DEMOGRAPHICS (NEW) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Gender</label>
                    <div className="input-field-alt text-sm">{student.gender || 'Not specified'}</div>
                  </div>
                  <div>
                    <label className="form-label">Date of Birth</label>
                    <div className="input-field-alt text-sm">
                      {student.birthday ? new Date(student.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not specified'}
                    </div>
                  </div>
                </div>

                {/* ADDRESS (NEW) */}
                <div>
                  <label className="form-label">Complete Address</label>
                  <div className="input-field-alt text-sm min-h-[60px] whitespace-pre-wrap leading-relaxed">
                    {student.address || 'Not specified'}
                  </div>
                </div>

                {/* ACADEMICS */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: 'var(--sys-border)' }}>
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