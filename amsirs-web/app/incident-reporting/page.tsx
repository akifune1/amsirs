'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitSecureIncident } from './actions';
import { logout } from '../auth/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit"
      disabled={pending}
      className="w-full bg-cavite-maroon hover:bg-[#600000] text-white font-black py-5 rounded-xl transition-all shadow-xl shadow-maroon-900/10 hover:shadow-maroon-900/20 active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed uppercase tracking-[0.25em] text-sm"
    >
      {pending ? 'Processing Security Protocol...' : 'Submit Secured Report'}
    </button>
  );
}

export default function IncidentReportingPage() {
  const [state, formAction] = useActionState(submitSecureIncident, null);
  
  // NEW: State arrays to handle dynamic fields
  const [students, setStudents] = useState([{ id: crypto.randomUUID() }]);
  const [locations, setLocations] = useState([{ id: crypto.randomUUID() }]);

  const addStudent = () => setStudents([...students, { id: crypto.randomUUID() }]);
  const removeStudent = (id: string) => setStudents(students.filter(s => s.id !== id));

  const addLocation = () => setLocations([...locations, { id: crypto.randomUUID() }]);
  const removeLocation = (id: string) => setLocations(locations.filter(l => l.id !== id));

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* TOP NAVIGATION BAR */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-cavite-maroon text-white px-3 py-1.5 rounded-lg font-black text-lg shadow-sm">AMSIRS</div>
          <div className="hidden md:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none">Cavite National High School</p>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">Security Infrastructure</p>
          </div>
        </div>
        <form action={logout}>
          <button type="submit" className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-cavite-maroon transition-all uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-200 hover:border-cavite-maroon/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout Session
          </button>
        </form>
      </nav>

      <main className="p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-cavite-maroon tracking-tighter">INCIDENT REPORTING</h1>
            <p className="text-gray-500 text-sm font-medium mt-1 uppercase tracking-widest">Authorized Personnel Entry Terminal</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-8 py-4 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Secure Form v2.0</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-green-600 uppercase">System Online</span>
              </div>
            </div>

            <form action={formAction} className="p-8 md:p-10 space-y-10">
              
              {state?.success && (<div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-r-lg text-sm font-semibold animate-in fade-in slide-in-from-top-2">✓ {state.message}</div>)}
              {state?.error && (<div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-r-lg text-sm font-semibold animate-in fade-in slide-in-from-top-2">✕ ERROR: {state.error}</div>)}

              {/* DYNAMIC STUDENT SECTION */}
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Involved Students</h3>
                </div>
                
                <div className="space-y-4">
                  {students.map((student, index) => (
                    <div key={student.id} className="relative grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100 group">
                      {/* Delete Button (Only show if there is more than 1 student) */}
                      {students.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeStudent(student.id)}
                          className="absolute -top-3 -right-3 bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all z-10"
                        >
                          ✕
                        </button>
                      )}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Surname / Last Name</label>
                        <input name="lastName" required placeholder="e.g. Hernandez" className="w-full bg-white border border-gray-300 rounded-lg p-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">First Name</label>
                        <input name="firstName" required placeholder="e.g. Kolby" className="w-full bg-white border border-gray-300 rounded-lg p-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all" />
                      </div>
                    </div>
                  ))}
                  
                  <button type="button" onClick={addStudent} className="text-xs font-bold text-cavite-maroon hover:text-[#600000] uppercase tracking-widest flex items-center gap-1 transition-colors">
                    <span>+</span> Add Another Student
                  </button>
                </div>
              </div>

              {/* DYNAMIC LOCATION & SEVERITY SECTION */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Incident Parameters</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Locations List */}
                  <div className="space-y-4">
                    {locations.map((loc, index) => (
                      <div key={loc.id} className="relative group">
                        {locations.length > 1 && (
                          <button type="button" onClick={() => removeLocation(loc.id)} className="absolute right-3 top-9 text-gray-400 hover:text-red-600 transition-colors">✕</button>
                        )}
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Location {index + 1}</label>
                        <input name="location" required placeholder="e.g. Gymnasium" className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all pr-10" />
                      </div>
                    ))}
                    <button type="button" onClick={addLocation} className="text-xs font-bold text-cavite-maroon hover:text-[#600000] uppercase tracking-widest flex items-center gap-1 transition-colors">
                      <span>+</span> Add Another Location
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Overall Severity Level</label>
                    <div className="relative">
                      <select name="severity" className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-black font-bold focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all appearance-none cursor-pointer">
                        <option value="Low">Low (Minor Infraction)</option>
                        <option value="Medium">Medium (Disciplinary Action)</option>
                        <option value="High">High (Immediate Intervention)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESCRIPTION & EVIDENCE SECTION */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-bold text-gray-700">Detailed Description of Events</label>
                  <span className="text-[10px] font-black bg-cavite-maroon/10 text-cavite-maroon px-2 py-0.5 rounded border border-cavite-maroon/20 uppercase tracking-tighter">AES-256 Encrypted</span>
                </div>
                <textarea name="description" required rows={5} placeholder="Provide a clear, factual account of what happened..." className="w-full bg-gray-50 border border-gray-300 rounded-xl p-4 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all resize-none" />
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-sm font-bold text-gray-700">Photographic Evidence</label>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Optional</span>
                </div>
                <div className="relative">
                  <input type="file" name="attachment" accept="image/jpeg, image/png" className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-cavite-maroon/10 file:text-cavite-maroon hover:file:bg-cavite-maroon/20 transition-all cursor-pointer border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon" />
                </div>
              </div>

              <div className="pt-6">
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}