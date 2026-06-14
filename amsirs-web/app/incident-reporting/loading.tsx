export default function IncidentReportingLoading() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <main className="sys-container max-w-4xl animate-in fade-in duration-500">
        <div className="mb-10 text-center md:text-left">
          <div className="h-10 w-64 bg-gray-200 animate-pulse rounded-md mx-auto md:mx-0"></div>
          <div className="h-5 w-48 bg-gray-100 animate-pulse rounded-md mt-2 mx-auto md:mx-0"></div>
        </div>

        <div className="sys-card">
          <div className="sys-card-header flex justify-between">
            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-3 w-20 bg-gray-200 animate-pulse rounded-md"></div>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-10">
            {/* Student Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-2">
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-md"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-gray-200 animate-pulse rounded-md"></div>
                  <div className="h-10 w-full bg-white border border-gray-100 animate-pulse rounded-md"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-gray-200 animate-pulse rounded-md"></div>
                  <div className="h-10 w-full bg-white border border-gray-100 animate-pulse rounded-md"></div>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-2">
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded-md"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-gray-200 animate-pulse rounded-md"></div>
                  <div className="h-10 w-full bg-white border border-gray-100 animate-pulse rounded-md"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-gray-200 animate-pulse rounded-md"></div>
                  <div className="h-10 w-full bg-white border border-gray-100 animate-pulse rounded-md"></div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 animate-pulse rounded-md"></div>
              <div className="h-32 w-full bg-white border border-gray-100 animate-pulse rounded-md"></div>
            </div>

            {/* Button */}
            <div className="pt-4 border-t border-gray-100">
              <div className="h-12 w-full md:w-64 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
