export function HudPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-hudLine bg-black/35 shadow-hud hud-cut">
      <div className="px-4 py-3 border-b border-hudLine flex items-center justify-between">
        <div className="font-hudTitle tracking-widest text-sm text-hudDim">{title}</div>
        <div className="h-[2px] w-10 bg-hudRed/70 shadow-[0_0_12px_rgba(255,60,60,.25)]" />
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
