import { logout } from '../auth/actions'; // Ensure this path matches your logout action

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border-t-4 border-cavite-maroon text-center">
        
        <div className="w-16 h-16 bg-maroon-50 text-cavite-maroon rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2 uppercase">
          Account Pending
        </h1>
        
        <p className="text-gray-600 font-medium text-sm mb-8 leading-relaxed">
          Your biometric registration has been received. An administrator must verify your identity before you can access the AMSIRS portal.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Verification Status</p>
          <p className="text-xs font-bold text-orange-600 uppercase tracking-tighter">Awaiting Manual Review</p>
        </div>

        {/* CHANGED: Replaced <Link> with a Form and Server Action */}
        <form action={logout}>
          <button 
            type="submit"
            className="text-xs font-bold text-gray-400 hover:text-cavite-maroon transition-colors uppercase tracking-widest"
          >
            Sign out and return later
          </button>
        </form>
      </div>
    </div>
  );
}