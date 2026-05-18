"use client";

import { useEffect, useRef, useState } from "react";

import * as faceapi from "face-api.js";

import { supabase } from "@/lib/supabase";

import { loadModels } from "@/lib/face/loadModels";

import {
  compareFaces,
  getMatchPercentage,
} from "@/lib/face/compareFaces";

export default function AccessGatePage() {

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    initialize();
  }, []);

  async function initialize() {
    try {

      await loadModels();

      await startCamera();

      console.log(
        "MODELS + CAMERA READY"
      );

    } catch (error) {

      console.error(error);

      setMessage(
        "FAILED TO INITIALIZE"
      );
    }
  }

  async function startCamera() {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: true,
      });

    if (videoRef.current) {
      videoRef.current.srcObject =
        stream;
    }
  }

  async function captureSnapshot() {

    const canvas =
      canvasRef.current;

    const video =
      videoRef.current;

    if (!canvas || !video)
      return null;

    const ctx =
      canvas.getContext("2d");

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    ctx?.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise<
      Blob | null
    >((resolve) => {

      canvas.toBlob(
        resolve,
        "image/jpeg"
      );
    });
  }

  async function scanFace() {

    try {

      setLoading(true);

      setMessage(
        "SCANNING FACE..."
      );

      if (!videoRef.current)
        return;

      // =========================
      // DETECT FACE
      // =========================

      const detection =
        await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

      if (!detection) {

        setMessage(
          "NO FACE DETECTED"
        );

        return;
      }

      console.log(
        "FACE DETECTED"
      );

      const currentDescriptor =
        detection.descriptor;

      // =========================
      // LOAD EMBEDDINGS
      // =========================

      const {
        data,
        error,
      } = await supabase
        .from("face_embeddings")
        .select("*");

      if (error || !data) {

        console.error(error);

        setMessage(
          "FAILED TO LOAD EMBEDDINGS"
        );

        return;
      }

      console.log(
        "TOTAL EMBEDDINGS:",
        data.length
      );

      // =========================
      // FIND BEST MATCH
      // =========================

      let bestMatch = null;

      let lowestDistance =
        999;

      for (const face of data) {

        const distance =
          compareFaces(
            face.descriptor,
            currentDescriptor
          );

        console.log(
          face.student_id,
          "DISTANCE:",
          distance
        );

        if (
          distance <
          lowestDistance
        ) {

          lowestDistance =
            distance;

          bestMatch = face;
        }
      }

      console.log(
        "LOWEST DISTANCE:",
        lowestDistance
      );

      const matchPercentage =
        getMatchPercentage(
          lowestDistance
        );

      console.log(
        "MATCH %:",
        matchPercentage
      );

      // =========================
      // MATCH FOUND
      // =========================

      if (
        bestMatch &&
        lowestDistance < 0.75
      ) {

        // =====================
        // LOAD STUDENT INFO
        // =====================

        const {
          data: studentData,
          error: studentError,
        } = await supabase
          .from("students")
          .select("*")
          .eq(
            "id",
            bestMatch.student_id
          )
          .single();

        if (
          studentError ||
          !studentData
        ) {

          console.error(
            studentError
          );

          setMessage(
            "STUDENT RECORD NOT FOUND"
          );

          return;
        }

        // =====================
        // CAPTURE SNAPSHOT
        // =====================

        let snapshotPath =
          null;

        const snapshotBlob =
          await captureSnapshot();

        if (snapshotBlob) {

          const fileName =
            `scan-${Date.now()}.jpg`;

          const {
            error:
              uploadError,
          } = await supabase
            .storage
            .from(
              "access-snapshots"
            )
            .upload(
              fileName,
              snapshotBlob
            );

          if (!uploadError) {
            snapshotPath =
              fileName;
          }
        }

        // =====================
        // SAVE ACCESS LOG
        // =====================

        const {
          error: logError,
        } = await supabase
          .from("access_logs")
          .insert({
            student_id:
              studentData.id,

            match_percentage:
              matchPercentage,

            face_distance:
              lowestDistance,

            snapshot_path:
              snapshotPath,
          });

        if (logError) {
          console.error(
            logError
          );
        }

        // =====================
        // SUCCESS MESSAGE
        // =====================

        setMessage(
      `ACCESS GRANTED

      ${studentData.first_name}
      ${studentData.last_name}

      Student ID:
      ${studentData.student_id}

      Match:
      ${matchPercentage}%`
              );

            } else {

              // =====================
              // NO MATCH
              // =====================

              setMessage(
      `FACE NOT RECOGNIZED

      Distance:
      ${lowestDistance}`
              );
            }

          } catch (error) {

            console.error(error);

            setMessage(
              "SYSTEM ERROR"
            );

          } finally {

            setLoading(false);
          }
        }

        return (
          <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-6 p-6">

            <h1 className="text-4xl font-bold">
              Access Gate
            </h1>

            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-500px rounded-2xl border-4 border-black"
            />

            <canvas
              ref={canvasRef}
              className="hidden"
            />

            <button
              onClick={scanFace}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
            >
              {loading
                ? "SCANNING..."
                : "SCAN FACE"}
            </button>

            <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-xl text-center whitespace-pre-line text-xl font-semibold">

              {message}

            </div>

          </div>
        );
      }