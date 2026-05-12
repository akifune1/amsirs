'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getDecryptedDescription, getSecureImageUrl } from './actions';

export default function IncidentRow({ report }: { report: any }) {
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Logic to split the aggregated strings back into arrays for the list view
  const firstNames = report.first_name.split(' & ');
  const lastNames = report.last_name.split(' & ');
  const locations = report.location.split(' & ');

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
      <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)}>
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
      <tr className="hover:bg-gray-50/80 transition-colors border-b border-gray-100 group align-top">
        <td className="py-5 px-6 text-sm text-gray-500 whitespace-nowrap">{formattedDate}</td>
        
        {/* STUDENT LIST COLUMN */}
        <td className="py-5 px-6">
          <div className="flex flex-col gap-1">
            {lastNames.map((ln: string, i: number) => (
              <div key={i} className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                {ln}, {firstNames[i]}
              </div>
            ))}
          </div>
        </td>

        {/* LOCATION LIST COLUMN */}
        <td className="py-5 px-6">
          <div className="flex flex-col gap-1">
            {locations.map((loc: string, i: number) => (
              <div key={i} className="text-sm text-gray-500 flex items-center gap-2">
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {loc}
              </div>
            ))}
          </div>
        </td>

        <td className="py-5 px-6">
          <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${severityColors[report.severity]}`}>
            {report.severity}
          </span>
        </td>
        
        <td className="py-5 px-6 text-right">
          <button onClick={handleToggleDetails} disabled={loading} className={`text-sm font-medium transition-all ${decryptedText ? 'text-gray-400 hover:text-gray-600' : 'text-cavite-maroon hover:text-[#600000]'}`}>
            {loading ? 'Decrypting...' : decryptedText ? 'Close Brief' : 'Open Brief'}
          </button>
        </td>
      </tr>
      
      {decryptedText && (
        <tr>
          <td colSpan={5} className="p-0 bg-gray-50/30">
            <div className="px-6 pb-8 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="flex-1 p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 bg-cavite-maroon rounded-full animate-pulse"></span>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Decrypted Security Log</h4>
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{decryptedText}</p>
                </div>
                <div className="w-full md:w-1/3 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-col items-center justify-center min-h-200px">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 w-full text-left">Evidence Attachment</h4>
                  {imageUrl ? (
                    <button onClick={() => setIsModalOpen(true)} className="block w-full cursor-zoom-in group text-left focus:outline-none focus:ring-2 focus:ring-cavite-maroon/50 rounded-lg">
                      <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm transition-transform group-hover:scale-[1.02]">
                        <img src={imageUrl} alt="Incident Evidence Thumbnail" className="w-full h-48 object-cover" />
                      </div>
                    </button>
                  ) : (
                    <div className="w-full h-48 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                      <span className="text-xs font-medium">No visual evidence provided</span>
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