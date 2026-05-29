'use client';

import { useActionState, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useFormStatus } from 'react-dom';
import { submitSecureIncident } from './actions';
import { logout } from '../auth/actions';
import DataPrivacyCheckbox from '@/app/components/DataPrivacyCheckbox';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit"
      disabled={pending}
      className="btn-primary mt-4"
    >
      {pending ? 'Processing Security Protocol...' : 'Submit Secured Report'}
    </button>
  );
}

export default function IncidentReportingPage() {
  const [state, formAction] = useActionState(submitSecureIncident, null);
  
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);
  
  // State arrays to handle dynamic fields
  const [students, setStudents] = useState([{ id: crypto.randomUUID() }]);
  const [locations, setLocations] = useState([{ id: crypto.randomUUID() }]);

  const addStudent = () => setStudents([...students, { id: crypto.randomUUID() }]);
  const removeStudent = (id: string) => setStudents(students.filter(s => s.id !== id));

  const addLocation = () => setLocations([...locations, { id: crypto.randomUUID() }]);
  const removeLocation = (id: string) => setLocations(locations.filter(l => l.id !== id));

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* TOP NAVIGATION BAR */}
      

      <main className="sys-container max-w-4xl">
        <div className="mb-10 text-center md:text-left">
          <h1 className="sys-title">INCIDENT REPORTING</h1>
          <p className="sys-subtitle">Authorized Personnel Entry Terminal</p>
        </div>

        <div className="sys-card">
          <div className="sys-card-header">
            <span className="sys-label">Secure Form v2.0</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-green-600 uppercase">System Online</span>
            </div>
          </div>

          <form action={formAction} className="p-8 md:p-10 space-y-10">
            
            {/* SERVER ACTION ALERTS */}
            {state?.success && (<div className="alert-success animate-in fade-in slide-in-from-top-2">✓ {state.message}</div>)}
            {state?.error && (<div className="alert-error animate-in fade-in slide-in-from-top-2">✕ ERROR: {state.error}</div>)}

            {/* DYNAMIC STUDENT SECTION */}
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-cavite-border pb-2">
                <h3 className="sys-label text-gray-400">Involved Students</h3>
              </div>
              
              <div className="space-y-4">
                {students.map((student, index) => (
                  <div key={student.id} className="relative grid grid-cols-1 md:grid-cols-2 gap-6 bg-cavite-gray/50 p-4 rounded-xl border border-cavite-border group">
                    
                    {students.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeStudent(student.id)}
                        className="btn-icon-danger -top-3 -right-3"
                      >
                        ✕
                      </button>
                    )}

                    <div className="space-y-2">
                      <label className="form-label">Surname / Last Name</label>
                      <input name="lastName" required placeholder="e.g. Hernandez" className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="form-label">First Name</label>
                      <input name="firstName" required placeholder="e.g. Kolby" className="input-field" />
                    </div>
                  </div>
                ))}
                
                <button type="button" onClick={addStudent} className="btn-text pt-2">
                  <span>+</span> Add Another Student
                </button>
              </div>
            </div>

            {/* DYNAMIC LOCATION & SEVERITY SECTION */}
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-end border-b border-cavite-border pb-2">
                <h3 className="sys-label text-gray-400">Incident Parameters</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Locations List */}
                <div className="space-y-4">
                  {locations.map((loc, index) => (
                    <div key={loc.id} className="relative group">
                      {locations.length > 1 && (
                        <button type="button" onClick={() => removeLocation(loc.id)} className="absolute right-3 top-9 text-gray-400 hover:text-red-600 transition-colors">✕</button>
                      )}
                      <label className="form-label block">Location {index + 1}</label>
                      <input name="location" required placeholder="e.g. Gymnasium" className="input-field-alt pr-10" />
                    </div>
                  ))}
                  <button type="button" onClick={addLocation} className="btn-text">
                    <span>+</span> Add Another Location
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="form-label">Overall Severity Level</label>
                  <div className="relative">
                    <select name="severity" className="input-field-alt appearance-none cursor-pointer">
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
              <div className="flex justify-between items-end mb-2">
                <label className="form-label !mb-0">Detailed Description of Events</label>
                <span className="badge-outline">AES-256 Encrypted</span>
              </div>
              <textarea name="description" required rows={5} placeholder="Provide a clear, factual account of what happened..." className="input-field-alt resize-none" />
            </div>

            <div className="space-y-2 pt-4 border-t border-cavite-border">
              <div className="flex justify-between items-end mb-2">
                <label className="form-label !mb-0">Photographic Evidence</label>
                <span className="sys-label">Optional</span>
              </div>
              <div className="relative">
                {/* File input pseudo-elements are tricky in standard layers, so keeping specific utilities inline is standard practice */}
                <input type="file" name="attachment" accept="image/jpeg, image/png" className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-cavite-maroon/10 file:text-cavite-maroon hover:file:bg-cavite-maroon/20 transition-all cursor-pointer border border-gray-300 rounded-xl bg-cavite-gray focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon" />
              </div>
            </div>

            <div className="pt-6 space-y-6">
              <DataPrivacyCheckbox id="dpa-incident" />
              <SubmitButton />
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}