import { Sparkles } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-2xl transition-all duration-300 animate-in fade-in-0 px-4">
      {/* Central Glassmorphism Card (Icon Only) */}
      <div className="relative flex items-center justify-center rounded-[28px] border border-white/20 bg-slate-900/75 p-6 shadow-2xl backdrop-blur-3xl ring-1 ring-white/10">
        <div className="relative flex size-14 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-white/15" />
          <div className="absolute inset-0 rounded-full border-4 border-white border-t-transparent animate-spin" />
          <Sparkles className="size-5 text-amber-400 fill-amber-400" />
        </div>
      </div>
    </div>
  );
}
