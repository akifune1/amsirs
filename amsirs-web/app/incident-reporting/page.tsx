'use client';

import { useActionState } from 'react';
import { submitSecureIncident } from './actions';

export default function IncidentReportingPage() {
  // state: captures the return from the Server Action (success/error)
  const [state, formAction, isPending] = useActionState(submitSecureIncident, null);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section - Clean & Institutional */}
        <div className="border-b-2 border-cavite-maroon pb-6 mb-10">
          <h1 className="text-4xl font-extrabold text-cavite-maroon tracking-tight">
            INCIDENT REPORTING MODULE
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-cavite-maroon text-white text-[10px] font-bold px-2 py-0.5 rounded">OFFICIAL</span>
            <p className="text-gray-500 text-xs uppercase tracking-[0.15em] font-semibold">
              Authorized Personnel Only • Security Department
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
          {/* Form Banner */}
          <div className="bg-gray-50 border-b border-gray-100 px-8 py-4">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">Secure Submission Form</p>
          </div>

          <form action={formAction} className="p-8 space-y-8">
            
            {/* Feedback Messages */}
            {state?.success && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
                <strong>SUCCESS:</strong> {state.message}
              </div>
            )}
            {state?.error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
                <strong>ERROR:</strong> {state.error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Student ID */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight">Student ID</label>
                <input 
                  name="studentId"
                  required
                  disabled={isPending}
                  placeholder="e.g. 2026-0001"
                  className="w-full bg-white border border-gray-300 rounded-lg p-3.5 text-black focus:outline-none focus:border-cavite-maroon focus:ring-2 focus:ring-cavite-maroon/10 transition-all disabled:bg-gray-50"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight">Location of Incident</label>
                <input 
                  name="location"
                  required
                  disabled={isPending}
                  placeholder="e.g. Main Canteen"
                  className="w-full bg-white border border-gray-300 rounded-lg p-3.5 text-black focus:outline-none focus:border-cavite-maroon focus:ring-2 focus:ring-cavite-maroon/10 transition-all disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Severity Level */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight">Severity Level</label>
              <div className="relative">
                <select 
                  name="severity"
                  disabled={isPending}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3.5 text-black focus:outline-none focus:border-cavite-maroon focus:ring-2 focus:ring-cavite-maroon/10 transition-all appearance-none cursor-pointer disabled:bg-gray-50"
                >
                  <option value="Low">Low (Minor Infraction)</option>
                  <option value="Medium">Medium (Disciplinary Action Required)</option>
                  <option value="High">High (Immediate Intervention)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-tight flex justify-between">
                Detailed Description 
                <span className="text-cavite-maroon font-bold text-[10px] bg-maroon-50 px-2 rounded border border-cavite-maroon/20">AES-256 SECURED</span>
              </label>
              <textarea 
                name="description"
                required
                disabled={isPending}
                rows={6}
                placeholder="Provide a factual and detailed account of the incident..."
                className="w-full bg-white border border-gray-300 rounded-lg p-3.5 text-black focus:outline-none focus:border-cavite-maroon focus:ring-2 focus:ring-cavite-maroon/10 transition-all disabled:bg-gray-50"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button 
                type="submit"
                disabled={isPending}
                className="w-full bg-cavite-maroon hover:bg-[#600000] text-white font-bold py-5 rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-[0.99] disabled:bg-gray-300 disabled:cursor-not-allowed uppercase tracking-[0.2em] text-sm"
              >
                {isPending ? 'Encrypting & Transmitting...' : 'File Secured Report'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.3em]">
            End-to-End Encrypted Data Transmission Protocol
          </p>
          <p className="text-gray-400 text-[9px] mt-1 italic">
            AMSIRS v1.0 • Cavite National High School Security Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
}