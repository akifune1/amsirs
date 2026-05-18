'use client';

import { useState } from 'react';

function LogTableRow({ record, onDecrypt }: { record: any, onDecrypt: () => void }) {
  const { incident, formattedDate } = record;
  if (!incident) return null;

  return (
    <tr className="hover:bg-cavite-gray/50 transition-colors group">
      <td className="table-td whitespace-nowrap">{formattedDate}</td>
      <td className="table-td truncate max-w-[200px]">{incident.location}</td>
      <td className="table-td whitespace-nowrap">
        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border tracking-tighter ${
          incident.severity === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
          incident.severity === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
          'bg-gray-50 text-gray-700 border-gray-200'
        }`}>
          {incident.severity}
        </span>
      </td>
      <td className="table-td whitespace-nowrap">
        <p className="sys-label">{incident.status}</p>
      </td>
      <td className="table-td text-right whitespace-nowrap">
        <button 
          onClick={onDecrypt}
          className="btn-text justify-end opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Decrypt ➔
        </button>
      </td>
    </tr>
  );
}

export default function IncidentClientLogs({ involvements }: { involvements: any[] }) {
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  if (!involvements || involvements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center opacity-50 min-h-[300px]">
        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path></svg>
        <p className="sys-subtitle !mt-0">No Incidents on Record</p>
      </div>
    );
  }

  return (
    <>
      {/* DATA TABLE */}
      <div className="sys-table-wrapper border-t border-cavite-border">
        <table className="sys-table">
          <thead className="table-header-row">
            <tr>
              <th className="table-th">Date</th>
              <th className="table-th">Location</th>
              <th className="table-th">Severity</th>
              <th className="table-th">Status</th>
              <th className="table-th text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cavite-border/50">
            {involvements.map((record) => (
              <LogTableRow 
                key={record.incident_id} 
                record={record} 
                onDecrypt={() => setSelectedRecord(record)} 
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* SECURE MODAL OVERLAY */}
      {selectedRecord && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cavite-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedRecord(null)}
        >
          {/* MODAL WINDOW */}
          <div 
            className="sys-card max-w-2xl w-full flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sys-card-header">
              <span className="sys-label !text-cavite-black">Classified Payload Decrypted</span>
              <button 
                onClick={() => setSelectedRecord(null)}
                className="btn-text !text-gray-500 hover:!text-red-600"
              >
                Close ✕
              </button>
            </div>

            {/* Body (Form Grid) */}
            <div className="p-6 md:p-8 overflow-y-auto bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="col-span-1">
                  <label className="form-label">Date Recorded</label>
                  <div className="input-field-alt text-sm font-bold bg-white">{selectedRecord.formattedDate}</div>
                </div>

                <div className="col-span-1">
                  <label className="form-label">Current Status</label>
                  <div className="input-field-alt text-sm uppercase font-black bg-white">{selectedRecord.incident.status}</div>
                </div>

                <div className="col-span-1">
                  <label className="form-label">Priority Level</label>
                  <div className="input-field-alt flex items-center bg-white py-2.5">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border tracking-tighter ${
                      selectedRecord.incident.severity === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                      selectedRecord.incident.severity === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {selectedRecord.incident.severity}
                    </span>
                  </div>
                </div>

                <div className="col-span-full">
                  <label className="form-label">Incident Location</label>
                  <div className="input-field-alt text-sm font-bold bg-white">{selectedRecord.incident.location}</div>
                </div>

                <div className="col-span-full">
                  <label className="form-label">Official Report</label>
                  <div className="input-field-alt min-h-[120px] whitespace-pre-wrap break-words bg-white text-sm font-medium leading-relaxed">
                    {selectedRecord.incident.description}
                  </div>
                </div>

                {selectedRecord.incidentImageUrl && (
                  <div className="col-span-full">
                    <label className="form-label">Photographic Evidence</label>
                    <div className="input-field-alt bg-white flex justify-center p-2">
                      <img 
                        src={selectedRecord.incidentImageUrl} 
                        alt="Incident Evidence" 
                        className="max-w-full max-h-[400px] object-contain rounded-md" 
                      />
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}