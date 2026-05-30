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
          <div className="bg-white rounded-lg shadow-xl border border-cavite-border max-w-md w-[95vw] md:w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="px-6 py-5 border-b border-cavite-border flex justify-between items-center bg-zinc-50 flex-shrink-0">
              <div>
                <h3 className="text-base font-semibold text-cavite-black tracking-tight">Provision Account</h3>
                <p className="text-sm text-zinc-500 mt-1">Create a new institutional access account</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-cavite-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <form action={formAction} className="p-6 space-y-5 bg-white overflow-y-auto">
              
              {state?.error && (
                <div className="p-3 bg-danger-bg text-danger-text border border-danger-border text-sm font-medium rounded-md">
                  {state.error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-cavite-black">Email</label>
                <input required type="email" name="email" className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-cavite-black">Temporary Password</label>
                <input required minLength={6} type="password" name="password" className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-cavite-black">First Name</label>
                  <input required type="text" name="firstName" className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-cavite-black">Last Name</label>
                  <input required type="text" name="lastName" className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all" />
                </div>
              </div>

              <div className="space-y-1.5 pb-2">
                <label className="block text-sm font-medium text-cavite-black">Security Role</label>
                <select required name="role" className="w-full bg-white border border-cavite-border rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all">
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
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:text-cavite-black hover:bg-zinc-100 rounded-md transition-colors"
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