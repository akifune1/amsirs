'use client';

import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { loadModels } from '@/lib/face/loadModels';
import { supabase } from '@/lib/supabase';
import { saveFaceEmbedding } from '@/app/register/actions';
import { getMissingEmbeddings } from './actions';

export default function RecoveryPage() {
  const [status, setStatus] = useState('Initializing...');
  const [missingStudents, setMissingStudents] = useState<any[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

  useEffect(() => {
    async function init() {
      setStatus('Loading AI Models...');
      await loadModels();
      setStatus('Fetching missing students...');
      
      try {
        const missing = await getMissingEmbeddings();
        setMissingStudents(missing);
        setProgress({ current: 0, total: missing.length });
        setStatus(missing.length > 0 ? 'Ready to process' : 'No missing embeddings found!');
      } catch (err: any) {
        setStatus(`Error: ${err.message}`);
      }
    }
    init();
  }, []);

  async function startProcessing() {
    setStatus('Processing...');
    
    for (let i = 0; i < missingStudents.length; i++) {
      const student = missingStudents[i];
      addLog(`Processing ${student.first_name} ${student.last_name}...`);
      
      try {
        const imageUrl = supabase.storage
          .from('student_faces')
          .getPublicUrl(student.face_photo_path).data.publicUrl;

        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = imageUrl;

        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
        });

        const detection = await faceapi
          .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          addLog(`❌ No face detected in photo for ${student.first_name}`);
          continue;
        }

        await saveFaceEmbedding(student.id, Array.from(detection.descriptor));
        addLog(`✅ Successfully saved embedding for ${student.first_name}`);
      } catch (err: any) {
        addLog(`❌ Error processing ${student.first_name}: ${err.message}`);
      }

      setProgress(prev => ({ ...prev, current: i + 1 }));
    }

    setStatus('Finished processing!');
  }

  return (
    <div className="p-10 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Face Embedding Recovery Tool</h1>
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="font-semibold text-lg">{status}</p>
        {progress.total > 0 && (
          <p className="text-gray-600 mt-2">
            Progress: {progress.current} / {progress.total}
          </p>
        )}
      </div>

      {missingStudents.length > 0 && progress.current < progress.total && status === 'Ready to process' && (
        <button 
          onClick={startProcessing}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
        >
          Start Recovery Processing
        </button>
      )}

      <div className="bg-black text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}
