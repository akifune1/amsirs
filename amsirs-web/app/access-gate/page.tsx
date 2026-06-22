"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { toast } from "react-hot-toast";
import { loadModels } from "@/lib/face/loadModels";
import { compareFaces, getMatchPercentage } from "@/lib/face/compareFaces";
import { getMouthOpenRatio } from "@/lib/face/liveness";
import {
  fetchFaceEmbeddings,
  lookupStudent,
  checkDuplicateScan,
  uploadSnapshotAndLog,
  notifyUnknownFace,
} from "@/app/gate/actions";

export default function AccessGatePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanningRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  interface VerifiedStudent {
    student_id: string;
    first_name: string;
    last_name: string;
    photoUrl?: string | null;
    grade_level?: string;
    section?: string;
    matchPercentage: number;
    timestamp: Date;
    status: string;
  }

  // Liveness Refs
  const livenessStepRef = useRef(0);
  // 0 = Wait for closed mouth
  // 1 = Wait for open mouth
  // 2 = Verified

  // NEW: Temporary holding cell for the neutral snapshot
  const pendingSnapshotRef = useRef<string | null>(null);
  
  // Throttle unknown face notifications (e.g. 15 seconds)
  const lastUnknownNotificationRef = useRef<number>(0);

  const [verifiedStudent, setVerifiedStudent] = useState<VerifiedStudent | null>(null);

  const lastMsgRef = useRef("");
  const setMessage = (msg: string) => {
    if (lastMsgRef.current === msg) return;
    lastMsgRef.current = msg;
    const toastId = "scanner-toast";
    if (msg.includes("ERROR") || msg.includes("DENIED") || msg.includes("NOT RECOGNIZED") || msg.includes("NOT FOUND") || msg.includes("FAILED")) {
      toast.error(msg, { id: toastId, duration: 4000 });
    } else if (msg.includes("GRANTED") || msg.includes("VERIFIED") || msg.includes("WELCOME BACK") || msg.includes("READY")) {
      toast.success(msg, { id: toastId, duration: 4000 });
    } else if (msg.includes("INITIALIZING") || msg.includes("LOADING") || msg.includes("STARTING") || msg.includes("Analyzing") || msg.includes("WAITING")) {
      toast.loading(msg, { id: toastId });
    } else {
      toast(msg, { id: toastId, duration: 4000, icon: 'ℹ️' });
    }
  };

  const killCamera = () => {
    isMountedRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoElementRef.current) {
      if (videoElementRef.current.srcObject) {
        const stream = videoElementRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoElementRef.current.srcObject = null;
      }
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    initialize();

    const handleNavigationClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href && target.href.startsWith(window.location.origin)) {
        killCamera();
      }
    };

    document.addEventListener('click', handleNavigationClick);

    return () => {
      document.removeEventListener('click', handleNavigationClick);
      killCamera();
    };
  }, []);

  async function initialize() {
    try {
      setMessage("LOADING AI MODELS...");
      await loadModels();
      if (!isMountedRef.current) return;

      setMessage("STARTING CAMERA...");
      await startCamera();
      if (!isMountedRef.current) return;

      setMessage("SYSTEM READY\n\nWaiting for face...");
      startAutoScan();
    } catch (error) {
      console.error(error);
      setMessage("FAILED TO INITIALIZE SYSTEM");
    }
  }

  async function startCamera() {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoElementRef.current = videoRef.current;
      }
    } catch (error: any) {
      console.error("[CAMERA ERROR]", error);
      if (error.name === "NotAllowedError") {
        setMessage("CAMERA PERMISSION DENIED\n\nPlease allow access and refresh.");
      } else {
        setMessage("FAILED TO START CAMERA\n\nPlease check your device.");
      }
      throw error;
    }
  }

  function startAutoScan() {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    scanIntervalRef.current = setInterval(async () => {
      if (scanningRef.current) return;
      scanningRef.current = true;
      await scanFace();
      scanningRef.current = false;
    }, 800);
  }

  // Capture snapshot as base64 string (to send to server action)
  function captureSnapshotBase64(): string | null {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return null;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg");
  }

  // Helper function to cleanly reset the scanner state
  function resetScanner() {
    livenessStepRef.current = 0;
    pendingSnapshotRef.current = null; // Discard the awkward photo
  }

  async function scanFace() {
    try {
      if (!videoRef.current) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMessage("WAITING FOR FACE...");
        resetScanner();
        return;
      }

      // =========================
      // LIVENESS CHECK (OPEN MOUTH)
      // =========================
      const mouthRatio = getMouthOpenRatio(detection.landmarks);

      // Step 0: Ensure they start with a closed mouth
      if (livenessStepRef.current === 0) {
        if (mouthRatio < 0.15) {
          livenessStepRef.current = 1;
          setMessage("LIVENESS CHECK\n\nPlease slightly open your mouth.");

          // ==========================================
          // CAPTURE THE NEUTRAL SNAPSHOT HERE IN THE BACKGROUND
          // ==========================================
          pendingSnapshotRef.current = captureSnapshotBase64();

        } else {
          setMessage("LIVENESS CHECK\n\nPlease look at the camera with a closed mouth.");
        }
        return;
      }

      // Step 1: Wait for them to open their mouth
      if (livenessStepRef.current === 1) {
        if (mouthRatio > 0.35) {
          livenessStepRef.current = 2;
          setMessage("LIVENESS VERIFIED\n\nAnalyzing Identity...");
        } else {
          setMessage("LIVENESS CHECK\n\nPlease slightly open your mouth.");
          return;
        }
      }

      if (livenessStepRef.current !== 2) return;

      const currentDescriptor = detection.descriptor;

      // =========================
      // DATABASE MATCHING (via server action)
      // =========================
      const embeddingsResult = await fetchFaceEmbeddings();
      if (!embeddingsResult.success || !embeddingsResult.data) {
        setMessage("FAILED TO LOAD EMBEDDINGS");
        resetScanner();
        return;
      }

      let bestMatch = null;
      let lowestDistance = 999;
      for (const face of embeddingsResult.data) {
        const distance = compareFaces(face.descriptor, currentDescriptor);
        if (distance < lowestDistance) {
          lowestDistance = distance;
          bestMatch = face;
        }
      }

      const matchPercentage = getMatchPercentage(lowestDistance);

      if (bestMatch && lowestDistance < 0.55) {
        const studentResult = await lookupStudent(bestMatch.student_id);

        if (!studentResult.success || !studentResult.data) {
          setMessage("STUDENT NOT FOUND");
          resetScanner();
          return;
        }

        const studentData = studentResult.data;

        // Check for duplicate scan (15-second cooldown)
        const dupCheck = await checkDuplicateScan(studentData.id, "ENTRY");
        if (dupCheck.isDuplicate) {
          setMessage(`WELCOME BACK\n\n${studentData.first_name} ${studentData.last_name}\n\nAlready Scanned`);
          setVerifiedStudent({
            student_id: studentData.student_id,
            first_name: studentData.first_name,
            last_name: studentData.last_name,
            photoUrl: studentData.photoUrl,
            grade_level: studentData.grade_level,
            section: studentData.section,
            matchPercentage,
            timestamp: new Date(),
            status: "DUPLICATE"
          });
          resetScanner();
          return;
        }

        // =====================
        // SNAPSHOT & LOGGING (via server action)
        // =====================
        await uploadSnapshotAndLog({
          studentId: studentData.id,
          matchPercentage,
          faceDistance: lowestDistance,
          action: "ENTRY",
          snapshotBase64: pendingSnapshotRef.current,
        });

        setMessage(`ACCESS GRANTED\n\n${studentData.first_name} ${studentData.last_name}`);

        setVerifiedStudent({
          student_id: studentData.student_id,
          first_name: studentData.first_name,
          last_name: studentData.last_name,
          photoUrl: studentData.photoUrl,
          grade_level: studentData.grade_level,
          section: studentData.section,
          matchPercentage,
          timestamp: new Date(),
          status: "GRANTED"
        });

        resetScanner(); // Clean up for the next person
      } else {
        setMessage("FACE NOT RECOGNIZED");
        
        // Notify guards of unknown face (throttle to once every 15 seconds)
        const now = Date.now();
        if (now - lastUnknownNotificationRef.current > 15000) {
          lastUnknownNotificationRef.current = now;
          notifyUnknownFace().catch(console.error);
        }

        resetScanner();
      }
    } catch (error) {
      console.error(error);
      setMessage("SYSTEM ERROR");
      resetScanner();
    }
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: 'var(--sys-page-bg)', color: 'var(--sys-text-primary)' }}>


      <main className="p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: 'var(--sys-text-primary)' }}>Facial Recognition Access Gate</h1>
          <p className="font-medium mt-2" style={{ color: 'var(--sys-text-secondary)' }}>Real-time biometric campus entry verification powered by AI facial recognition.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <div className="rounded-3xl shadow-xl border overflow-hidden" style={{ backgroundColor: 'var(--sys-surface-card)', borderColor: 'var(--sys-border)' }}>
              <div className="border-b px-6 py-5 flex items-center justify-between" style={{ borderColor: 'var(--sys-border)' }}>
                <div>
                  <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: 'var(--sys-text-muted)' }}>Live Security Feed</p>
                  <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--sys-text-primary)' }}>Entrance Camera</h2>
                </div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  LIVE
                </div>
              </div>
              <div className="bg-black flex items-center justify-center p-4 relative overflow-hidden">
                <video ref={videoRef} autoPlay muted playsInline className="rounded-2xl w-full max-h-[650px] object-cover border-4 border-black shadow-2xl" />
              </div>
            </div>
          </div>

          <div className="space-y-6">

            {/* IDENTITY VERIFICATION PANEL */}
            <div className="rounded-3xl shadow-xl border overflow-hidden" style={{ backgroundColor: 'var(--sys-surface-card)', borderColor: 'var(--sys-border)' }}>
              <div className="border-b px-6 py-5" style={{ borderColor: 'var(--sys-border)' }}>
                <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: 'var(--sys-text-muted)' }}>Recognition Result</p>
                <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--sys-text-primary)' }}>Identity Profile</h2>
              </div>
              <div className="p-6">
                {verifiedStudent ? (
                  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-4 border-b pb-6" style={{ borderColor: 'var(--sys-border)' }}>
                      <div className="w-20 h-20 rounded-2xl border overflow-hidden shrink-0" style={{ backgroundColor: 'var(--sys-surface-muted)', borderColor: 'var(--sys-border)' }}>
                        {verifiedStudent.photoUrl ? (
                          <img src={verifiedStudent.photoUrl} alt="Face" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--sys-text-muted)' }}>
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-2xl font-black leading-tight" style={{ color: 'var(--sys-text-primary)' }}>{verifiedStudent.first_name} {verifiedStudent.last_name}</p>
                        <p className="text-sm font-bold text-cavite-maroon mt-1">{verifiedStudent.student_id}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border-subtle)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--sys-text-muted)' }}>Match Confidence</p>
                        <p className="text-lg font-black text-green-600">{verifiedStudent.matchPercentage}%</p>
                      </div>
                      <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border-subtle)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--sys-text-muted)' }}>Status</p>
                        <p className={`text-lg font-black ${verifiedStudent.status === 'GRANTED' ? 'text-green-600' : 'text-orange-500'}`}>
                          {verifiedStudent.status}
                        </p>
                      </div>
                      <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border-subtle)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--sys-text-muted)' }}>Grade Level</p>
                        <p className="text-sm font-bold" style={{ color: 'var(--sys-text-primary)' }}>{verifiedStudent.grade_level || 'N/A'}</p>
                      </div>
                      <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border-subtle)' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--sys-text-muted)' }}>Section</p>
                        <p className="text-sm font-bold" style={{ color: 'var(--sys-text-primary)' }}>{verifiedStudent.section || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="pt-2 text-center">
                      <p className="text-[10px] font-medium" style={{ color: 'var(--sys-text-muted)' }}>Recorded at: {verifiedStudent.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-2xl p-6 min-h-[250px] flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)', color: 'var(--sys-text-muted)' }}>
                    <svg className="w-12 h-12 mb-3 animate-pulse" style={{ color: 'var(--sys-surface-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z"></path></svg>
                    <p className="font-bold tracking-tight">Awaiting Scan</p>
                    <p className="text-xs text-center mt-1 max-w-[200px]">Identity profile will securely appear here once a face is successfully matched.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl shadow-xl border overflow-hidden" style={{ backgroundColor: 'var(--sys-surface-card)', borderColor: 'var(--sys-border)' }}>
              <div className="border-b px-6 py-5" style={{ borderColor: 'var(--sys-border)' }}>
                <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: 'var(--sys-text-muted)' }}>System Status</p>
                <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--sys-text-primary)' }}>Access Scanner</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--sys-text-muted)' }}>Scanner Status</p>
                    <p className="text-2xl font-black text-green-600 mt-1">ACTIVE</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>



            <div className="bg-cavite-maroon text-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-6">
                <p className="text-xs font-black tracking-[0.2em] uppercase text-red-200">AMSIRS SECURITY</p>
                <h2 className="text-2xl font-black mt-2">Facial Recognition Active</h2>
                <p className="text-sm text-red-100 mt-3 leading-relaxed">
                  Every successful facial scan is securely recorded with timestamp, and biometric snapshot for campus monitoring.
                </p>
              </div>
            </div>
            <div className="mt-auto pt-8">
              <p className="text-center text-[10px] font-medium px-4" style={{ color: 'var(--sys-text-muted)' }}>
                This area is monitored by AMSIRS biometric tracking. By proceeding, you consent to the processing of your biometric data for security purposes in compliance with the Data Privacy Act of 2012 (RA 10173).
              </p>
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  );
}