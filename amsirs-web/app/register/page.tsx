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
      className="w-full bg-cavite-maroon hover:bg-[#600000] text-white font-black py-5 rounded-xl transition-all shadow-xl shadow-maroon-900/10 hover:shadow-maroon-900/20 active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
    >
      {pending ? 'Uploading Data...' : 'Submit Registration'}
    </button>
  );
}

export default function StudentRegistrationPage() {
  const [state, formAction] = useActionState(registerStudent, null);

  // ==========================================
  // GENERATE FACE EMBEDDING
  // ==========================================
  async function generateFaceEmbedding(student: any) {
    try {
      await loadModels();

      const imageUrl = supabase.storage
        .from('student_faces')
        .getPublicUrl(student.face_photo_path).data.publicUrl;

      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = imageUrl;

      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const detection = await faceapi
        .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        console.error('No face detected in uploaded photo');
        return;
      }

      await supabase.from('face_embeddings').insert({
        student_id: student.id,
        descriptor: Array.from(detection.descriptor),
      });

      console.log('Face embedding saved successfully');
    } catch (error) {
      console.error(error);
    }
  }

  // ==========================================
  // AUTO GENERATE EMBEDDING AFTER REGISTRATION
  // ==========================================
  useEffect(() => {
    if (state?.success && state?.student) {
      generateFaceEmbedding(state.student);
    }
  }, [state]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* STUDENT NAVIGATION BAR */}
      

      <main className="p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-cavite-maroon tracking-tighter">
              STUDENT ENROLLMENT
            </h1>
            <p className="text-gray-500 text-sm font-medium mt-2">
              Please fill out your details below to register for the campus integrated system.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
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
              <div className="space-y-4 border-b border-gray-100 pb-8">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  Account Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="student@example.com"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Secure Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-medium italic mt-2">
                  Will be used for logging in.
                </p>
              </div>

              {/* PERSONAL INFORMATION */}
              <div className="space-y-4 border-b border-gray-100 pb-8">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  Your Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Learner Reference Number (LRN)
                    </label>
                    <input
                      name="lrn"
                      required
                      placeholder="e.g. 123456789012"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      First Name
                    </label>
                    <input
                      name="firstName"
                      required
                      placeholder="e.g. Juan"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Last Name
                    </label>
                    <input
                      name="lastName"
                      required
                      placeholder="e.g. Dela Cruz"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* DEMOGRAPHICS & CONTACT (NEW SECTION) */}
              <div className="space-y-4 border-b border-gray-100 pb-8">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                  Demographics & Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date of Birth
                    </label>
                    <input
                      name="birthday"
                      type="date"
                      required
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        name="gender"
                        required
                        defaultValue=""
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all appearance-none cursor-pointer"
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
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Complete Address
                    </label>
                    <textarea
                      name="address"
                      required
                      rows={2}
                      placeholder="e.g. 123 Main St, Brgy. San Jose, Trece Martires City"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* ACADEMIC PLACEMENT */}
              <div className="space-y-4 border-b border-gray-100 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Grade Level
                    </label>
                    <div className="relative">
                      <select
                        name="gradeLevel"
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all appearance-none cursor-pointer"
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
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Section Name
                    </label>
                    <input
                      name="section"
                      required
                      placeholder="e.g. Einstein"
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-black font-medium focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* BIOMETRIC UPLOAD */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-end mb-2">
                  <label className="text-sm font-bold text-gray-700">
                    ID Photo
                  </label>
                  <span className="text-[10px] font-black bg-cavite-maroon/10 text-cavite-maroon px-2 py-0.5 rounded border border-cavite-maroon/20 uppercase tracking-tighter">
                    Required
                  </span>
                </div>
                  <CameraCapture name="facePhoto" required={true} />
                <ul className="text-xs text-gray-500 font-medium mt-3 space-y-1 pl-4 list-disc marker:text-cavite-maroon">
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