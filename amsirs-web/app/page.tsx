'use client';

import { useActionState, Suspense } from 'react';
import Link from 'next/link';
import { login } from './login/actions';
import { useSearchParams } from 'next/navigation';
import ThemeToggle from '@/app/components/ThemeToggle';

function LoginFormContent() {
  const [state, formAction, isPending] = useActionState(login, null);
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');

  const errorMessage = state?.error || urlError;

  return (
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
        {errorMessage && (
          <div className="alert-error text-center rounded-lg p-3 bg-red-500/10 text-red-500 border border-red-500/20 font-medium text-sm">
            {errorMessage}
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
            placeholder="jdelacruz@email.com"
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
          Mabuhay Cavite High!
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Suspense fallback={<div className="max-w-md w-full sys-card p-10 border-t-[6px] border-t-cavite-maroon animate-pulse"><div className="h-64"></div></div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
