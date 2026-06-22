'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ConfirmChangesForm({
  action,
  id,
  originalData,
  children
}: {
  action: (formData: FormData) => Promise<any>;
  id: string;
  originalData: Record<string, string>;
  children?: React.ReactNode;
}) {
  const [showModal, setShowModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [changes, setChanges] = useState<{field: string, old: string, new: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newChanges = [];

    for (const key of Object.keys(originalData)) {
      const newVal = formData.get(key) as string;
      const oldVal = originalData[key] || '';
      
      if (newVal !== undefined && newVal !== oldVal) {
        newChanges.push({ field: key, old: oldVal, new: newVal });
      }
    }

    if (newChanges.length === 0) {
      toast.success('No changes detected.');
      return;
    }

    setChanges(newChanges);
    setPendingFormData(formData);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!pendingFormData) return;
    setIsSubmitting(true);
    
    try {
      const promise = action(pendingFormData);
      toast.promise(promise, {
        loading: 'Saving changes...',
        success: 'Changes applied successfully!',
        error: (err) => err?.message || 'Failed to apply changes.'
      });
      await promise;
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFieldLabel = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  };

  return (
    <>
      <form id={id} onSubmit={handleSubmit}>
        {children}
      </form>

      {/* Confirmation Modal Overlay */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cavite-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !isSubmitting && setShowModal(false)}
        >
          <div 
            className="rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: 'var(--sys-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b flex items-center gap-2" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderColor: 'var(--sys-border)' }}>
              <svg className="w-5 h-5 text-cavite-maroon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <h3 className="font-bold text-base" style={{ color: 'var(--sys-text-primary)' }}>Review Changes</h3>
            </div>
            
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
              <p className="text-sm mb-2" style={{ color: 'var(--sys-text-muted)' }}>You are about to modify the following fields. Please review your changes before confirming.</p>
              
              {changes.map(c => (
                <div key={c.field} className="flex flex-col text-sm border rounded-lg p-3" style={{ backgroundColor: 'var(--sys-surface-muted)', borderColor: 'var(--sys-border)' }}>
                  <span className="font-bold mb-1.5" style={{ color: 'var(--sys-text-primary)' }}>{formatFieldLabel(c.field)}</span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex-1 px-3 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md line-through opacity-80 break-words font-medium">
                      {c.old === 'true' ? 'Approved/Active' : c.old === 'false' ? 'Pending/Suspended' : c.old || '(empty)'}
                    </div>
                    <div className="hidden sm:block font-bold" style={{ color: 'var(--sys-text-muted)' }}>➔</div>
                    <div className="flex-1 px-3 py-2 bg-green-500/10 text-green-500 border border-green-500/20 rounded-md shadow-sm break-words font-bold">
                      {c.new === 'true' ? 'Approved/Active' : c.new === 'false' ? 'Pending/Suspended' : c.new || '(empty)'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="px-5 py-4 border-t flex justify-end gap-3" style={{ backgroundColor: 'var(--sys-surface-subtle)', borderTopColor: 'var(--sys-border)' }}>
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                disabled={isSubmitting}
                className="btn-text !text-zinc-500 hover:!text-zinc-800 dark:hover:!text-zinc-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmAction} 
                disabled={isSubmitting}
                className="btn-primary m-0 py-2 px-5 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Confirm & Apply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
