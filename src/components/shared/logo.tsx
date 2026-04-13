"use client";

export function Logo({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizes = {
    sm: { mark: "w-6 h-6 text-[10px]", text: "text-sm" },
    default: { mark: "w-7 h-7 text-xs", text: "text-base" },
    lg: { mark: "w-10 h-10 text-sm", text: "text-2xl" },
  };
  const s = sizes[size];

  return (
    <span className="flex items-center gap-2 select-none">
      <span className={`${s.mark} rounded-lg bg-amber-500 flex items-center justify-center font-black text-black tracking-tighter relative overflow-hidden group`}>
        <span className="relative z-10">S</span>
        <span className="absolute inset-0 bg-gradient-to-t from-amber-600 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <style>{`
          @keyframes logo-shine {
            0%, 100% { transform: translateX(-100%) rotate(20deg); }
            50% { transform: translateX(200%) rotate(20deg); }
          }
        `}</style>
        <span
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
            animation: "logo-shine 3s ease-in-out infinite",
            width: "40%",
          }}
        />
      </span>
      <span className={`${s.text} font-bold tracking-tight text-foreground`}>
        Site<span className="text-amber-400">Forge</span>
      </span>
    </span>
  );
}

export function LogoMark({ size = "default" }: { size?: "sm" | "default" }) {
  const s = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";

  return (
    <span className={`${s} rounded-lg bg-amber-500 flex items-center justify-center font-black text-black tracking-tighter relative overflow-hidden`}>
      <span className="relative z-10">S</span>
      <style>{`
        @keyframes logo-shine {
          0%, 100% { transform: translateX(-100%) rotate(20deg); }
          50% { transform: translateX(200%) rotate(20deg); }
        }
      `}</style>
      <span
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
          animation: "logo-shine 3s ease-in-out infinite",
          width: "40%",
        }}
      />
    </span>
  );
}
