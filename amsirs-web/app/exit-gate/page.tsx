"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as faceapi from "face-api.js";
import { supabase } from "@/lib/supabase";
import { loadModels } from "@/lib/face/loadModels";
import { compareFaces, getMatchPercentage } from "@/lib/face/compareFaces";
import { getMouthOpenRatio } from "@/lib/face/liveness";

export default function ExitGatePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanningRef = useRef(false);

  // Liveness Refs
  const livenessStepRef = useRef(0);
  // 0 = Wait for closed mouth
  // 1 = Wait for open mouth
  // 2 = Verified

  // Temporary holding cell for the neutral snapshot
  const pendingSnapshotRef = useRef<Blob | null>(null);

  const [message, setMessage] = useState("INITIALIZING EXIT SYSTEM...");

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
      setMessage("EXIT GATE READY\n\nWaiting for face...");
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

  async function captureSnapshot() {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return null;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg");
    });
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
          // CAPTURE THE NEUTRAL SNAPSHOT IN THE BACKGROUND
          // ==========================================
          pendingSnapshotRef.current = await captureSnapshot();

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
      // DATABASE MATCHING
      // =========================
      const { data, error } = await supabase.from("face_embeddings").select("*");
      if (error || !data) {
        setMessage("FAILED TO LOAD EMBEDDINGS");
        resetScanner();
        return;
      }

      let bestMatch = null;
      let lowestDistance = 999;
      for (const face of data) {
        const distance = compareFaces(face.descriptor, currentDescriptor);
        if (distance < lowestDistance) {
          lowestDistance = distance;
          bestMatch = face;
        }
      }

      const matchPercentage = getMatchPercentage(lowestDistance);

      if (bestMatch && lowestDistance < 0.75) {
        const { data: studentData } = await supabase
          .from("students")
          .select("*")
          .eq("id", bestMatch.student_id)
          .single();

        if (!studentData) {
          setMessage("STUDENT NOT FOUND");
          resetScanner();
          return;
        }

        // =====================
        // PREVENT DUPLICATES (EXIT CHECK)
        // =====================
        const { data: recentLog } = await supabase
          .from("access_logs")
          .select("*")
          .eq("student_id", studentData.id)
          .eq("action", "EXIT")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (recentLog) {
          const lastScan = new Date(recentLog.created_at).getTime();
          const now = Date.now();
          if ((now - lastScan) / 1000 < 15) {
            setMessage(`EXIT ALREADY RECORDED\n\n${studentData.first_name} ${studentData.last_name}`);
            resetScanner();
            return;
          }
        }

        // =====================
        // SNAPSHOT & LOGGING
        // =====================
        let snapshotPath = null;
        
        // Grab the neutral photo we took at Step 0!
        const snapshotBlob = pendingSnapshotRef.current;

        if (snapshotBlob) {
          const fileName = `exit-${Date.now()}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from("access-snapshots")
            .upload(fileName, snapshotBlob);
          if (!uploadError) snapshotPath = fileName;
        }

        await supabase.from("access_logs").insert({
          student_id: studentData.id,
          match_percentage: matchPercentage,
          face_distance: lowestDistance,
          snapshot_path: snapshotPath,
          action: "EXIT",
        });

        setMessage(`EXIT RECORDED\n\n${studentData.first_name} ${studentData.last_name}\n\nStudent ID:\n${studentData.student_id}\n\nMatch:\n${matchPercentage}%`);
        
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
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-cavite-maroon text-white px-3 py-1.5 rounded-lg font-black text-lg shadow-sm">AMSIRS</div>
          <div className="hidden md:block">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none">Cavite National High School</p>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-tight">Access Monitoring System</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/access-gate" className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Entry Gate</Link>
          <Link href="/exit-gate" className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-cavite-maroon text-white shadow-lg">Exit Gate</Link>
          <Link href="/access-logs" className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Access Logs</Link>
          <Link href="/campus-status" className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Campus Status</Link>
          <Link href="/incident-dashboard" className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all">Incident Logs</Link>
        </div>
      </nav>

      <main className="p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Facial Recognition Exit Scanner</h1>
          <p className="text-gray-500 font-medium mt-2">Real-time biometric campus exit verification powered by AI facial recognition.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black tracking-[0.2em] uppercase text-gray-400">Live Security Feed</p>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">Exit Gate Camera</h2>
                </div>
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  EXIT ACTIVE
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
                <h2 className="text-xl font-bold text-gray-900 mt-1">Exit Scanner</h2>
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
                <h2 className="text-xl font-bold text-gray-900 mt-1">Exit Verification</h2>
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
                <p className="text-xs font-black tracking-[0.2em] uppercase text-red-100">AMSIRS SECURITY</p>
                <h2 className="text-2xl font-black mt-2">Exit Recognition Active</h2>
                <p className="text-sm text-gray-100/90 mt-3 leading-relaxed">
                  Every successful exit scan is securely recorded with timestamp, and biometric snapshot for campus movement monitoring.
                </p>
              </div>
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  );
}