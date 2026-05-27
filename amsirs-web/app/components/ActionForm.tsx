"use client";

import { toast } from "react-hot-toast";

export default function ActionForm({ 
  action, 
  id,
  children 
}: { 
  action: (formData: FormData) => Promise<void>, 
  id?: string,
  children: React.ReactNode 
}) {
  return (
    <form 
      id={id}
      action={async (formData) => {
        const promise = action(formData);
        toast.promise(promise, {
          loading: 'Saving changes...',
          success: 'Saved successfully!',
          error: (err) => err?.message || 'Error saving changes'
        });
        await promise;
      }}
    >
      {children}
    </form>
  );
}
