export default function RegisterLoading() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <main className="p-6 md:p-12 animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10 text-center">
            <div className="h-10 w-72 bg-gray-200 animate-pulse rounded-md mx-auto"></div>
            <div className="h-5 w-96 bg-gray-100 animate-pulse rounded-md mt-2 mx-auto"></div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
            <div className="p-8 md:p-10 space-y-10">
              
              {/* Account Credentials Section */}
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-2">
                  <div className="h-4 w-40 bg-gray-200 animate-pulse rounded-md"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded-md"></div>
                    <div className="h-10 w-full bg-gray-50 border border-gray-100 animate-pulse rounded-md"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded-md"></div>
                    <div className="h-10 w-full bg-gray-50 border border-gray-100 animate-pulse rounded-md"></div>
                  </div>
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-2">
                  <div className="h-4 w-40 bg-gray-200 animate-pulse rounded-md"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded-md"></div>
                    <div className="h-10 w-full bg-gray-50 border border-gray-100 animate-pulse rounded-md"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded-md"></div>
                    <div className="h-10 w-full bg-gray-50 border border-gray-100 animate-pulse rounded-md"></div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded-md"></div>
                    <div className="h-10 w-full bg-gray-50 border border-gray-100 animate-pulse rounded-md"></div>
                  </div>
                </div>
              </div>

              {/* Camera Capture Section */}
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-2">
                  <div className="h-4 w-48 bg-gray-200 animate-pulse rounded-md"></div>
                </div>
                
                <div className="p-4">
                  <div className="h-64 w-full md:w-80 mx-auto bg-gray-100 border-2 border-dashed border-gray-200 animate-pulse rounded-xl"></div>
                </div>
              </div>

              {/* Button */}
              <div className="pt-4 border-t border-gray-100">
                <div className="h-14 w-full bg-gray-200 animate-pulse rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
