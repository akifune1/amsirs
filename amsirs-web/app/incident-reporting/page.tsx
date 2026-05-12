'use client';

import { useActionState } from 'react';
import { submitSecureIncident } from './actions'; // Import from the file in the same folder

export default function IncidentReportingPage() {
  // state: captures the return from the Server Action (success/error)
  // formAction: the action we pass to the <form>
  // isPending: true while the server is encrypting and saving to Supabase
  const [state, formAction, isPending] = useActionState(submitSecureIncident, null);

  return (
    <div className="min-h-screen bg-cavite-black p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="border-b border-cavite-maroon pb-4 mb-8">
          <h1 className="text-3xl font-bold text-cavite-white tracking-tight">
            INCIDENT REPORTING MODULE
          </h1>
          <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">
            Authorized Personnel: Security Department
          </p>
        </div>

        <div className="bg-cavite-gray rounded-lg border border-gray-800 shadow-xl p-8">
          <form action={formAction} className="space-y-6">
            
            {/* Feedback Messages */}
            {state?.success && (
              <div className="bg-green-900/20 border border-green-500 text-green-400 p-4 rounded text-sm">
                SUCCESS: {state.message}
              </div>
            )}
            {state?.error && (
              <div className="bg-red-900/20 border border-cavite-red text-cavite-red p-4 rounded text-sm">
                ERROR: {state.error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student ID */}
              <div>
                <label className="block text-xs font-semibold text-cavite-maroon uppercase mb-2">Student ID</label>
                <input 
                  name="studentId"
                  required
                  disabled={isPending}
                  placeholder="e.g. 2026-0001"
                  className="w-full bg-cavite-black border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-cavite-maroon transition-all disabled:opacity-50"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-cavite-maroon uppercase mb-2">Location of Incident</label>
                <input 
                  name="location"
                  required
                  disabled={isPending}
                  placeholder="e.g. Main Canteen"
                  className="w-full bg-cavite-black border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-cavite-maroon transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-xs font-semibold text-cavite-maroon uppercase mb-2">Severity Level</label>
              <select 
                name="severity"
                disabled={isPending}
                className="w-full bg-cavite-black border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-cavite-maroon transition-all disabled:opacity-50 appearance-none"
              >
                <option value="Low">Low (Minor Infraction)</option>
                <option value="Medium">Medium (Disciplinary Action Required)</option>
                <option value="High">High (Immediate Intervention)</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-cavite-maroon uppercase mb-2">
                Detailed Description <span className="text-gray-500 font-normal italic">(AES-256 Encrypted)</span>
              </label>
              <textarea 
                name="description"
                required
                disabled={isPending}
                rows={5}
                placeholder="Describe the incident with factual details..."
                className="w-full bg-cavite-black border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-cavite-maroon transition-all disabled:opacity-50"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button 
                type="submit"
                disabled={isPending}
                className="w-full bg-cavite-maroon hover:bg-[#600000] text-white font-bold py-4 rounded transition-colors shadow-lg disabled:bg-gray-800 disabled:text-gray-500 uppercase tracking-widest"
              >
                {isPending ? 'Processing Encryption...' : 'Submit Secured Report'}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-gray-600 text-[10px] mt-8 uppercase tracking-[0.2em]">
          End-to-End Encrypted Data Transmission | AMSIRS v1.0
        </p>
      </div>
    </div>
  );
}