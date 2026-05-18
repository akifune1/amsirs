"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { supabase } from "@/lib/supabase";
import { loadModels } from "@/lib/face/loadModels";
import { compareFaces, getMatchPercentage } from "@/lib/face/compareFaces";

export default function AccessGatePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    try {
      console.log("Initializing: Loading models...");
      await loadModels();
      
      console.log("Initializing: Starting camera...");
      await startCamera();

      console.log("MODELS + CAMERA READY");
    } catch (error) {
      console.error("Initialization Error:", error);
      setMessage("FAILED TO INITIALIZE");
    }
  }

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
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

  async function scanFace() {
    try {
      setLoading(true);
      setMessage("SCANNING FACE...");
      console.log("--- NEW SCAN STARTED ---");

      if (!videoRef.current) {
        console.error("Video reference is missing.");
        return;
      }

      // =========================
      // DETECT FACE
      // =========================
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions()
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        console.log("Result: No face detected in frame.");
        setMessage("NO FACE DETECTED");
        return;
      }

      console.log("Result: Face successfully detected.");
      const currentDescriptor = detection.descriptor;

      // =========================
      // LOAD EMBEDDINGS
      // =========================
      console.log("Supabase: Fetching face_embeddings...");
      const { data, error } = await supabase.from("face_embeddings").select("*");

      if (error) {
        console.error("Supabase Error (face_embeddings fetch):", error.message, error.details);
        setMessage("FAILED TO LOAD EMBEDDINGS");
        return;
      }

      if (!data) {
        console.error("Supabase Error: No data returned for face_embeddings.");
        setMessage("FAILED TO LOAD EMBEDDINGS");
        return;
      }

      console.log("TOTAL EMBEDDINGS LOADED:", data.length);

      // =========================
      // FIND BEST MATCH
      // =========================
      let bestMatch = null;
      let lowestDistance = 999;

      for (const face of data) {
        const distance = compareFaces(face.descriptor, currentDescriptor);
        // Commenting this out to prevent console spam if you have hundreds of students
        // console.log(`Comparing ${face.student_id} - DISTANCE:`, distance);

        if (distance < lowestDistance) {
          lowestDistance = distance;
          bestMatch = face;
        }
      }

      console.log("LOWEST DISTANCE FOUND:", lowestDistance);
      const matchPercentage = getMatchPercentage(lowestDistance);
      console.log("CALCULATED MATCH %:", matchPercentage);

      // =========================
      // MATCH FOUND
      // =========================
      if (bestMatch && lowestDistance < 0.75) {
        console.log(`Match threshold met. Best match ID: ${bestMatch.student_id}`);

        // =====================
        // LOAD STUDENT INFO
        // =====================
        console.log(`Supabase: Fetching student info for ID: ${bestMatch.student_id}...`);
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("*")
          .eq("id", bestMatch.student_id)
          .single();

        if (studentError) {
          console.error("Supabase Error (students fetch):", studentError.message, studentError.details);
          setMessage("STUDENT RECORD NOT FOUND");
          return;
        }
        
        if (!studentData) {
          console.error("Student data came back null.");
          setMessage("STUDENT RECORD NOT FOUND");
          return;
        }

        console.log("Student info successfully loaded:", studentData.first_name, studentData.last_name);

        // =====================
        // CAPTURE SNAPSHOT
        // =====================
        let snapshotPath = null;
        console.log("Capturing webcam snapshot...");
        const snapshotBlob = await captureSnapshot();

        if (snapshotBlob) {
          const fileName = `scan-${Date.now()}.jpg`;
          console.log(`Supabase: Uploading snapshot to storage... File: ${fileName}`);
          
          const { error: uploadError } = await supabase.storage
            .from("access-snapshots")
            .upload(fileName, snapshotBlob);

          if (uploadError) {
            console.error("Supabase Error (storage upload):", uploadError.message, uploadError);
          } else {
            console.log("Snapshot successfully uploaded to storage.");
            snapshotPath = fileName;
          }
        } else {
          console.error("Failed to generate Blob from canvas.");
        }

        // =====================
        // SAVE ACCESS LOG
        // =====================
        console.log("Supabase: Inserting access log...");
        const { error: logError } = await supabase.from("access_logs").insert({
          student_id: studentData.id,
          match_percentage: matchPercentage,
          face_distance: lowestDistance,
          snapshot_path: snapshotPath,
        });

        if (logError) {
          console.error("Supabase Error (access_logs insert):", logError.message, logError.details);
        } else {
          console.log("Access log successfully inserted into database.");
        }

        // =====================
        // SUCCESS MESSAGE
        // =====================
        setMessage(
          `ACCESS GRANTED\n\n${studentData.first_name} ${studentData.last_name}\n\nStudent ID:\n${studentData.student_id}\n\nMatch:\n${matchPercentage}%`
        );
      } else {
        // =====================
        // NO MATCH
        // =====================
        console.log("Face recognized, but distance was above 0.75 threshold (No Match).");
        setMessage(`FACE NOT RECOGNIZED\n\nDistance:\n${lowestDistance}`);
      }
    } catch (error) {
      console.error("Unexpected System Error in scanFace:", error);
      setMessage("SYSTEM ERROR");
    } finally {
      setLoading(false);
      console.log("--- SCAN FINISHED ---");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-4xl font-bold">Access Gate</h1>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-[500px] rounded-2xl border-4 border-black"
      />

      <canvas ref={canvasRef} className="hidden" />

      <button
        onClick={scanFace}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
      >
        {loading ? "SCANNING..." : "SCAN FACE"}
      </button>

      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-xl text-center whitespace-pre-line text-xl font-semibold">
        {message}
      </div>
    </div>
  );
}