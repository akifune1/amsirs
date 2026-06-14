import * as faceapi from "face-api.js";

export function compareFaces(
  savedDescriptor: number[],
  currentDescriptor: Float32Array
) {
  return faceapi.euclideanDistance(
    new Float32Array(savedDescriptor),
    currentDescriptor
  );
}

export function getMatchPercentage(
  distance: number
) {
  const percentage =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (1 - distance / 0.55) * 100
        )
      )
    );

  return percentage;
}