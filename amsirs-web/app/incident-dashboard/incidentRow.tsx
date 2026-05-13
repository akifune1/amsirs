'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  getDecryptedDescription, 
  getSecureImageUrl,
  searchStudents,
  linkStudentToIncident,
  unlinkStudentFromIncident
} from './actions';

export default function IncidentRow({ report }: { report: any }) {
  // DEBUG LOG
  console.log("💎 RAW REPORT DATA:", JSON.stringify(report, null, 2));
  
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

  // 🔄 NEW: Local Sync State
  // This ensures the UI updates when the server revalidates data
  const [involvements, setInvolvements] = useState(report.incident_involvements || []);

  useEffect(() => setMounted(true), []);

  // CRITICAL: This effect listens for the server sending a new "report" prop
  useEffect(() => {
    setInvolvements(report.incident_involvements || []);
  }, [report.incident_involvements]);

  // Handle the live search for linking students
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

  const handleLink = async (studentId: string) => {
    setSearchQuery('');
    setSearchResults([]);
    // The server action will trigger revalidatePath, 
    // which triggers our useEffect above to update the UI.
    await linkStudentToIncident(report.id, studentId);
  };

  const handleUnlink = async (involvementId: string) => {
    await unlinkStudentFromIncident(involvementId);
  };

  // Safe split for legacy reporter string inputs
  const firstNames = (report.first_name || '').split(' & ').filter(Boolean);
  const lastNames = (report.last_name || '').split(' & ').filter(Boolean);
  const locations = (report.location || '').split(' & ').filter(Boolean);

  const handleToggleDetails = async () => {
    if (decryptedText) {
      setDecryptedText(null);
      setImageUrl(null);
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
      <tr className={`group hover:bg-cavite-gray/50 transition-colors align-top ${decryptedText ? 'bg-cavite-gray/30' : ''}`}>
        <td className="table-td text-gray-500 whitespace-nowrap">{formattedDate}</td>
        
        <td className="table-td">
          <div className="flex flex-col gap-1">
            {lastNames.length > 0 ? lastNames.map((ln: string, i: number) => (
              <div key={i} className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                {ln}, {firstNames[i]}
              </div>
            )) : <span className="text-gray-400 italic text-sm">Unknown</span>}
            
            {/* UPDATED: Uses local involvements state */}
            {involvements.length > 0 && (
              <span className="mt-1 bg-cavite-maroon/10 text-cavite-maroon text-[9px] font-black uppercase px-2 py-0.5 rounded w-max tracking-widest border border-cavite-maroon/20">
                {involvements.length} Verified Linked
              </span>
            )}
          </div>
        </td>

        <td className="table-td">
          <div className="flex flex-col gap-1">
            {locations.length > 0 ? locations.map((loc: string, i: number) => (
              <div key={i} className="text-sm text-gray-500 flex items-center gap-2">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {loc}
              </div>
            )) : <span className="text-gray-400 italic text-sm">Unknown</span>}
          </div>
        </td>

        <td className="table-td">
          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${severityColors[report.severity]}`}>
            {report.severity}
          </span>
        </td>
        
        <td className="table-td text-right">
          <button onClick={handleToggleDetails} disabled={loading} className={`text-sm font-bold uppercase tracking-widest transition-all ${decryptedText ? 'text-gray-400 hover:text-gray-600' : 'text-cavite-maroon hover:text-[#600000]'}`}>
            {loading ? 'Decrypting...' : decryptedText ? 'Close Brief' : 'Open Brief'}
          </button>
        </td>
      </tr>
      
      {decryptedText && (
        <tr>
          <td colSpan={5} className="p-0 bg-gray-50 border-b border-cavite-border shadow-inner">
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
              
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-cavite-border shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-cavite-maroon rounded-full animate-pulse"></span>
                    <h4 className="sys-label">Decrypted Security Log</h4>
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">{decryptedText}</p>
                </div>

                <div className="bg-white rounded-xl border border-cavite-border shadow-sm p-6">
                  <h4 className="sys-label mb-4">Evidence Attachment</h4>
                  {imageUrl ? (
                    <button onClick={() => setIsModalOpen(true)} className="block w-full cursor-zoom-in group text-left focus:outline-none focus:ring-2 focus:ring-cavite-maroon/50 rounded-lg">
                      <div className="relative rounded-lg overflow-hidden border border-cavite-border shadow-sm transition-transform group-hover:scale-[1.01]">
                        <img src={imageUrl} alt="Incident Evidence Thumbnail" className="w-full h-64 object-cover" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-full h-32 rounded-lg border-2 border-dashed border-cavite-border flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                      <span className="text-xs font-medium uppercase tracking-widest">No visual evidence</span>
                    </div>
                  )}
                </div>
              </div>

              {/* IDENTITY VERIFICATION SECTION */}
              <div className="bg-white rounded-xl border border-cavite-border shadow-sm p-6 flex flex-col">
                <h4 className="sys-label border-b border-cavite-border pb-2 mb-4">Verified Identities</h4>
                
                <div className="space-y-2 flex-1">
                  {/* UPDATED: Mapping from involvements state */}
                  {involvements.map((inv: any) => (
                    <div key={inv.id} className="bg-cavite-gray border border-cavite-border rounded-lg px-3 py-2 flex justify-between items-center group">
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">
                          {inv.students.student_id}
                        </p>
                        <p className="text-xs font-bold text-cavite-black leading-none">
                          {inv.students.last_name}, {inv.students.first_name}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleUnlink(inv.id)}
                        className="text-[10px] font-black text-gray-400 hover:text-red-600 uppercase tracking-widest transition-colors opacity-0 group-hover:opacity-100"
                      >
                        Unlink
                      </button>
                    </div>
                  ))}
                  
                  {involvements.length === 0 && (
                    <div className="text-center py-6 text-gray-400 border border-dashed border-cavite-border rounded-lg bg-gray-50">
                      <p className="text-[10px] font-bold uppercase tracking-widest">No Database Link</p>
                      <p className="text-xs font-medium mt-1">Search below to verify.</p>
                    </div>
                  )}
                </div>

                {/* Smart Search Input */}
                <div className="pt-4 mt-4 border-t border-cavite-border relative">
                  <label className="form-label !text-[10px] text-gray-400">Link Database Record</label>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID or Last Name..." 
                    className="input-field-alt !py-2.5 !text-xs"
                  />
                  
                  {isSearching && (
                    <div className="absolute right-3 top-[34px]">
                      <div className="w-3 h-3 border-2 border-cavite-maroon/30 border-t-cavite-maroon rounded-full animate-spin"></div>
                    </div>
                  )}

                  {/* Dropdown Results */}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-cavite-border rounded-lg shadow-2xl overflow-hidden max-h-48 overflow-y-auto bottom-full mb-1">
                      {searchResults.map((student) => (
                        <button 
                          key={student.id}
                          onClick={() => handleLink(student.id)}
                          className="w-full text-left px-3 py-2.5 hover:bg-cavite-gray flex items-center justify-between transition-colors border-b border-cavite-border/50 last:border-0 group"
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-900 leading-none mb-1">{student.last_name}, {student.first_name}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">{student.student_id} • {student.grade_level}</p>
                          </div>
                          <span className="text-[10px] font-black text-cavite-maroon opacity-0 group-hover:opacity-100 uppercase tracking-widest">+ Link</span>
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