'use client';

import { useState, useActionState, useEffect } from 'react';
import { updateStaff } from './actions';

export default function EditStaffModal({ staff }: { staff: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(async (prevState: any, formData: FormData) => {
    try {
      await updateStaff(formData);
      return { success: true };
    } catch (error: any) {
      return { error: error.message || 'Failed to update staff' };
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
                <h3 className="text-base font-semibold tracking-tight" style={{ color: 'var(--sys-text-primary)' }}>Edit Staff Member</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--sys-text-muted)' }}>Modify staff details and account status</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="transition-colors" style={{ color: 'var(--sys-text-muted)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form action={formAction} className="p-6 space-y-5 overflow-y-auto text-left" style={{ backgroundColor: 'var(--sys-surface)' }}>
              <input type="hidden" name="id" value={staff.id} />
              
              {state?.error && (
                <div className="p-3 bg-danger-bg text-danger-text border border-danger-border text-sm font-medium rounded-md">
                  {state.error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>First Name</label>
                  <input required type="text" name="firstName" defaultValue={staff.first_name} className="w-full rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all border" style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Last Name</label>
                  <input required type="text" name="lastName" defaultValue={staff.last_name} className="w-full rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all border" style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Role</label>
                  <select required name="role" defaultValue={staff.role} className="w-full rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all border" style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}>
                    <option value="guard">Guard</option>
                    <option value="guidance">Guidance</option>
                    <option value="school_admin">School Admin</option>
                    <option value="it_admin">IT Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Status</label>
                  <select required name="isActive" defaultValue={String(staff.is_active !== false)} className="w-full rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all border" style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}>
                    <option value="true">Active</option>
                    <option value="false">Suspended</option>
                  </select>
                </div>
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
