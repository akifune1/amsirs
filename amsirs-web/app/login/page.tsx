'use client';

import { useActionState } from 'react'; // New hook for Next.js 15+
import { login } from './actions';

export default function LoginPage() {
  // state: holds the return value from the action (e.g., the error message)
  // formAction: the version of the login function we pass to the form
  // isPending: true while the server is processing the login
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cavite-black px-4">
      <div className="max-w-md w-full bg-cavite-gray p-8 rounded-lg shadow-2xl border-t-4 border-cavite-maroon">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-cavite-white uppercase">AMSIRS</h1>
          <p className="text-sm text-gray-400 mt-2">Cavite National High School</p>
        </div>

        {/* Change 'action' to use formAction from the hook */}
        <form action={formAction} className="space-y-6">
          
          {/* Display Error Message if it exists */}
          {state?.error && (
            <div className="bg-red-900/30 border border-cavite-red text-cavite-red p-3 rounded text-sm text-center">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 font-sans">Institutional Email</label>
            <input 
              name="email"
              type="email" 
              required
              disabled={isPending}
              className="w-full bg-cavite-black border border-gray-700 rounded p-3 text-cavite-white focus:outline-none focus:border-cavite-maroon focus:ring-1 focus:ring-cavite-maroon transition-colors disabled:opacity-50"
              placeholder="guard@amsirs.edu"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1 font-sans">Password</label>
            <input 
              name="password"
              type="password" 
              required
              disabled={isPending}
              className="w-full bg-cavite-black border border-gray-700 rounded p-3 text-cavite-white focus:outline-none focus:border-cavite-maroon focus:ring-1 focus:ring-cavite-maroon transition-colors disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isPending}
            className="w-full bg-cavite-maroon text-white font-semibold py-3 rounded hover:bg-[#600000] transition-colors shadow-lg disabled:bg-gray-700"
          >
            {isPending ? 'Authenticating...' : 'Authenticate'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500 uppercase tracking-widest">
          Strictly for authorized CNHS personnel only.
        </div>
      </div>
    </div>
  );
}