'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import * as faceapi from 'face-api.js';

import { loadModels } from '@/lib/face/loadModels';
import { supabase } from '@/lib/supabase';
import { registerStudent } from './actions';
import DataPrivacyCheckbox from '@/app/components/DataPrivacyCheckbox';
import CameraCapture from '@/app/components/CameraCapture';

function EnrollButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-cavite-maroon hover:bg-[#600000] text-white font-black py-5 rounded-xl transition-all shadow-xl shadow-maroon-900/10 hover:shadow-maroon-900/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
    >
      {pending ? 'Uploading Data...' : 'Submit Registration'}
    </button>
  );
}

export default function StudentRegistrationPage() {
  const [state, formAction] = useActionState(registerStudent, null);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--sys-page-bg)', color: 'var(--sys-text-primary)' }}>
      {/* STUDENT NAVIGATION BAR */}
      

      <main className="p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-cavite-maroon tracking-tighter">
              STUDENT ENROLLMENT
            </h1>
            <p className="text-sm font-medium mt-2" style={{ color: 'var(--sys-text-muted)' }}>
              Please fill out your details below to register for the campus integrated system.
            </p>
          </div>

          <div className="rounded-2xl shadow-xl border overflow-hidden" style={{ backgroundColor: 'var(--sys-surface)', borderColor: 'var(--sys-border)' }}>
            <form action={formAction} className="p-8 md:p-10 space-y-10">
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

              {/* ACCOUNT CREDENTIALS */}
              <div className="space-y-4 border-b pb-8" style={{ borderColor: 'var(--sys-border)' }}>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--sys-text-secondary)' }}>
                  Account Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sys-text-primary)' }}>
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="student@example.com"
                      className="w-full rounded-lg p-3 font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all border"
                      style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sys-text-primary)' }}>
                      Secure Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full rounded-lg p-3 font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all border"
                      style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
                    />
                  </div>
                </div>
                <p className="text-[10px] font-medium italic mt-2" style={{ color: 'var(--sys-text-muted)' }}>
                  Will be used for logging in.
                </p>
              </div>

              {/* PERSONAL INFORMATION */}
              <div className="space-y-4 border-b pb-8" style={{ borderColor: 'var(--sys-border)' }}>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--sys-text-secondary)' }}>
                  Your Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sys-text-primary)' }}>
                      Learner Reference Number (LRN)
                    </label>
                    <input
                      name="lrn"
                      required
                      placeholder="e.g. 123456789012"
                      className="w-full rounded-lg p-3 font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all border"
                      style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sys-text-primary)' }}>
                      First Name
                    </label>
                    <input
                      name="firstName"
                      required
                      placeholder="e.g. Juan"
                      className="w-full rounded-lg p-3 font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all border"
                      style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sys-text-primary)' }}>
                      Last Name
                    </label>
                    <input
                      name="lastName"
                      required
                      placeholder="e.g. Dela Cruz"
                      className="w-full rounded-lg p-3 font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all border"
                      style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
                    />
                  </div>
                </div>
              </div>

              {/* DEMOGRAPHICS & CONTACT (NEW SECTION) */}
              <div className="space-y-4 border-b pb-8" style={{ borderColor: 'var(--sys-border)' }}>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--sys-text-secondary)' }}>
                  Demographics & Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sys-text-primary)' }}>
                      Date of Birth
                    </label>
                    <input
                      name="birthday"
                      type="date"
                      required
                      className="w-full rounded-lg p-3 font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all border"
                      style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sys-text-primary)' }}>
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        required
                        defaultValue=""
                        className="w-full rounded-lg p-3 font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all appearance-none cursor-pointer border"
                        style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
                      >
                        <option value="" disabled>Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        ▼
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sys-text-primary)' }}>
                      Complete Address
                    </label>
                    <textarea
                      name="address"
                      required
                      rows={2}
                      placeholder="e.g. 123 Main St, Brgy. San Jose, Trece Martires City"
                      className="w-full rounded-lg p-3 font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all resize-y border"
                      style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
                    />
                  </div>
                </div>
              </div>

              {/* ACADEMIC PLACEMENT */}
              <div className="space-y-4 border-b pb-8" style={{ borderColor: 'var(--sys-border)' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sys-text-primary)' }}>
                      Grade Level
                    </label>
                    <div className="relative">
                      <select
                        name="gradeLevel"
                        className="w-full rounded-lg p-3 font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all appearance-none cursor-pointer border"
                        style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
                      >
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        ▼
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--sys-text-primary)' }}>
                      Section Name
                    </label>
                    <input
                      name="section"
                      required
                      placeholder="e.g. Einstein"
                      className="w-full rounded-lg p-3 font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all border"
                      style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
                    />
                  </div>
                </div>
              </div>

              {/* BIOMETRIC UPLOAD */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-sm font-bold" style={{ color: 'var(--sys-text-primary)' }}>
                    ID Photo
                  </label>
                  <span className="text-[10px] font-black bg-cavite-maroon/10 text-cavite-maroon px-2 py-0.5 rounded border border-cavite-maroon/20 uppercase tracking-tighter">
                    Required
                  </span>
                </div>
                  <CameraCapture name="facePhoto" required={true} />
                <ul className="text-xs font-medium mt-3 space-y-1 pl-4 list-disc marker:text-cavite-maroon" style={{ color: 'var(--sys-text-muted)' }}>
                  <li>Ensure you are in a well-lit area.</li>
                  <li>Do not wear face masks, sunglasses, or hats.</li>
                  <li>Look directly at the camera.</li>
                </ul>
              </div>

              <div className="pt-6 space-y-6">
                <DataPrivacyCheckbox id="dpa-register" />
                <EnrollButton />
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}