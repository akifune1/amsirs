import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border-t-4 border-red-600 text-center">
        
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2 uppercase">
          Access Denied
        </h1>
        
        <p className="text-gray-500 font-medium text-sm mb-8">
          You do not have the required security clearance to view this directory. Your access attempt has been logged.
        </p>

        <Link 
          href="/login"
          className="inline-block bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-lg transition-colors uppercase tracking-widest text-xs"
        >
          Return to Portal
        </Link>
      </div>
    </div>
  );
}