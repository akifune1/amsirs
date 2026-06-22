'use client';

import { useState, useActionState, useEffect } from 'react';
import { updateStudent } from './actions';

const inputStyle = { backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' };
const inputClass = "w-full rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all border";

export default function EditStudentModal({ student }: { student: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      await updateStudent(formData);
      return { success: true };
    } catch (error: any) {
      return { error: error.message || 'Failed to update student' };
    }
  }, null);

  // Close modal on success
  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
    }
  }, [state]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 rounded-md bg-cavite-maroon hover:bg-cavite-hover text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg> 
        <span className="hidden sm:inline">Edit</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-lg shadow-xl max-w-md w-[95vw] md:w-full max-h-[90vh] flex flex-col overflow-hidden border" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>
            
            <div className="px-6 py-5 border-b flex justify-between items-center flex-shrink-0 text-left" style={{ borderColor: 'var(--sys-border)', backgroundColor: 'var(--sys-surface-subtle)' }}>
              <div>
                <h3 className="text-base font-semibold tracking-tight" style={{ color: 'var(--sys-text-primary)' }}>Edit Student</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--sys-text-muted)' }}>Modify student details and approval status</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="transition-colors" style={{ color: 'var(--sys-text-muted)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form action={formAction} className="p-6 space-y-5 overflow-y-auto text-left" style={{ backgroundColor: 'var(--sys-surface)' }}>
              <input type="hidden" name="id" value={student.id} />
              
              {state?.error && (
                <div className="p-3 bg-danger-bg text-danger-text border border-danger-border text-sm font-medium rounded-md">
                  {state.error}
                </div>
              )}

              {/* Photo Display */}
              {student.face_photo_path && (
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-cavite-maroon shadow-md">
                    <img 
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/student_faces/${student.face_photo_path}`} 
                      alt={`${student.first_name} ${student.last_name}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>First Name</label>
                  <input required type="text" name="firstName" defaultValue={student.first_name} className={inputClass} style={inputStyle} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Last Name</label>
                  <input required type="text" name="lastName" defaultValue={student.last_name} className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Student ID</label>
                  <input required type="text" name="studentId" defaultValue={student.student_id} className={inputClass} style={inputStyle} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Account Status</label>
                  <select required name="status" defaultValue={student.status || 'pending'} className={inputClass} style={inputStyle}>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Grade Level</label>
                  <select required name="gradeLevel" defaultValue={student.grade_level} className={inputClass} style={inputStyle}>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Section</label>
                  <input required type="text" name="section" defaultValue={student.section} className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Gender</label>
                  <select name="gender" defaultValue={student.gender || ''} className={inputClass} style={inputStyle}>
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Date of Birth</label>
                  <input type="date" name="birthday" defaultValue={student.birthday || ''} className={inputClass} style={inputStyle} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Complete Address</label>
                <textarea name="address" defaultValue={student.address || ''} rows={2} className={`${inputClass} resize-y`} style={inputStyle} />
              </div>

              <div className="space-y-1.5 pb-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Face Photo Path (Optional)</label>
                <input type="text" name="facePhotoPath" defaultValue={student.face_photo_path || ''} placeholder="Path to face photo..." className={inputClass} style={inputStyle} />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
                  style={{ color: 'var(--sys-text-secondary)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={pending}
                  className="btn-primary m-0"
                >
                  {pending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
