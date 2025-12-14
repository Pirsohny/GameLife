export function HudShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen font-hud hud-scanlines">
      <div className="mx-auto max-w-6xl p-5">
        <div className="rounded-md border border-hudLine shadow-hud bg-black/30 backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
