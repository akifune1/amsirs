import * as faceapi from "face-api.js";

export function compareFaces(
  savedDescriptor: number[],
  currentDescriptor: Float32Array
) {
  return faceapi.euclideanDistance(
    savedDescriptor,
    currentDescriptor
  );
}

export function getMatchPercentage(distance: number) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round((1 - distance / 0.6) * 100)
    )
  );
}