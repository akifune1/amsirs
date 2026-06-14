export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-6">
      {/* Branded logo mark */}
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7A191B] to-[#A02023] flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-xl tracking-tighter">A</span>
        </div>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-2xl border-2 border-[#7A191B]/30 animate-ping" />
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#7A191B] animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 rounded-full bg-[#7A191B] animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 rounded-full bg-[#7A191B] animate-bounce [animation-delay:300ms]" />
        </div>
        <p className="text-sm font-semibold text-gray-400 tracking-wide">Loading AMSIRS</p>
      </div>
    </div>
  );
}
