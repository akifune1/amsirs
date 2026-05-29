"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { loadModels } from "@/lib/face/loadModels";
import { compareFaces, getMatchPercentage } from "@/lib/face/compareFaces";
import { getMouthOpenRatio } from "@/lib/face/liveness";
import {
  fetchFaceEmbeddings,
  lookupStudent,
  checkDuplicateScan,
  uploadSnapshotAndLog,
} from "@/app/gate/actions";

export default function AccessGatePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanningRef = useRef(false);

  // Liveness Refs
  const livenessStepRef = useRef(0);
  // 0 = Wait for closed mouth
  // 1 = Wait for open mouth
  // 2 = Verified

  // NEW: Temporary holding cell for the neutral snapshot
  const pendingSnapshotRef = useRef<string | null>(null);

  const [message, setMessage] = useState("INITIALIZING SYSTEM...");

  useEffect(() => {
    initialize();
    return () => {
      const video = videoRef.current;
      if (video?.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  async function initialize() {
    try {
      setMessage("LOADING AI MODELS...");
      await loadModels();
      setMessage("STARTING CAMERA...");
      await startCamera();
      setMessage("SYSTEM READY\n\nWaiting for face...");
      startAutoScan();
    } catch (error) {
      console.error(error);
      setMessage("FAILED TO INITIALIZE SYSTEM");
    }
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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
    setInterval(async () => {
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

      if (bestMatch && lowestDistance < 0.75) {
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

        setMessage(`ACCESS GRANTED\n\n${studentData.first_name} ${studentData.last_name}\n\nStudent ID:\n${studentData.student_id}\n\nMatch:\n${matchPercentage}%`);
        
        resetScanner(); // Clean up for the next person
      } else {
        setMessage("FACE NOT RECOGNIZED");
        resetScanner();
      }
    } catch (error) {
      console.error(error);
      setMessage("SYSTEM ERROR");
      resetScanner();
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      

      <main className="p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Facial Recognition Entry Scanner</h1>
          <p className="text-gray-500 font-medium mt-2">Real-time biometric campus entry verification powered by AI facial recognition.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black tracking-[0.2em] uppercase text-gray-400">Live Security Feed</p>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">Entry Gate Camera</h2>
                </div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  LIVE
                </div>
              </div>
              <div className="bg-black flex items-center justify-center p-4">
                <video ref={videoRef} autoPlay muted playsInline className="rounded-2xl w-full max-h-[650px] object-cover border-4 border-black shadow-2xl" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-5">
                <p className="text-xs font-black tracking-[0.2em] uppercase text-gray-400">System Status</p>
                <h2 className="text-xl font-bold text-gray-900 mt-1">AI Monitoring</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Scanner Status</p>
                    <p className="text-2xl font-black text-green-600 mt-1">ACTIVE</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
                    <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-5">
                <p className="text-xs font-black tracking-[0.2em] uppercase text-gray-400">Recognition Result</p>
                <h2 className="text-xl font-bold text-gray-900 mt-1">Access Verification</h2>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 min-h-[250px] flex items-center justify-center">
                  <div className="text-center whitespace-pre-line">
                    <div className="text-xl font-bold text-gray-800 leading-relaxed">{message}</div>
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
              <p className="text-center text-[10px] text-gray-500 font-medium px-4">
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