'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { loadModels } from '@/lib/face/loadModels';
import toast from 'react-hot-toast';

interface CameraCaptureProps {
  name: string;
  required?: boolean;
  onCapture?: (file: File | null) => void;
}

export default function CameraCapture({ name, required = false, onCapture }: CameraCaptureProps) {
  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // AI State
  const [isAiReady, setIsAiReady] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [descriptor, setDescriptor] = useState<number[] | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // Load models on mount
  useEffect(() => {
    isMounted.current = true;
    async function init() {
      try {
        await loadModels();
        if (isMounted.current) setIsAiReady(true);
      } catch (err) {
        console.error("Failed to load AI models", err);
      }
    }
    init();

    return () => {
      isMounted.current = false;
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setFaceDetected(false);
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      
      // Give video time to start before scanning
      videoRef.current.onloadedmetadata = () => {
        startFaceDetectionLoop();
      };
    }
  }, [stream, mode]);

  const startFaceDetectionLoop = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    
    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !isAiReady) return;

      try {
        const detection = await faceapi.detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        );
        
        if (isMounted.current) {
          setFaceDetected(!!detection);
        }
      } catch (e) {
        // Ignored, likely unmounted
      }
    }, 500);
  };

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
    updateFileInput(null);
    
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(newStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
      setMode('upload');
    }
  };

  const capturePhoto = () => {
    if (!faceDetected) return; // Strict guard
    
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(async (blob) => {
          if (blob) {
            setIsProcessing(true);
            const toastId = toast.loading("Finalizing capture...");
            
            try {
              const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
              const imageUrl = URL.createObjectURL(blob);
              const image = new Image();
              image.src = imageUrl;
              
              await new Promise((resolve) => { image.onload = resolve; });
              
              const detection = await faceapi.detectSingleFace(
                image,
                new faceapi.TinyFaceDetectorOptions()
              ).withFaceLandmarks().withFaceDescriptor();

              if (!detection) {
                toast.error("Failed to extract face. Please hold still and try again.", { id: toastId });
                setIsProcessing(false);
                return;
              }

              setDescriptor(Array.from(detection.descriptor));
              setPreviewUrl(imageUrl);
              updateFileInput(file);
              toast.success("Face captured!", { id: toastId });
              stopCamera();
            } catch (err) {
              toast.error("Capture failed.", { id: toastId });
            } finally {
              setIsProcessing(false);
            }
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const handleRetake = () => {
    startCamera();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      updateFileInput(null);
      return;
    }

    if (!isAiReady) {
      toast.error("AI Models are still loading. Please wait a moment.");
      e.target.value = '';
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Validating face in image...");

    try {
      const imageUrl = URL.createObjectURL(file);
      const image = new Image();
      image.src = imageUrl;
      
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
      });

      const detection = await faceapi.detectSingleFace(
        image,
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();

      if (!detection) {
        toast.error("No face detected! Please upload a clear picture of your face.", { id: toastId, duration: 4000 });
        e.target.value = ''; // Reset input
        setPreviewUrl(null);
        setDescriptor(null);
        updateFileInput(null);
        setIsProcessing(false);
        return;
      }

      setDescriptor(Array.from(detection.descriptor));
      toast.success("Face verified!", { id: toastId });
      setPreviewUrl(imageUrl);
      if (onCapture) onCapture(file);
    } catch (err) {
      toast.error("Failed to process image.", { id: toastId });
      e.target.value = '';
    } finally {
      setIsProcessing(false);
    }
  };

  const switchToUpload = () => {
    stopCamera();
    setMode('upload');
    setPreviewUrl(null);
    setDescriptor(null);
    updateFileInput(null);
  };

  return (
    <div className="space-y-4">
      {descriptor && <input type="hidden" name={`${name}Descriptor`} value={JSON.stringify(descriptor)} />}
      {/* Toggles */}
      <div className="flex gap-2 p-1 rounded-lg w-full max-w-sm" style={{ backgroundColor: 'var(--sys-surface-subtle)' }}>
        <button
          type="button"
          onClick={switchToUpload}
          className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
            mode === 'upload' 
              ? 'shadow-sm' 
              : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          style={mode === 'upload' ? { backgroundColor: 'var(--sys-surface)', color: 'var(--sys-text-primary)' } : { color: 'var(--sys-text-muted)' }}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={startCamera}
          className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
            mode === 'camera' 
              ? 'shadow-sm' 
              : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          style={mode === 'camera' ? { backgroundColor: 'var(--sys-surface)', color: 'var(--sys-text-primary)' } : { color: 'var(--sys-text-muted)' }}
        >
          Use Camera
        </button>
      </div>

      {/* File Upload Mode */}
      <div className={mode === 'upload' && !previewUrl ? 'block' : 'hidden'}>
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          required={required && !previewUrl}
          accept="image/jpeg, image/png"
          onChange={handleFileChange}
          disabled={isProcessing || !isAiReady}
          className="block w-full text-sm file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-cavite-maroon/10 file:text-cavite-maroon hover:file:bg-cavite-maroon/20 transition-all cursor-pointer border rounded-xl focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 focus:border-cavite-maroon disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--sys-input-bg)', borderColor: 'var(--sys-border)', color: 'var(--sys-input-text)' }}
        />
        {!isAiReady && mode === 'upload' && (
          <p className="text-xs text-amber-600 mt-2 font-medium">Initializing AI verification...</p>
        )}
      </div>

      {/* Camera Mode */}
      {mode === 'camera' && !previewUrl && (
        <div className={`relative rounded-xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center border-4 transition-colors duration-300 shadow-inner ${faceDetected ? 'border-green-500' : 'border-red-500/50'}`}>
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

          {/* Overlay Badge */}
          {stream && (
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-colors ${faceDetected ? 'bg-green-500' : 'bg-red-500/80 backdrop-blur-sm'}`}>
              {faceDetected ? 'Face Detected ✅' : 'Looking for Face...'}
            </div>
          )}
          
          <button
            type="button"
            onClick={capturePhoto}
            disabled={!faceDetected}
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-4 shadow-lg transition-all ${faceDetected ? 'border-green-500 hover:scale-105 active:scale-95 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
            style={faceDetected ? { backgroundColor: 'var(--sys-surface)' } : { backgroundColor: 'var(--sys-surface-muted)', borderColor: 'var(--sys-border)' }}
            aria-label="Take Photo"
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Preview Mode */}
      {previewUrl && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center border" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}>
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
              className="w-full py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ backgroundColor: 'var(--sys-surface-muted)', color: 'var(--sys-text-primary)' }}
            >
              Retake Photo
            </button>
          )}
          {mode === 'upload' && (
             <button
              type="button"
              onClick={switchToUpload}
              className="w-full py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              style={{ backgroundColor: 'var(--sys-surface-muted)', color: 'var(--sys-text-primary)' }}
           >
             Choose Another File
           </button>
          )}
        </div>
      )}
    </div>
  );
}
