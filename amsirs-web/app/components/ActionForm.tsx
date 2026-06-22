"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export default function ActionForm({ 
  action, 
  confirmMessage, 
  id,
  children 
}: { 
  action: (formData: FormData) => Promise<any>; 
  confirmMessage?: string;
  id?: string;
  children: React.ReactNode;
}) {
  const [showModal, setShowModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (confirmMessage) {
      setPendingFormData(formData);
      setShowModal(true);
    } else {
      executeAction(formData);
    }
  };

  const executeAction = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const promise = action(formData);
      toast.promise(promise, {
        loading: 'Processing request...',
        success: 'Action completed successfully!',
        error: (err) => err?.message || 'Error processing request'
      });
      await promise;
      setShowModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form id={id} onSubmit={handleSubmit}>
        {children}
      </form>

      {/* Custom Confirmation Modal Overlay */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-cavite-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !isSubmitting && setShowModal(false)}
        >
          <div 
            className="rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: 'var(--sys-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b bg-red-500/5 flex items-center gap-3" style={{ borderColor: 'var(--sys-border)' }}>
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <div>
                <h3 className="font-bold text-red-500 text-base">Action Required</h3>
                <p className="text-xs text-red-400 font-medium">Please confirm this operation</p>
              </div>
            </div>
            
            <div className="p-6 text-center">
              <p className="font-medium" style={{ color: 'var(--sys-text-primary)' }}>{confirmMessage}</p>
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
                onClick={() => pendingFormData && executeAction(pendingFormData)} 
                disabled={isSubmitting}
                className="btn-primary !bg-red-600 hover:!bg-red-700 m-0 py-2 px-5 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Action'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
