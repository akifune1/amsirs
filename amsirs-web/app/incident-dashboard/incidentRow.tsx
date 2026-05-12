'use client';

import { useState } from 'react';
import { getDecryptedDescription } from './actions';

export default function IncidentRow({ report }: { report: any }) {
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // FIXED: Now handles both Showing and Hiding
  const handleToggleDetails = async () => {
    // If we already see the text, hide it and stop
    if (decryptedText) {
      setDecryptedText(null);
      return;
    }

    // Otherwise, decrypt it
    setLoading(true);
    try {
      const text = await getDecryptedDescription(report.description);
      setDecryptedText(text);
    } catch (err) {
      setDecryptedText("Failed to decrypt. Verify security keys.");
    } finally {
      setLoading(false);
    }
  };

  const severityColors: any = {
    Low: "bg-green-50 text-green-700 border-green-200",
    Medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
    High: "bg-red-50 text-red-700 border-red-200"
  };

  const formattedDate = new Date(report.created_at).toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors border-b border-gray-50">
        <td className="p-5 text-[13px] text-gray-500 font-medium">{formattedDate}</td>
        <td className="p-5 text-sm font-bold text-gray-900">{report.last_name}, {report.first_name}</td>
        <td className="p-5 text-sm text-gray-600 font-medium">{report.location}</td>
        <td className="p-5">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${severityColors[report.severity]}`}>
            {report.severity}
          </span>
        </td>
        <td className="p-5 text-right">
          <button 
            onClick={handleToggleDetails}
            disabled={loading}
            className={`text-xs font-black uppercase tracking-widest transition-all ${
              decryptedText ? 'text-gray-400 hover:text-gray-600' : 'text-cavite-maroon hover:text-[#600000]'
            }`}
          >
            {loading ? 'Decrypting...' : decryptedText ? 'Hide Details' : 'View Details'}
          </button>
        </td>
      </tr>
      
      {/* Decrypted Content Area */}
      {decryptedText && (
        <tr>
          <td colSpan={5} className="p-0">
            <div className="px-8 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 shadow-inner">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-1.5 bg-cavite-maroon rounded-full"></div>
                  <h4 className="text-[10px] font-black text-cavite-maroon uppercase tracking-[0.2em]">
                    Decrypted Secure Log
                  </h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed font-medium">
                  {decryptedText}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}