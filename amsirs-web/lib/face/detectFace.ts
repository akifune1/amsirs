import * as faceapi from "face-api.js";

export async function detectFace(
  video: HTMLVideoElement
) {
  return await faceapi
    .detectSingleFace(
      video,
      new faceapi.TinyFaceDetectorOptions()
    )
    .withFaceLandmarks()
    .withFaceDescriptor();
}