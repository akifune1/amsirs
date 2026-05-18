'use client';

import {
  useActionState,

  // ADDED FOR FACIAL RECOGNITION
  useEffect,
} from 'react';

import { useFormStatus } from 'react-dom';

import Link from 'next/link';

import * as faceapi from 'face-api.js';

// ADDED FOR FACIAL RECOGNITION
import { loadModels } from '@/lib/face/loadModels';

// ADDED FOR FACIAL RECOGNITION
import { supabase } from '@/lib/supabase';

import { registerStudent } from './actions';

function EnrollButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-cavite-maroon hover:bg-[#600000] text-white font-black py-5 rounded-xl transition-all shadow-xl shadow-maroon-900/10 hover:shadow-maroon-900/20 active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
    >
      {pending
        ? 'Uploading Data...'
        : 'Submit Registration'}
    </button>
  );
}

export default function StudentRegistrationPage() {

  const [state, formAction] =
    useActionState(
      registerStudent,
      null
    );

  // ==========================================
  // ADDED FOR FACIAL RECOGNITION
  // GENERATE FACE EMBEDDING
  // ==========================================

  async function generateFaceEmbedding(
    student: any
  ) {
    try {
      // LOAD AI MODELS
      await loadModels();

      // GET PUBLIC IMAGE URL
      const imageUrl =
        supabase.storage
          .from('student_faces')
          .getPublicUrl(
            student.face_photo_path
          ).data.publicUrl;

      // CREATE IMAGE ELEMENT
      const image =
        new Image();

      image.crossOrigin =
        'anonymous';

      image.src = imageUrl;

      // WAIT FOR IMAGE TO LOAD
      await new Promise(
        (resolve) => {
          image.onload =
            resolve;
        }
      );

      // DETECT FACE + GENERATE FACE DATA
      const detection =
        await faceapi
          .detectSingleFace(
            image,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

      if (!detection) {
        console.error(
          'No face detected in uploaded photo'
        );

        return;
      }

      // SAVE FACE EMBEDDING
      await supabase
        .from(
          'face_embeddings'
        )
        .insert({
          student_id:
            student.id,

          descriptor:
            Array.from(
              detection.descriptor
            ),
        });

      console.log(
        'Face embedding saved successfully'
      );

    } catch (error) {
      console.error(error);
    }
  }

  // ==========================================
  // ADDED FOR FACIAL RECOGNITION
  // AUTO GENERATE EMBEDDING
  // AFTER REGISTRATION
  // ==========================================

useEffect(() => {
  console.log("STATE:", state);

  if (
    state?.success &&
    state?.student
  ) {
    console.log(
      "GENERATING EMBEDDING"
    );

    generateFaceEmbedding(
      state.student
    );
  }
}, [state]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">

      {/* STUDENT NAVIGATION BAR */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">

        <div className="flex items-center gap-3">

          <div className="bg-cavite-maroon text-white px-3 py-1.5 rounded-lg font-black text-lg shadow-sm">
            CNHS
          </div>

          <div className="hidden md:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none">
              Cavite National High School
            </p>

            <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">
              Student Portal
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-cavite-maroon transition-all uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-200 hover:border-cavite-maroon/20"
        >
          Return to Home
        </Link>
      </nav>

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

            <form
              action={formAction}
              className="p-8 md:p-10 space-y-10"
            >

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
                  A confirmation link will be sent to this email address.
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
                      Student ID (LRN)
                    </label>

                    <input
                      name="studentId"
                      required
                      placeholder="e.g. 2026-0001"
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
                        <option value="Grade 11">
                          Grade 11
                        </option>

                        <option value="Grade 12">
                          Grade 12
                        </option>
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

                <div className="relative">

                  <input
                    type="file"
                    name="facePhoto"
                    required
                    accept="image/jpeg, image/png"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-cavite-maroon/10 file:text-cavite-maroon hover:file:bg-cavite-maroon/20 transition-all cursor-pointer border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon"
                  />
                </div>

                <ul className="text-xs text-gray-500 font-medium mt-3 space-y-1 pl-4 list-disc marker:text-cavite-maroon">

                  <li>
                    Ensure you are in a well-lit area.
                  </li>

                  <li>
                    Do not wear face masks, sunglasses, or hats.
                  </li>

                  <li>
                    Look directly at the camera.
                  </li>
                </ul>
              </div>

              <div className="pt-6">
                <EnrollButton />
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}