import { useRef, useState } from "react";
import { Camera, ImagePlus, Sparkles, X, ScanLine, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import bgScan from "@/assets/bg-ai-scan.jpg";

type Props = {
  imageUrl: string | null;
  analyzing: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
};

export function UploadCard({ imageUrl, analyzing, onPick, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="relative rounded-[2rem] overflow-hidden shadow-elevated isolate">
      {/* Cinematic backdrop */}
      <div className="absolute inset-0 -z-10">
        <img src={bgScan} alt="" className="h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,14,0.55)_0%,rgba(8,18,14,0.78)_100%)]" />
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[color-mix(in_oklch,var(--sage)_45%,transparent)] blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[color-mix(in_oklch,var(--ember)_35%,transparent)] blur-3xl" />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
      />

      <div className="relative p-5 sm:p-8">
        {!imageUrl ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) onPick(f);
            }}
            className={cn(
              "relative rounded-[1.6rem] p-8 sm:p-12 text-center overflow-hidden transition-all",
              "border border-white/15 bg-white/[0.04] backdrop-blur-md",
              dragOver && "bg-white/[0.08] scale-[1.005]",
            )}
          >
            {/* Glowing scan corners */}
            {["top-3 left-3 border-t-2 border-l-2", "top-3 right-3 border-t-2 border-r-2", "bottom-3 left-3 border-b-2 border-l-2", "bottom-3 right-3 border-b-2 border-r-2"].map((c, i) => (
              <span key={i} aria-hidden className={`absolute h-6 w-6 ${c} border-[color:var(--sage)] rounded-[6px] opacity-80`} />
            ))}
            {/* Scanning line */}
            <span aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--sage)] to-transparent animate-scan shadow-[0_0_18px_2px_color-mix(in_oklch,var(--sage)_60%,transparent)]" />
            {/* Floating particles */}
            <span aria-hidden className="absolute top-8 left-12 h-1 w-1 rounded-full bg-[color:var(--sage)] animate-float opacity-70" />
            <span aria-hidden className="absolute top-16 right-16 h-1.5 w-1.5 rounded-full bg-[color:var(--ember)] animate-float opacity-60" style={{ animationDelay: "1.2s" }} />
            <span aria-hidden className="absolute bottom-12 left-1/3 h-1 w-1 rounded-full bg-cream/70 animate-float" style={{ animationDelay: "2s" }} />

            <div className="relative mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-white/10 border border-white/20 backdrop-blur text-cream shadow-glow">
              <span aria-hidden className="absolute inset-0 rounded-3xl bg-[color-mix(in_oklch,var(--sage)_45%,transparent)] blur-xl -z-10 animate-float" />
              <ScanLine className="h-8 w-8" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-cream/60">AI Vision · Live scanner</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-semibold text-cream">Point. Scan. Understand.</h2>
            <p className="mt-2 text-sm text-cream/70 max-w-md mx-auto leading-relaxed">
              Capture any Indian plate — biryani, thali, chaat, sweets — and we'll render live nutrition holograms tuned to your conditions.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                onClick={() => cameraRef.current?.click()}
                className="group inline-flex items-center justify-center gap-2 rounded-full gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow hover:scale-[1.02] transition"
              >
                <Camera className="h-4 w-4" /> Use camera
              </button>
              <button
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white/10 border border-white/25 text-cream px-6 py-3 text-sm font-medium hover:bg-white/15 backdrop-blur transition"
              >
                <ImagePlus className="h-4 w-4" /> Upload photo
              </button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-cream/55">
              <span className="inline-flex items-center gap-1.5"><Zap className="h-3 w-3 text-[color:var(--ember)]" /> Sub-2-second response</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-[color:var(--sage)]" /> 200+ Indian dishes</span>
            </div>
          </div>
        ) : (
          <div className="relative rounded-[1.6rem] overflow-hidden aspect-[4/3] sm:aspect-[16/9] bg-black">
            <img src={imageUrl} alt="Meal" className="h-full w-full object-cover" />
            {analyzing && (
              <>
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />
                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--sage)] to-transparent animate-scan shadow-[0_0_22px_3px_color-mix(in_oklch,var(--sage)_60%,transparent)]" />
                {["top-4 left-4 border-t-2 border-l-2", "top-4 right-4 border-t-2 border-r-2", "bottom-4 left-4 border-b-2 border-l-2", "bottom-4 right-4 border-b-2 border-r-2"].map((c, i) => (
                  <span key={i} aria-hidden className={`absolute h-7 w-7 ${c} border-[color:var(--sage)] rounded-md`} />
                ))}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-cream">
                  <div className="relative h-16 w-16">
                    <span className="absolute inset-0 rounded-full border-2 border-cream/30" />
                    <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-[color:var(--sage)] animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-5 w-5" />
                  </div>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-cream/70">Neural scan in progress</p>
                  <p className="mt-1 text-sm font-medium">Analyzing your meal…</p>
                </div>
              </>
            )}
            {!analyzing && (
              <button
                onClick={onClear}
                className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-black/60 text-cream hover:bg-black/80 backdrop-blur"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
