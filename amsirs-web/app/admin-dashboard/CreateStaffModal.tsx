'use client';

import { useState, useActionState, useEffect } from 'react';
import { createStaffAccount } from './actions';

export default function CreateStaffModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createStaffAccount, null);

  // Close modal on success
  useEffect(() => {
    if (state?.success) {
      setIsOpen(false);
      // Optional: Add a toast notification here
    }
  }, [state]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary"
      >
        New Staff Account
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-lg shadow-xl max-w-md w-[95vw] md:w-full max-h-[90vh] flex flex-col overflow-hidden border" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>
            
            <div className="px-6 py-5 border-b flex justify-between items-center flex-shrink-0" style={{ borderColor: 'var(--sys-border)', backgroundColor: 'var(--sys-surface-subtle)' }}>
              <div>
                <h3 className="text-base font-semibold tracking-tight" style={{ color: 'var(--sys-text-primary)' }}>Provision Account</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--sys-text-muted)' }}>Create a new institutional access account</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="transition-colors" style={{ color: 'var(--sys-text-muted)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form action={formAction} className="p-6 space-y-5 overflow-y-auto" style={{ backgroundColor: 'var(--sys-surface)' }}>
              
              {state?.error && (
                <div className="p-3 bg-danger-bg text-danger-text border border-danger-border text-sm font-medium rounded-md">
                  {state.error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Email</label>
                <input required type="email" name="email" className="w-full rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all border" style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Temporary Password</label>
                <input required minLength={6} type="password" name="password" className="w-full rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all border" style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>First Name</label>
                  <input required type="text" name="firstName" className="w-full rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all border" style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Last Name</label>
                  <input required type="text" name="lastName" className="w-full rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all border" style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }} />
                </div>
              </div>

              <div className="space-y-1.5 pb-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--sys-text-primary)' }}>Security Role</label>
                <select required name="role" className="w-full rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all border" style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}>
                  <option value="guard">Security Guard</option>
                  <option value="guidance">Guidance Counselor</option>
                  <option value="school_admin">School Administrator</option>
                  <option value="it_admin">IT Administrator</option>
                </select>
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
                  {pending ? 'Provisioning...' : 'Create Account'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}