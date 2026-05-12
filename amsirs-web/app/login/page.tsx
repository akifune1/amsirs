'use client';

import { useActionState } from 'react';
import { login } from './actions';

export default function LoginPage() {
  // state: holds the return value from the action (e.g., the error message)
  // formAction: the version of the login function we pass to the form
  // isPending: true while the server is processing the login
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-xl border-t-[6px] border-cavite-maroon">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tighter text-cavite-maroon uppercase">
            AMSIRS
          </h1>
          <p className="text-sm font-medium text-gray-500 mt-2 tracking-wide">
            Cavite National High School
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          
          {/* Display Error Message with high contrast for Light Mode */}
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm text-center font-medium">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
              Institutional Email
            </label>
            <input 
              name="email"
              type="email" 
              required
              disabled={isPending}
              className="w-full bg-white border border-gray-300 rounded-lg p-3.5 text-black placeholder:text-gray-400 focus:outline-none focus:border-cavite-maroon focus:ring-2 focus:ring-cavite-maroon/10 transition-all disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="guard@amsirs.edu.ph"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-tight">
              Password
            </label>
            <input 
              name="password"
              type="password" 
              required
              disabled={isPending}
              className="w-full bg-white border border-gray-300 rounded-lg p-3.5 text-black placeholder:text-gray-400 focus:outline-none focus:border-cavite-maroon focus:ring-2 focus:ring-cavite-maroon/10 transition-all disabled:bg-gray-100 disabled:text-gray-500"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={isPending}
            className="w-full bg-cavite-maroon text-white font-bold py-4 rounded-lg hover:bg-[#600000] active:scale-[0.98] transition-all shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {isPending ? 'Verifying Identity...' : 'Authenticate'}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-[0.2em]">
            Authorized Personnel Only • Secure Session
          </p>
        </div>
      </div>
    </div>
  );
}