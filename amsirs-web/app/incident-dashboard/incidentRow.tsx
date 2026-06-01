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
  unlinkStudentFromIncident,
  getFaceEmbeddings,
  saveAiMatch,
  getAiMatches,
  getStudentPhoto
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
  const [selectedRole, setSelectedRole] = useState('Offender');

  // 🤖 AI Scanning State
  const imageRef = useRef<HTMLImageElement>(null);
  const [isScanningStatus, setIsScanningStatus] = useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  
  // Guard reference to prevent double-scanning
  const hasScannedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const initInvolvements = async () => {
      const initial = report.incident_involvements || [];
      setInvolvements(initial);
      
      let changed = false;
      const updated = await Promise.all(initial.map(async (inv: any) => {
        if (inv.students?.face_photo_path && !inv.students.photoUrl) {
          changed = true;
          const url = await getStudentPhoto(inv.students.face_photo_path);
          return { ...inv, students: { ...inv.students, photoUrl: url } };
        }
        return inv;
      }));
      
      if (changed) setInvolvements(updated);
    };
    initInvolvements();
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
    const data = await getAiMatches(report.id);
    if (data) setAiRecommendations(data);
  };

  const handleLink = async (studentId: string) => {
    setSearchQuery('');
    setSearchResults([]);
    await linkStudentToIncident(report.id, studentId, selectedRole);
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
      // YIELD: Allow the browser to paint the text and process scroll momentum before we block the thread
      await new Promise(resolve => setTimeout(resolve, 150));
      
      await loadModels();

      setIsScanningStatus('EXTRACTING FACES FROM EVIDENCE...');
      // YIELD: Allow the browser to paint the "EXTRACTING..." text before WebGL tensor parsing blocks the thread
      await new Promise(resolve => setTimeout(resolve, 150));

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
      
      const embeddings = await getFaceEmbeddings();
      if (!embeddings || embeddings.length === 0) throw new Error("Could not load database embeddings or no embeddings exist");

      // OPTIMIZATION: Pre-convert all descriptors to Float32Array once
      // Creating Float32Arrays inside the loop for every face causes massive memory allocation and UI freezing.
      const processedEmbeddings = embeddings.map((face: any) => ({
        ...face,
        floatDescriptor: new Float32Array(face.descriptor)
      }));

      let newMatches = [];

      for (const detection of detections) {
        let bestMatch = null;
        let lowestDistance = 999;

        // Yield to the main thread so UI can update the scanning status text
        await new Promise(resolve => setTimeout(resolve, 0));

        for (const face of processedEmbeddings) {
          const distance = faceapi.euclideanDistance(face.floatDescriptor, detection.descriptor);
          if (distance < lowestDistance) {
            lowestDistance = distance;
            bestMatch = face;
          }
        }

        if (bestMatch && lowestDistance < 0.6) {
          const matchPercentage = getMatchPercentage(lowestDistance);
          
          const savedMatch = await saveAiMatch(report.id, bestMatch.student_id, matchPercentage);
            
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

  const locations = (report.location || '').split(' & ').filter(Boolean);
  
  // Unverified names typed by the reporter
  const reportedFirstNames = (report.first_name || '').split(' & ').filter(Boolean);
  const reportedLastNames = (report.last_name || '').split(' & ').filter(Boolean);

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
        <td className="table-td text-gray-500 whitespace-nowrap" data-label="Date">{formattedDate}</td>
        
        <td className="table-td" data-label="Student">
          <div className="flex flex-col gap-1">
            {involvements.length > 0 ? (
              involvements.map((inv: any, i: number) => (
                <div key={i} className="text-sm font-semibold text-cavite-black flex items-center gap-2">
                  <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                  {inv.students?.last_name || 'Unknown'}, {inv.students?.first_name || 'Unknown'}
                </div>
              ))
            ) : (
              reportedLastNames.length > 0 ? (
                reportedLastNames.map((ln: string, i: number) => (
                  <div key={i} className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                    <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                    {ln}, {reportedFirstNames[i]} <span className="text-[10px] bg-zinc-100 px-1 rounded">Unverified</span>
                  </div>
                ))
              ) : (
                <span className="text-zinc-400 italic text-sm">Unidentified Participant</span>
              )
            )}
            
            {involvements.length > 0 && (
              <span className="mt-1 badge-primary w-max">
                {involvements.length} Verified Linked
              </span>
            )}
          </div>
        </td>

        <td className="table-td" data-label="Location">
          <div className="flex flex-col gap-1">
            {locations.length > 0 ? locations.map((loc: string, i: number) => (
              <div key={i} className="text-sm text-zinc-500 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {loc}
              </div>
            )) : <span className="text-zinc-400 italic text-sm">Unknown</span>}
          </div>
        </td>

        <td className="table-td" data-label="Severity">
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${severityColors[report.severity]}`}>
            {report.severity}
          </span>
        </td>
        
        <td className="table-td text-right" data-label="Actions">
          <button onClick={handleToggleDetails} disabled={loading} className={`px-4 py-2 rounded-md font-semibold text-xs shadow-sm transition-all flex items-center justify-end gap-1.5 ml-auto w-fit ${decryptedText ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200' : 'bg-cavite-maroon hover:bg-cavite-hover text-white'}`}>
            {loading ? (
              <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div> Decrypting...</>
            ) : decryptedText ? (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg> Close Brief</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg> Open Brief</>
            )}
          </button>
        </td>
      </tr>
      
      {decryptedText && (
        <tr className="expansion-row">
          <td colSpan={5} className="p-0 bg-zinc-50 border-b border-cavite-border shadow-inner">
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
              
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-cavite-border shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-cavite-maroon rounded-full animate-pulse"></span>
                    <h4 className="sys-label">Decrypted Security Log</h4>
                  </div>
                  <p className="text-cavite-black text-sm leading-relaxed whitespace-pre-wrap font-medium">{decryptedText}</p>
                </div>

                <div className="bg-white rounded-lg border border-cavite-border shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-6">
                  <h4 className="sys-label mb-4">Evidence Attachment</h4>
                  
                  <div>
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
                          className="w-full h-auto max-h-[500px] object-cover cursor-zoom-in" 
                          onClick={() => setIsModalOpen(true)}
                          onLoad={() => setTimeout(runAIAnalysis, 500)}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 rounded-lg border border-dashed border-cavite-border flex flex-col items-center justify-center text-zinc-400 bg-zinc-50">
                        <span className="text-sm font-medium">No visual evidence</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* IDENTITY VERIFICATION SECTION */}
              <div className="bg-white rounded-lg border border-cavite-border shadow-[0_1px_2px_rgba(0,0,0,0.02)] p-6 flex flex-col">
                
                {(() => {
                  const linkedStudentIds = new Set(involvements.map((inv: any) => inv.students.id));
                  const visibleAiRecommendations = aiRecommendations.filter(rec => !linkedStudentIds.has(rec.students.id));
                  
                  return visibleAiRecommendations.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-warning-text border-b border-warning-border pb-2 mb-4 flex items-center gap-2 tracking-tight">
                        <span className="w-2 h-2 bg-warning-text rounded-full animate-pulse"></span>
                        AI Suggested Matches
                      </h4>
                      <div className="space-y-4">
                        {visibleAiRecommendations.map((rec, idx) => (
                          <div key={idx} className="bg-warning-bg border border-warning-border rounded-xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-5 group shadow-sm transition-all hover:shadow-md">
                            {rec.photoUrl ? (
                              <img 
                                src={rec.photoUrl} 
                                alt="Matched student" 
                                className="w-32 h-32 sm:w-36 sm:h-36 object-cover rounded-lg shadow-sm border border-warning-border/50 bg-white shrink-0" 
                              />
                            ) : (
                              <div className="w-32 h-32 sm:w-36 sm:h-36 bg-warning-border/20 rounded-lg border border-warning-border/50 flex flex-col items-center justify-center text-warning-text text-sm font-bold text-center leading-tight shrink-0">
                                NO<br/>PHOTO
                              </div>
                            )}
                            <div className="flex-1 flex flex-col justify-between self-stretch w-full">
                              <div className="text-center sm:text-left">
                                <p className="text-sm font-black text-warning-text leading-none mb-2 tracking-wide">
                                  {rec.match_percentage}% MATCH • <span className="font-mono">{rec.students.student_id}</span>
                                </p>
                                <p className="text-lg font-bold text-cavite-black leading-tight">
                                  {rec.students.last_name}, {rec.students.first_name}
                                </p>
                              </div>
                              <button 
                                onClick={() => handleLink(rec.students.id)}
                                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase tracking-widest px-4 py-3 rounded-lg transition-colors shadow-sm active:scale-95"
                              >
                                Link Record
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <h4 className="sys-label border-b border-cavite-border pb-2 mb-4">Verified Identities</h4>
                
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px] pr-2">
                  {involvements.map((inv: any) => {
                    const isAiMatch = aiRecommendations.some(rec => rec.students.id === inv.students.id);
                    return (
                      <div key={inv.id} className={`border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center sm:items-center justify-between group shadow-sm transition-all hover:shadow-md gap-4 sm:gap-0 ${isAiMatch ? 'bg-warning-bg border-warning-border' : 'bg-zinc-50 border-cavite-border'}`}>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          {inv.students.photoUrl ? (
                            <img src={inv.students.photoUrl} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-zinc-200 shadow-sm shrink-0" alt="" />
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-zinc-200 border border-zinc-300 flex items-center justify-center text-[10px] sm:text-xs font-bold text-zinc-400 shrink-0 shadow-sm">NO PIC</div>
                          )}
                          <div>
                            <p className="text-xs font-mono text-zinc-500 leading-none mb-2 flex flex-wrap items-center gap-1.5">
                              {inv.students.student_id}
                              <span className={`px-1.5 py-[2px] rounded text-[9px] font-bold tracking-wider uppercase ${inv.role === 'Offender' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {inv.role || 'Offender'}
                              </span>
                              {isAiMatch && (
                                <span className="px-1.5 py-[2px] rounded text-[9px] font-bold tracking-wider uppercase bg-warning-border/50 text-warning-text">AI MATCH</span>
                              )}
                            </p>
                            <p className="text-sm sm:text-base font-bold text-cavite-black leading-tight">
                              {inv.students.last_name}, {inv.students.first_name}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleUnlink(inv.id)}
                          className="w-full sm:w-auto text-xs font-bold text-danger-text bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg shadow-sm active:scale-95"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4l16 16"></path></svg>
                          <span>Unlink</span>
                        </button>
                      </div>
                    );
                  })}
                  
                  {involvements.length === 0 && (
                    <div className="text-center py-6 text-zinc-400 border border-dashed border-cavite-border rounded-md bg-zinc-50">
                      <p className="text-sm font-semibold">No Database Link</p>
                      <p className="text-xs font-medium mt-1">Search below to verify.</p>
                    </div>
                  )}
                </div>

                {/* Smart Search Input */}
                <div className="pt-4 mt-4 border-t border-cavite-border relative">
                  <div className="flex justify-between items-end mb-1.5">
                    <label className="block text-sm font-medium text-cavite-black">Link Database Record</label>
                    <select 
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded px-2 py-0.5 outline-none text-zinc-600 focus:border-cavite-maroon"
                    >
                      <option value="Offender">Offender</option>
                      <option value="Victim">Victim</option>
                      <option value="Witness">Witness</option>
                    </select>
                  </div>
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
                          className="w-full text-left p-3 hover:bg-zinc-50 flex items-center gap-3 transition-colors border-b border-cavite-border/50 last:border-0 group"
                        >
                          {student.photoUrl ? (
                            <img src={student.photoUrl} alt="" className="w-10 h-10 rounded-md object-cover border border-zinc-200 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[8px] font-bold text-zinc-400 shrink-0">NO PIC</div>
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-cavite-black leading-none mb-1">{student.last_name}, {student.first_name}</p>
                            <p className="text-xs font-mono text-zinc-500 leading-none">{student.student_id} • {student.grade_level}</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-semibold text-cavite-maroon opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            <span className="hidden sm:inline">Link</span>
                          </div>
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