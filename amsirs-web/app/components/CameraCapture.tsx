'use client';

import { useState, useRef, useEffect } from 'react';

interface CameraCaptureProps {
  name: string;
  required?: boolean;
  onCapture?: (file: File | null) => void;
}

export default function CameraCapture({ name, required = false, onCapture }: CameraCaptureProps) {
  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera when unmounting or switching modes
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stream]);

  // Ensure srcObject is set after the video element mounts
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, mode]);

  const updateFileInput = (file: File | null) => {
    if (fileInputRef.current) {
      if (file) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      } else {
        fileInputRef.current.value = '';
      }
    }
    if (onCapture) onCapture(file);
  };

  const startCamera = async () => {
    setMode('camera');
    setPreviewUrl(null);
    updateFileInput(null); // Reset
    
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(newStream);
      // Removed direct assignment to videoRef.current since it might not be mounted yet.
      // This is now handled in the useEffect above.
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setMode('upload');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Handle mirroring correctly for the output image
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setPreviewUrl(URL.createObjectURL(blob));
            updateFileInput(file);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleRetake = () => {
    startCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      if (onCapture) onCapture(file);
    } else {
      setPreviewUrl(null);
      if (onCapture) onCapture(null);
    }
  };

  const switchToUpload = () => {
    stopCamera();
    setMode('upload');
    setPreviewUrl(null);
    updateFileInput(null);
  };

  return (
    <div className="space-y-4">
      {/* Toggles */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-full max-w-sm">
        <button
          type="button"
          onClick={switchToUpload}
          className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
            mode === 'upload' 
              ? 'bg-white shadow-sm text-cavite-maroon' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={startCamera}
          className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
            mode === 'camera' 
              ? 'bg-white shadow-sm text-cavite-maroon' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Use Camera
        </button>
      </div>

      {/* The single actual file input that submits with the form */}
      <div className={mode === 'upload' && !previewUrl ? 'block' : 'hidden'}>
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          required={required}
          accept="image/jpeg, image/png"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-cavite-maroon/10 file:text-cavite-maroon hover:file:bg-cavite-maroon/20 transition-all cursor-pointer border border-gray-300 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon"
        />
      </div>

      {/* Camera Mode */}
      {mode === 'camera' && !previewUrl && (
        <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center border border-gray-300 shadow-inner">
          {stream ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover transform scale-x-[-1]" 
            />
          ) : (
            <p className="text-gray-400 text-sm font-medium">Starting camera...</p>
          )}
          
          <button
            type="button"
            onClick={capturePhoto}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full border-4 border-gray-300 shadow-lg hover:scale-105 active:scale-95 transition-transform"
            aria-label="Take Photo"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Preview Mode (Works for both camera capture and file upload preview) */}
      {previewUrl && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-[4/3] flex items-center justify-center border border-gray-300">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-full object-cover" 
            />
          </div>
          {mode === 'camera' && (
            <button
              type="button"
              onClick={handleRetake}
              className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
            >
              Retake Photo
            </button>
          )}
          {mode === 'upload' && (
             <button
              type="button"
              onClick={switchToUpload}
              className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
           >
             Choose Another File
           </button>
          )}
        </div>
      )}
    </div>
  );
}
