'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as faceapi from 'face-api.js';
import { supabase } from '@/lib/supabase';
import { 
  getDecryptedDescription, 
  getSecureImageUrl,
  searchStudents,
  linkStudentToIncident,
  unlinkStudentFromIncident
} from './actions';
import { loadModels } from '@/lib/face/loadModels';
import { compareFaces, getMatchPercentage } from '@/lib/face/compareFaces'; 

export default function IncidentRow({ report }: { report: any }) {
  // 🔒 Security State
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 🔗 Linking State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [involvements, setInvolvements] = useState(report.incident_involvements || []);

  // 🤖 AI Scanning State
  const imageRef = useRef<HTMLImageElement>(null);
  const [isScanningStatus, setIsScanningStatus] = useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  
  // Guard reference to prevent double-scanning
  const hasScannedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setInvolvements(report.incident_involvements || []);
  }, [report.incident_involvements]);

  // Load existing AI recommendations if any exist for this incident
  useEffect(() => {
    if (decryptedText) fetchRecommendations();
  }, [decryptedText]);

  // Handle live search for manual linking
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        const results = await searchStudents(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchRecommendations = async () => {
    const { data } = await supabase
      .from('incident_ai_matches')
      .select(`*, students(id, first_name, last_name, student_id)`)
      .eq('incident_id', report.id);
    if (data) setAiRecommendations(data);
  };

  const handleLink = async (studentId: string) => {
    setSearchQuery('');
    setSearchResults([]);
    await linkStudentToIncident(report.id, studentId);
  };

  const handleUnlink = async (involvementId: string) => {
    await unlinkStudentFromIncident(involvementId);
  };

  // 🧠 CORE FEATURE: Auto-Scan Evidence Picture
  const runAIAnalysis = async () => {
    // Guard clause: Only run if image exists and we haven't scanned yet
    if (!imageRef.current || hasScannedRef.current) return;
    hasScannedRef.current = true; // Lock the scanner for this session
    
    try {
      setIsScanningStatus('LOADING AI MODELS...');
      await loadModels();

      setIsScanningStatus('EXTRACTING FACES FROM EVIDENCE...');
      const detections = await faceapi
        .detectAllFaces(imageRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length === 0) {
        setIsScanningStatus('NO FACES DETECTED IN EVIDENCE.');
        setTimeout(() => setIsScanningStatus(null), 3000);
        return;
      }

      setIsScanningStatus(`FOUND ${detections.length} FACE(S). CROSS-REFERENCING DB...`);
      
      const { data: embeddings } = await supabase.from('face_embeddings').select('*');
      if (!embeddings) throw new Error("Could not load database embeddings");

      let newMatches = [];

      for (const detection of detections) {
        let bestMatch = null;
        let lowestDistance = 999;

        for (const face of embeddings) {
          const distance = compareFaces(face.descriptor, detection.descriptor);
          if (distance < lowestDistance) {
            lowestDistance = distance;
            bestMatch = face;
          }
        }

        if (bestMatch && lowestDistance < 0.6) {
          const matchPercentage = getMatchPercentage(lowestDistance);
          
          const { data: savedMatch } = await supabase
            .from('incident_ai_matches')
            .insert({
              incident_id: report.id,
              student_id: bestMatch.student_id,
              match_percentage: matchPercentage
            })
            .select(`*, students(id, first_name, last_name, student_id)`)
            .single();
            
          if (savedMatch) newMatches.push(savedMatch);
        }
      }

      if (newMatches.length > 0) {
        setAiRecommendations(prev => {
          // Prevent UI duplicates if DB already had them
          const existingIds = new Set(prev.map(r => r.student_id));
          const uniqueNew = newMatches.filter(m => !existingIds.has(m.student_id));
          return [...prev, ...uniqueNew];
        });
        setIsScanningStatus('ANALYSIS COMPLETE. MATCHES FOUND.');
      } else {
        setIsScanningStatus('NO DB MATCHES FOUND FOR DETECTED FACES.');
      }

      setTimeout(() => setIsScanningStatus(null), 4000);

    } catch (err) {
      console.error(err);
      setIsScanningStatus('SYSTEM ERROR DURING SCAN.');
      setTimeout(() => setIsScanningStatus(null), 3000);
    }
  };

  const handleToggleDetails = async () => {
    if (decryptedText) {
      setDecryptedText(null);
      setImageUrl(null);
      // Reset the scanner lock and recommendations when closing
      hasScannedRef.current = false;
      setAiRecommendations([]); 
      return;
    }

    setLoading(true);
    try {
      const [text, url] = await Promise.all([
        getDecryptedDescription(report.description),
        getSecureImageUrl(report.image_path)
      ]);
      setDecryptedText(text);
      setImageUrl(url);
    } catch (err) {
      setDecryptedText("Failed to decrypt. Verify security keys.");
    } finally {
      setLoading(false);
    }
  };

  const firstNames = (report.first_name || '').split(' & ').filter(Boolean);
  const lastNames = (report.last_name || '').split(' & ').filter(Boolean);
  const locations = (report.location || '').split(' & ').filter(Boolean);

  const severityColors: any = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-orange-100 text-orange-700",
    High: "bg-red-100 text-red-700 font-bold"
  };

  const formattedDate = new Date(report.created_at).toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  const renderModal = () => {
    if (!isModalOpen || !imageUrl || !mounted) return null;
    return createPortal(
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
        <div className="relative max-w-5xl w-full flex items-center justify-center">
          <button onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }} className="absolute -top-10 right-0 text-white/50 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <img src={imageUrl} alt="Enlarged Evidence" className="max-h-[85vh] max-w-full rounded-lg shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()} />
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <tr className={`group hover:bg-zinc-50 transition-colors align-top ${decryptedText ? 'bg-zinc-50' : ''}`}>
        <td className="table-td text-gray-500 whitespace-nowrap">{formattedDate}</td>
        
        <td className="table-td">
          <div className="flex flex-col gap-1">
            {lastNames.length > 0 ? lastNames.map((ln: string, i: number) => (
              <div key={i} className="text-sm font-semibold text-cavite-black flex items-center gap-2">
                <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                {ln}, {firstNames[i]}
              </div>
            )) : <span className="text-zinc-400 italic text-sm">Unknown</span>}
            
            {involvements.length > 0 && (
              <span className="mt-1 badge-primary w-max">
                {involvements.length} Verified Linked
              </span>
            )}
          </div>
        </td>

        <td className="table-td">
          <div className="flex flex-col gap-1">
            {locations.length > 0 ? locations.map((loc: string, i: number) => (
              <div key={i} className="text-sm text-zinc-500 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {loc}
              </div>
            )) : <span className="text-zinc-400 italic text-sm">Unknown</span>}
          </div>
        </td>

        <td className="table-td">
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${severityColors[report.severity]}`}>
            {report.severity}
          </span>
        </td>
        
        <td className="table-td text-right">
          <button onClick={handleToggleDetails} disabled={loading} className={`text-xs font-semibold transition-all ${decryptedText ? 'text-zinc-400 hover:text-cavite-black' : 'text-cavite-maroon hover:text-cavite-hover'}`}>
            {loading ? 'Decrypting...' : decryptedText ? 'Close Brief' : 'Open Brief'}
          </button>
        </td>
      </tr>
      
      {decryptedText && (
        <tr>
          <td colSpan={5} className="p-0 bg-zinc-50 border-b border-cavite-border shadow-inner">
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
              
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg border border-cavite-border shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-cavite-maroon rounded-full animate-pulse"></span>
                    <h4 className="sys-label">Decrypted Security Log</h4>
                  </div>
                  <p className="text-cavite-black text-sm leading-relaxed whitespace-pre-wrap font-medium">{decryptedText}</p>
                </div>

                <div className="bg-white rounded-lg border border-cavite-border shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-6">
                  <h4 className="sys-label mb-4">Evidence Attachment</h4>
                  
                  {isScanningStatus && (
                    <div className="mb-4 bg-zinc-100 border border-cavite-border p-3 rounded-md text-xs font-semibold text-zinc-500 tracking-wider animate-pulse">
                      {">"} {isScanningStatus}
                    </div>
                  )}

                  {imageUrl ? (
                    <div className="relative rounded-lg overflow-hidden border border-cavite-border shadow-sm">
                      <img 
                        ref={imageRef} 
                        src={imageUrl} 
                        crossOrigin="anonymous" 
                        alt="Evidence" 
                        className="w-full h-auto max-h-96 object-cover cursor-zoom-in" 
                        onClick={() => setIsModalOpen(true)}
                        onLoad={runAIAnalysis}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-32 rounded-lg border border-dashed border-cavite-border flex flex-col items-center justify-center text-zinc-400 bg-zinc-50">
                      <span className="text-sm font-medium">No visual evidence</span>
                    </div>
                  )}
                </div>
              </div>

              {/* IDENTITY VERIFICATION SECTION */}
              <div className="bg-white rounded-lg border border-cavite-border shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-6 flex flex-col">
                
                {aiRecommendations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-warning-text border-b border-warning-border pb-2 mb-4 flex items-center gap-2 tracking-tight">
                      <span className="w-2 h-2 bg-warning-text rounded-full animate-pulse"></span>
                      AI Suggested Matches
                    </h4>
                    <div className="space-y-2">
                      {aiRecommendations.map((rec, idx) => (
                        <div key={idx} className="bg-warning-bg border border-warning-border rounded-md px-3 py-2 flex justify-between items-center group">
                          <div>
                            <p className="text-xs font-semibold text-warning-text leading-none mb-1">
                              {rec.students.student_id} • {rec.match_percentage}% MATCH
                            </p>
                            <p className="text-sm font-semibold text-cavite-black leading-none">
                              {rec.students.last_name}, {rec.students.first_name}
                            </p>
                          </div>
                          <button 
                            onClick={() => handleLink(rec.students.id)}
                            className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded transition-colors"
                          >
                            Link
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h4 className="sys-label border-b border-cavite-border pb-2 mb-4">Verified Identities</h4>
                
                <div className="space-y-2 flex-1">
                  {involvements.map((inv: any) => (
                    <div key={inv.id} className="bg-zinc-100 border border-cavite-border rounded-md px-3 py-2 flex justify-between items-center group">
                      <div>
                        <p className="text-xs font-mono text-zinc-500 leading-none mb-1">
                          {inv.students.student_id}
                        </p>
                        <p className="text-sm font-semibold text-cavite-black leading-none">
                          {inv.students.last_name}, {inv.students.first_name}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleUnlink(inv.id)}
                        className="text-xs font-semibold text-zinc-400 hover:text-danger-text transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Unlink
                      </button>
                    </div>
                  ))}
                  
                  {involvements.length === 0 && (
                    <div className="text-center py-6 text-zinc-400 border border-dashed border-cavite-border rounded-md bg-zinc-50">
                      <p className="text-sm font-semibold">No Database Link</p>
                      <p className="text-xs font-medium mt-1">Search below to verify.</p>
                    </div>
                  )}
                </div>

                {/* Smart Search Input */}
                <div className="pt-4 mt-4 border-t border-cavite-border relative">
                  <label className="block text-sm font-medium text-cavite-black mb-1.5">Link Database Record</label>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID or Last Name..." 
                    className="w-full bg-white border border-cavite-border rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-cavite-maroon focus:border-cavite-maroon shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all"
                  />
                  
                  {isSearching && (
                    <div className="absolute right-3 top-[38px]">
                      <div className="w-3 h-3 border-2 border-cavite-maroon/30 border-t-cavite-maroon rounded-full animate-spin"></div>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-cavite-border rounded-md shadow-lg overflow-hidden max-h-48 overflow-y-auto bottom-full mb-1">
                      {searchResults.map((student) => (
                        <button 
                          key={student.id}
                          onClick={() => handleLink(student.id)}
                          className="w-full text-left px-3 py-2.5 hover:bg-zinc-50 flex items-center justify-between transition-colors border-b border-cavite-border/50 last:border-0 group"
                        >
                          <div>
                            <p className="text-sm font-semibold text-cavite-black leading-none mb-1">{student.last_name}, {student.first_name}</p>
                            <p className="text-xs font-mono text-zinc-500 leading-none">{student.student_id} • {student.grade_level}</p>
                          </div>
                          <span className="text-xs font-semibold text-cavite-maroon opacity-0 group-hover:opacity-100">+ Link</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </td>
        </tr>
      )}
      {renderModal()}
    </>
  );
}