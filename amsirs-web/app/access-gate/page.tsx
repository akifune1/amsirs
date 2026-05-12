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
    await loadModels();
    await startCamera();
  }

  async function startCamera() {
    const stream =
      await navigator.mediaDevices.getUserMedia({
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

    ctx?.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise<Blob | null>(
      (resolve) => {
        canvas.toBlob(resolve, "image/jpeg");
      }
    );
  }

  async function scanFace() {
    try {
      setLoading(true);

      if (!videoRef.current) return;

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

      const currentDescriptor =
        detection.descriptor;

      const { data, error } =
        await supabase
          .from("face_embeddings")
          .select(`
            *,
            students (
              id,
              first_name,
              last_name,
              student_id,
              face_photo_path
            )
          `);

      if (error || !data) {
        setMessage(
          "FAILED TO LOAD STUDENTS"
        );
        return;
      }

      let bestMatch = null;
      let lowestDistance = 999;

      for (const face of data) {
        const distance =
          compareFaces(
            face.descriptor,
            currentDescriptor
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

      const matchPercentage =
        getMatchPercentage(
          lowestDistance
        );

      if (
        matchPercentage >= 75 &&
        bestMatch
      ) {
        let snapshotPath = null;

        const snapshotBlob =
          await captureSnapshot();

        if (snapshotBlob) {
          const fileName = `scan-${Date.now()}.jpg`;

          const { error: uploadError } =
            await supabase.storage
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

        await supabase
          .from("access_logs")
          .insert({
            student_id:
              bestMatch.students.id,

            match_percentage:
              matchPercentage,

            face_distance:
              lowestDistance,

            snapshot_path:
              snapshotPath,
          });

        setMessage(
          `ACCESS GRANTED

${bestMatch.students.first_name}
${bestMatch.students.last_name}

Student ID:
${bestMatch.students.student_id}

Match:
${matchPercentage}%`
        );
      } else {
        setMessage(
          "FACE NOT RECOGNIZED"
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
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6">
      <h1 className="text-4xl font-bold">
        Access Gate
      </h1>

      <video
        ref={videoRef}
        autoPlay
        muted
        className="rounded-xl border w [500px]"
      />

      <canvas
        ref={canvasRef}
        className="hidden"
      />

      <button
        onClick={scanFace}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl"
      >
        {loading
          ? "SCANNING..."
          : "SCAN FACE"}
      </button>

      <div className="text-center whitespace-pre-line text-xl">
        {message}
      </div>
    </div>
  );
}