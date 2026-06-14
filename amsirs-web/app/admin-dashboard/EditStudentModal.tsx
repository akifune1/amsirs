'use client';

import { useState, useActionState, useEffect } from 'react';
import { updateStudent } from './actions';

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
          <div className="bg-white rounded-lg shadow-xl border border-cavite-border max-w-md w-[95vw] md:w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="px-6 py-5 border-b border-cavite-border flex justify-between items-center bg-zinc-50 flex-shrink-0 text-left">
              <div>
                <h3 className="text-base font-semibold text-cavite-black tracking-tight">Edit Student</h3>
                <p className="text-sm text-zinc-500 mt-1">Modify student details and approval status</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-cavite-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form action={formAction} className="p-6 space-y-5 bg-white overflow-y-auto text-left">
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
                  <label className="block text-sm font-medium text-cavite-black">First Name</label>
                  <input required type="text" name="firstName" defaultValue={student.first_name} className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-cavite-black">Last Name</label>
                  <input required type="text" name="lastName" defaultValue={student.last_name} className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-cavite-black">Student ID</label>
                  <input required type="text" name="studentId" defaultValue={student.student_id} className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-cavite-black">Account Status</label>
                  <select required name="status" defaultValue={student.status || 'pending'} className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-cavite-black">Grade Level</label>
                  <select required name="gradeLevel" defaultValue={student.grade_level} className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all">
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-cavite-black">Section</label>
                  <input required type="text" name="section" defaultValue={student.section} className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-cavite-black">Gender</label>
                  <select name="gender" defaultValue={student.gender || ''} className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all">
                    <option value="" disabled>Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-cavite-black">Date of Birth</label>
                  <input type="date" name="birthday" defaultValue={student.birthday || ''} className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-cavite-black">Complete Address</label>
                <textarea name="address" defaultValue={student.address || ''} rows={2} className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all resize-y" />
              </div>

              <div className="space-y-1.5 pb-2">
                <label className="block text-sm font-medium text-cavite-black">Face Photo Path (Optional)</label>
                <input type="text" name="facePhotoPath" defaultValue={student.face_photo_path || ''} placeholder="Path to face photo..." className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all" />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-cavite-black hover:bg-zinc-100 rounded-md transition-colors"
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
