'use client';

import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface DataPrivacyCheckboxProps {
  id?: string;
  name?: string;
  className?: string;
}

export default function DataPrivacyCheckbox({ id = 'dpa-consent', name = 'dpaConsent', className = '' }: DataPrivacyCheckboxProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5 mt-1">
          <input
            id={id}
            name={name}
            type="checkbox"
            required
            className="w-4 h-4 text-cavite-maroon bg-gray-100 border-gray-300 rounded focus:ring-cavite-maroon focus:ring-2 cursor-pointer"
          />
        </div>
        <div className="text-sm text-gray-600 font-medium">
          <label htmlFor={id} className="cursor-pointer">
            I agree to the Data Privacy Policy and consent to the collection of my data.
          </label>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="ml-1 text-cavite-maroon hover:text-[#600000] font-bold hover:underline"
          >
            Read more
          </button>
        </div>
      </div>

      {isModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity animate-in fade-in"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto animate-in zoom-in-95 duration-200">
              
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2 text-cavite-maroon">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="font-bold text-gray-900">Data Privacy Policy</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto text-sm text-gray-600 space-y-4 leading-relaxed">
                <p>
                  In compliance with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong>, 
                  I hereby give my explicit consent to Cavite National High School (AMSIRS) to collect, process, and store my personal and biometric data.
                </p>
                <p>
                  I understand that my information (including face embeddings, attendance records, and incident reports) 
                  will be used solely for legitimate administrative, security, and student support purposes.
                </p>
                <p>
                  The institution guarantees that all collected data will be kept strictly confidential, 
                  secured against unauthorized access, and retained only for as long as legally necessary.
                </p>
                <p>
                  As a data subject, I am aware of my rights to access, correct, or object to the processing of my personal information under the law.
                </p>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-cavite-maroon hover:bg-[#600000] text-white font-bold py-2.5 rounded-lg transition-colors"
                >
                  I Understand
                </button>
              </div>
              
            </div>
          </div>
        </>
      )}
    </div>
  );
}
