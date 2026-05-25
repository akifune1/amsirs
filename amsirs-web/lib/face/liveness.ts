// @/lib/face/liveness.ts
import * as faceapi from "face-api.js";

// Make sure you still have your getDistance helper in this file!
export function getDistance(point1: faceapi.Point, point2: faceapi.Point): number {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
}

/**
 * Calculates how open the mouth is based on the inner lips.
 * Returns a ratio. ~0.0 to 0.1 means closed. > 0.4 means open.
 */
export function getMouthOpenRatio(landmarks: faceapi.FaceLandmarks68): number {
  const points = landmarks.positions;
  
  // Outer corners of the mouth for width
  const mouthWidth = getDistance(points[48], points[54]);
  
  // Inner top lip (62) to inner bottom lip (66)
  const mouthHeight = getDistance(points[62], points[66]);
  
  if (mouthWidth === 0) return 0;
  
  return mouthHeight / mouthWidth;
}