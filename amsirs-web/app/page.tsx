'use client';

import { useActionState } from 'react';
import Link from 'next/link'; 
import { login } from './login/actions';

export default function LoginPage() {
  // state: holds the return value from the action (e.g., the error message)
  // formAction: the version of the login function we pass to the form
  // isPending: true while the server is processing the login
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Replaced heavy inline shadow/border classes with sys-card, 
          but kept the specific max-width, padding, and top-border accent. */}
      <div className="max-w-md w-full sys-card p-10 border-t-[6px] border-t-cavite-maroon">
        
        <div className="text-center mb-10">
          <h1 className="sys-title">
            AMSIRS
          </h1>
          <p className="sys-subtitle mt-2">
            Cavite National High School
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          
          {/* Display Error Message using the new alert-error component */}
          {state?.error && (
            <div className="alert-error text-center rounded-lg">
              {state.error}
            </div>
          )}

          <div>
            <label className="form-label">
              Institutional Email
            </label>
            <input 
              name="email"
              type="email" 
              required
              disabled={isPending}
              className="input-field"
              placeholder="guard@amsirs.edu.ph"
            />
          </div>

          <div>
            <label className="form-label">
              Password
            </label>
            <input 
              name="password"
              type="password" 
              required
              disabled={isPending}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          {/* Replaced heavy inline button classes with btn-primary */}
          <button 
            type="submit"
            disabled={isPending}
            className="btn-primary mt-2"
          >
            {isPending ? 'Verifying Identity...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 flex justify-center">
          <Link href="/register" className="btn-text">
            No Account Yet? Register Here
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-cavite-border text-center">
          <p className="sys-label">
            Authorized Personnel Only • Secure Session
          </p>
        </div>
      </div>
    </div>
  );
}
