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
        className="text-[10px] font-black bg-cavite-maroon text-white px-3 py-2 rounded-lg uppercase tracking-widest hover:bg-[#600000] transition-colors"
      >
        + Add Staff
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-black text-cavite-black">Provision Account</h3>
                <p className="text-xs text-gray-500 font-medium">Create a new institutional access account</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form action={formAction} className="p-6 space-y-4">
              
              {state?.error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded">
                  {state.error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email</label>
                <input required type="email" name="email" className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-cavite-maroon" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Temporary Password</label>
                <input required minLength={6} type="password" name="password" className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-cavite-maroon" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">First Name</label>
                  <input required type="text" name="firstName" className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-cavite-maroon" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Last Name</label>
                  <input required type="text" name="lastName" className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-cavite-maroon" />
                </div>
              </div>

              <div className="space-y-1 pb-4">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Security Role</label>
                <select required name="role" className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-sm focus:outline-none focus:border-cavite-maroon">
                  <option value="guard">Security Guard</option>
                  <option value="guidance">Guidance Counselor</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={pending}
                className="w-full bg-cavite-maroon text-white font-black text-xs py-3 rounded-lg uppercase tracking-widest hover:bg-[#600000] transition-colors disabled:opacity-50"
              >
                {pending ? 'Provisioning...' : 'Create Account'}
              </button>
            </form>

          </div>
        </div>
      )}
    </>
  );
}