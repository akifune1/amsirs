'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CounselingModalProps {
  isOpen: boolean;
  studentName: string;
  onClose: () => void;
  onSave: (data: CounselingSessionData) => void;
  isLoading?: boolean;
}

export interface CounselingSessionData {
  sessionDate: string;
  interventionType: string;
  notes: string;
  followUpDate: string;
  caseStatus: string;
}

export default function CounselingModal({
  isOpen,
  studentName,
  onClose,
  onSave,
  isLoading = false,
}: CounselingModalProps) {
  const [formData, setFormData] = useState<CounselingSessionData>({
    sessionDate: new Date().toISOString().split('T')[0],
    interventionType: 'Initial Counseling',
    notes: '',
    followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    caseStatus: 'Active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300" style={{ backgroundColor: 'var(--sys-surface)' }}>
          <div className="sys-card-header sticky top-0 z-10 flex justify-between items-center">
            <div className="flex-1">
              <p className="sys-label">NEW SESSION</p>
              <h2 className="sys-title">{studentName}</h2>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
            {/* Session Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="form-label">Session Date</label>
                <input
                  type="date"
                  name="sessionDate"
                  value={formData.sessionDate}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              {/* Intervention Type */}
              <div className="space-y-2">
                <label className="form-label">Intervention Type</label>
                <select
                  name="interventionType"
                  value={formData.interventionType}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="Initial Counseling">Initial Counseling</option>
                  <option value="Follow-up Session">Follow-up Session</option>
                  <option value="Crisis Intervention">Crisis Intervention</option>
                  <option value="Academic Support">Academic Support</option>
                  <option value="Behavioral Intervention">Behavioral Intervention</option>
                  <option value="Parent Conference">Parent Conference</option>
                  <option value="Referral to External Services">Referral to External Services</option>
                </select>
              </div>
            </div>

            {/* Counseling Notes */}
            <div className="space-y-2">
                <label className="form-label">Counseling Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Record observations, key concerns, recommendations, and student response..."
                required
                rows={5}
                className="input-field resize-vertical"
              />
            </div>

            {/* Follow-up & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="form-label">Follow-up Date</label>
                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div className="space-y-2">
                <label className="form-label">Case Status</label>
                <select
                  name="caseStatus"
                  value={formData.caseStatus}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="Active">Active - Ongoing Support</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Resolved">Resolved - Case Closed</option>
                  <option value="Escalated">Escalated - Requires Admin</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t" style={{ borderTopColor: 'var(--sys-border)' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 btn-primary"
              >
                {isLoading ? 'Saving Session...' : 'Save Session'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, caseStatus: 'Resolved' });
                  onSave({ ...formData, caseStatus: 'Resolved' });
                }}
                disabled={isLoading}
                className="flex-1 border text-green-500 font-semibold py-2.5 rounded-md transition-all disabled:opacity-50 text-sm bg-green-500/10 hover:bg-green-500/20 border-green-500/20"
              >
                Resolve Case
              </button>
            </div>
            <p className="text-[10px] text-gray-500 text-center font-medium px-4 pb-2 border-t pt-4" style={{ borderTopColor: 'var(--sys-border)' }}>
              By saving this session, you acknowledge that this information is highly sensitive and falls under the strict confidentiality guidelines of the Data Privacy Act of 2012 (RA 10173). Unauthorized disclosure is punishable by law.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
