'use client';

/**
 * Intake Sheet Editor Modal
 * 
 * A hybrid modal that pre-fills available DB data and lets the user
 * manually enter missing fields before generating a PDF download.
 * No data is persisted to the database — it only lives in the PDF.
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import IntakeSheetDocument from '@/lib/pdf/IntakeSheetDocument';
import { createEmptyIntakeSheet } from '@/lib/pdf/types';
import type { IntakeSheetData } from '@/lib/pdf/types';

// ==========================================
// Props
// ==========================================

interface IntakeSheetPrefill {
  victim: {
    name: string;
    dateOfBirth: string;
    age: string;
    sex: string;
    gradeYearSection: string;
    addressContact: string;
  };
  respondentStudent: {
    name: string;
    dateOfBirth: string;
    age: string;
    sex: string;
    gradeYearSection: string;
  };
  caseDetails: string;
  date: string;
}

interface IntakeSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefill: IntakeSheetPrefill | null;
}

// ==========================================
// Component
// ==========================================

export default function IntakeSheetModal({ isOpen, onClose, prefill }: IntakeSheetModalProps) {
  const [formData, setFormData] = useState<IntakeSheetData>(createEmptyIntakeSheet());
  const [generating, setGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Pre-fill when prefill data arrives
  useEffect(() => {
    if (prefill) {
      const base = createEmptyIntakeSheet();
      setFormData({
        ...base,
        victim: {
          ...base.victim,
          name: prefill.victim.name || '',
          dateOfBirth: prefill.victim.dateOfBirth || '',
          age: prefill.victim.age || '',
          sex: prefill.victim.sex || '',
          gradeYearSection: prefill.victim.gradeYearSection || '',
          addressContact: prefill.victim.addressContact || '',
        },
        respondentStudent: {
          ...base.respondentStudent,
          name: prefill.respondentStudent.name || '',
          dateOfBirth: prefill.respondentStudent.dateOfBirth || '',
          age: prefill.respondentStudent.age || '',
          sex: prefill.respondentStudent.sex || '',
          gradeYearSection: prefill.respondentStudent.gradeYearSection || '',
        },
        caseDetails: prefill.caseDetails || '',
        date: prefill.date || base.date,
      });
    } else {
      setFormData(createEmptyIntakeSheet());
    }
  }, [prefill]);

  // ---- Generic field updater ----
  const updateField = (section: string, field: string, value: string) => {
    setFormData((prev) => {
      if (section === 'root') {
        return { ...prev, [field]: value };
      }
      return {
        ...prev,
        [section]: {
          ...(prev as any)[section],
          [field]: value,
        },
      };
    });
  };

  const updateArrayField = (field: 'actionsTaken' | 'recommendations', index: number, value: string) => {
    setFormData((prev) => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr as any };
    });
  };

  // ---- PDF Generation ----
  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const blob = await pdf(<IntakeSheetDocument data={formData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Intake_Sheet_${formData.date.replace(/\s/g, '_') || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modal = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300"
          style={{ backgroundColor: 'var(--sys-surface)' }}
        >
          {/* ---- HEADER ---- */}
          <div className="sys-card-header sticky top-0 z-10 flex justify-between items-center" style={{ backgroundColor: 'var(--sys-surface)' }}>
            <div className="flex-1">
              <p className="sys-label">DOCUMENT PREPARATION</p>
              <h2 className="text-xl font-bold mt-1" style={{ color: 'var(--sys-text-primary)' }}>
                Intake Sheet
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={generating}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* ---- FORM ---- */}
          <div className="p-6 md:p-8 space-y-8">

            {/* ===== SECTION I: INFORMATION ===== */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-cavite-maroon border-b-2 border-cavite-maroon/20 pb-2 mb-6">
                I. Information
              </h3>

              {/* ---- A. Victim ---- */}
              <h4 className="text-sm font-bold mb-4" style={{ color: 'var(--sys-text-primary)' }}>A. Victim</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormField label="Name" value={formData.victim.name} onChange={(v) => updateField('victim', 'name', v)} />
                <FormField label="Date of Birth" value={formData.victim.dateOfBirth} onChange={(v) => updateField('victim', 'dateOfBirth', v)} placeholder="e.g. January 15, 2010" />
                <FormField label="Age" value={formData.victim.age} onChange={(v) => updateField('victim', 'age', v)} />
                <FormField label="Sex" value={formData.victim.sex} onChange={(v) => updateField('victim', 'sex', v)} />
                <FormField label="Gr./Yr and Section" value={formData.victim.gradeYearSection} onChange={(v) => updateField('victim', 'gradeYearSection', v)} />
                <FormField label="Adviser" value={formData.victim.adviser} onChange={(v) => updateField('victim', 'adviser', v)} />
                <FormField label="Mother's Name, Age, and Occupation" value={formData.victim.motherInfo} onChange={(v) => updateField('victim', 'motherInfo', v)} fullWidth />
                <FormField label="Father's Name, Age, and Occupation" value={formData.victim.fatherInfo} onChange={(v) => updateField('victim', 'fatherInfo', v)} fullWidth />
                <FormField label="Address and Contact Number" value={formData.victim.addressContact} onChange={(v) => updateField('victim', 'addressContact', v)} fullWidth />
              </div>

              {/* ---- B. Complainant ---- */}
              <h4 className="text-sm font-bold mb-4" style={{ color: 'var(--sys-text-primary)' }}>B. Complainant</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormField label="Name" value={formData.complainant.name} onChange={(v) => updateField('complainant', 'name', v)} />
                <FormField label="Relationship to Victim" value={formData.complainant.relationshipToVictim} onChange={(v) => updateField('complainant', 'relationshipToVictim', v)} />
                <FormField label="Address and Contact Number" value={formData.complainant.addressContact} onChange={(v) => updateField('complainant', 'addressContact', v)} fullWidth />
              </div>

              {/* ---- C. Respondent ---- */}
              <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--sys-text-primary)' }}>C. Respondent</h4>

              {/* C-1: School Personnel */}
              <p className="text-xs font-semibold italic mb-3" style={{ color: 'var(--sys-text-muted)' }}>
                C-1. If respondent is a School Personnel:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pl-4 border-l-2" style={{ borderColor: 'var(--sys-border)' }}>
                <FormField label="Name" value={formData.respondentPersonnel.name} onChange={(v) => updateField('respondentPersonnel', 'name', v)} />
                <FormField label="Date of Birth" value={formData.respondentPersonnel.dateOfBirth} onChange={(v) => updateField('respondentPersonnel', 'dateOfBirth', v)} />
                <FormField label="Age" value={formData.respondentPersonnel.age} onChange={(v) => updateField('respondentPersonnel', 'age', v)} />
                <FormField label="Sex" value={formData.respondentPersonnel.sex} onChange={(v) => updateField('respondentPersonnel', 'sex', v)} />
                <FormField label="Designation/Position" value={formData.respondentPersonnel.designation} onChange={(v) => updateField('respondentPersonnel', 'designation', v)} />
                <FormField label="Address and Contact Number" value={formData.respondentPersonnel.addressContact} onChange={(v) => updateField('respondentPersonnel', 'addressContact', v)} fullWidth />
              </div>

              {/* C-2: Student */}
              <p className="text-xs font-semibold italic mb-3" style={{ color: 'var(--sys-text-muted)' }}>
                C-2. If respondent is a Student:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pl-4 border-l-2" style={{ borderColor: 'var(--sys-border)' }}>
                <FormField label="Name" value={formData.respondentStudent.name} onChange={(v) => updateField('respondentStudent', 'name', v)} />
                <FormField label="Date of Birth" value={formData.respondentStudent.dateOfBirth} onChange={(v) => updateField('respondentStudent', 'dateOfBirth', v)} />
                <FormField label="Age" value={formData.respondentStudent.age} onChange={(v) => updateField('respondentStudent', 'age', v)} />
                <FormField label="Sex" value={formData.respondentStudent.sex} onChange={(v) => updateField('respondentStudent', 'sex', v)} />
                <FormField label="Gr./Yr and Section" value={formData.respondentStudent.gradeYearSection} onChange={(v) => updateField('respondentStudent', 'gradeYearSection', v)} />
                <FormField label="Adviser" value={formData.respondentStudent.adviser} onChange={(v) => updateField('respondentStudent', 'adviser', v)} />
                <FormField label="Mother's Name, Age, Occ., Address/Contact" value={formData.respondentStudent.motherInfo} onChange={(v) => updateField('respondentStudent', 'motherInfo', v)} fullWidth />
                <FormField label="Father's Name, Age, Occ., Address/Contact" value={formData.respondentStudent.fatherInfo} onChange={(v) => updateField('respondentStudent', 'fatherInfo', v)} fullWidth />
              </div>
            </div>

            {/* ===== SECTION II: DETAILS OF THE CASE ===== */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-cavite-maroon border-b-2 border-cavite-maroon/20 pb-2 mb-4">
                II. Details of the Case
              </h3>
              <textarea
                value={formData.caseDetails}
                onChange={(e) => updateField('root', 'caseDetails', e.target.value)}
                rows={5}
                placeholder="Provide the specifics of the incident..."
                className="input-field resize-vertical w-full"
              />
            </div>

            {/* ===== SECTION III: ACTION TAKEN ===== */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-cavite-maroon border-b-2 border-cavite-maroon/20 pb-2 mb-4">
                III. Action Taken
              </h3>
              <div className="space-y-3">
                {formData.actionsTaken.map((val, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-bold w-6 text-right" style={{ color: 'var(--sys-text-muted)' }}>{i + 1}.</span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => updateArrayField('actionsTaken', i, e.target.value)}
                      placeholder="Leave blank to print empty line"
                      className="input-field flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ===== SECTION IV: RECOMMENDATIONS ===== */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-cavite-maroon border-b-2 border-cavite-maroon/20 pb-2 mb-4">
                IV. Recommendations
              </h3>
              <div className="space-y-3">
                {formData.recommendations.map((val, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-bold w-6 text-right" style={{ color: 'var(--sys-text-muted)' }}>{i + 1}.</span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => updateArrayField('recommendations', i, e.target.value)}
                      placeholder="Leave blank to print empty line"
                      className="input-field flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ===== SIGN-OFF ===== */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-cavite-maroon border-b-2 border-cavite-maroon/20 pb-2 mb-4">
                Sign-off
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Prepared by" value={formData.preparedBy} onChange={(v) => updateField('root', 'preparedBy', v)} placeholder="Name over Printed Name" />
                <FormField label="Designation" value={formData.designation} onChange={(v) => updateField('root', 'designation', v)} />
                <FormField label="Date" value={formData.date} onChange={(v) => updateField('root', 'date', v)} />
              </div>
            </div>

            {/* ===== ACTIONS ===== */}
            <div className="flex gap-3 pt-6 border-t" style={{ borderTopColor: 'var(--sys-border)' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={generating}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGeneratePDF}
                disabled={generating}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate PDF
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] text-gray-500 text-center font-medium px-4 pb-2">
              Fields left blank will appear as empty lines in the printed PDF for manual completion.
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
}

// ==========================================
// Internal: Form Field Component
// ==========================================

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

function FormField({ label, value, onChange, placeholder, fullWidth }: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${fullWidth ? 'md:col-span-2' : ''}`}>
      <label className="form-label">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
        className="input-field"
      />
    </div>
  );
}
