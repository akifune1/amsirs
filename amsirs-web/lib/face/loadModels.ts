import * as faceapi from "face-api.js";

export async function loadModels() {
  const MODEL_URL = "/models";

  const loadPromises = [];

  if (!faceapi.nets.tinyFaceDetector.isLoaded) {
    loadPromises.push(faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL));
  }
  if (!faceapi.nets.faceLandmark68Net.isLoaded) {
    loadPromises.push(faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL));
  }
  if (!faceapi.nets.faceRecognitionNet.isLoaded) {
    loadPromises.push(faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL));
  }

  if (loadPromises.length > 0) {
    await Promise.all(loadPromises);
  }
}