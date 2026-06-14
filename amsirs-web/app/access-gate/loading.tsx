export default function AccessGateLoading() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <main className="p-6 md:p-10 animate-in fade-in duration-500">
        
        {/* HEADER SKELETON */}
        <div className="mb-8">
          <div className="h-12 w-96 bg-gray-300 animate-pulse rounded-md"></div>
          <div className="h-5 w-2/3 max-w-lg bg-gray-200 animate-pulse rounded-md mt-4"></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* CAMERA FEED SKELETON */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-5 flex items-center justify-between">
                <div>
                  <div className="h-3 w-32 bg-gray-200 animate-pulse rounded-md"></div>
                  <div className="h-6 w-48 bg-gray-300 animate-pulse rounded-md mt-2"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full"></div>
              </div>
              <div className="bg-black p-4">
                <div className="w-full h-[650px] bg-gray-800 animate-pulse rounded-2xl border-4 border-gray-700"></div>
              </div>
            </div>
          </div>

          {/* SIDE PANEL SKELETONS */}
          <div className="space-y-6">
            
            {/* Identity Profile Skeleton */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="h-3 w-32 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-6 w-48 bg-gray-300 animate-pulse rounded-md mt-2"></div>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 min-h-[250px] flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-4"></div>
                  <div className="h-5 w-32 bg-gray-200 animate-pulse rounded-md mb-2"></div>
                  <div className="h-4 w-48 bg-gray-100 animate-pulse rounded-md"></div>
                </div>
              </div>
            </div>

            {/* AI Monitoring Skeleton */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="h-3 w-32 bg-gray-200 animate-pulse rounded-md"></div>
                <div className="h-6 w-40 bg-gray-300 animate-pulse rounded-md mt-2"></div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-md"></div>
                    <div className="h-8 w-32 bg-gray-300 animate-pulse rounded-md mt-2"></div>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Notice Card Skeleton */}
            <div className="bg-gray-200 rounded-3xl shadow-xl overflow-hidden h-36 animate-pulse"></div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
