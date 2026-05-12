'use client';

import { useActionState } from 'react';
import { submitSecureIncident } from './actions';
import { logout } from '../auth/actions';

export default function IncidentReportingPage() {
  // state: captures the return from the Server Action (success/error)
  // formAction: the action we pass to the <form>
  // isPending: true while the server is encrypting and saving to Supabase
  const [state, formAction, isPending] = useActionState(submitSecureIncident, null);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* TOP NAVIGATION BAR */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-cavite-maroon text-white px-3 py-1.5 rounded-lg font-black text-lg shadow-sm">
            AMSIRS
          </div>
          <div className="hidden md:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none">
              Cavite National High School
            </p>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">
              Security Infrastructure
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => logout()}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-cavite-maroon transition-all uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-200 hover:border-cavite-maroon/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout Session
        </button>
      </nav>

      <main className="p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          
          {/* PAGE HEADER */}
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-cavite-maroon tracking-tighter">
              INCIDENT REPORTING
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-1 uppercase tracking-widest">
              Authorized Personnel Entry Terminal
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
            {/* Form Header Status */}
            <div className="bg-gray-50 border-b border-gray-100 px-8 py-4 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Secure Form v1.0</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-green-600 uppercase">System Online</span>
              </div>
            </div>

            <form action={formAction} className="p-8 md:p-10 space-y-8">
              
              {/* ALERTS / FEEDBACK */}
              {state?.success && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-r-lg text-sm font-semibold animate-in fade-in slide-in-from-top-2">
                  ✓ {state.message}
                </div>
              )}
              {state?.error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg text-sm font-semibold animate-in fade-in slide-in-from-top-2">
                  ✕ ERROR: {state.error}
                </div>
              )}

              {/* STUDENT NAME SECTION */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2">
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Surname / Last Name</label>
                    <input 
                      name="lastName"
                      required
                      disabled={isPending}
                      placeholder="e.g. Dela Cruz"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">First Name</label>
                    <input 
                      name="firstName"
                      required
                      disabled={isPending}
                      placeholder="e.g. Juan"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* INCIDENT DETAILS SECTION */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 pb-2">
                  Incident Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Location of Incident</label>
                    <input 
                      name="location"
                      required
                      disabled={isPending}
                      placeholder="e.g. Gymnasium / Room 302"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Severity Level</label>
                    <div className="relative">
                      <select 
                        name="severity"
                        disabled={isPending}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-black font-bold focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all appearance-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="Low">Low (Minor Infraction)</option>
                        <option value="Medium">Medium (Disciplinary Action)</option>
                        <option value="High">High (Immediate Intervention)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION SECTION */}
              <div className="space-y-2 pt-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-gray-700">Detailed Description of Events</label>
                  <span className="text-[10px] font-black bg-cavite-maroon/10 text-cavite-maroon px-2 py-0.5 rounded border border-cavite-maroon/20 uppercase tracking-tighter">
                    AES-256 Encrypted
                  </span>
                </div>
                <textarea 
                  name="description"
                  required
                  disabled={isPending}
                  rows={6}
                  placeholder="Provide a clear, factual account of what happened..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all disabled:opacity-50 resize-none"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-cavite-maroon hover:bg-[#600000] text-white font-black py-5 rounded-xl transition-all shadow-xl shadow-maroon-900/10 hover:shadow-maroon-900/20 active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed uppercase tracking-[0.25em] text-sm"
                >
                  {isPending ? 'Processing Security Protocol...' : 'Submit Secured Report'}
                </button>
              </div>
            </form>
          </div>

          <footer className="mt-12 text-center space-y-2">
            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.4em]">
              End-to-End Encrypted Data Transmission
            </p>
            <p className="text-gray-400 text-[9px] italic">
              Strictly for Authorized Personnel of Cavite National High School.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}