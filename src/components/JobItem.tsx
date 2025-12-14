import Link from "next/link";

export function JobItem({
  href, title, danger, selected
}: { href: string; title: string; danger?: string; selected?: boolean; }) {
  return (
    <Link
      href={href}
      className={[
        "block px-3 py-2 border-l-2",
        selected ? "bg-hudRed/10 border-hudRed shadow-hudStrong" : "bg-black/20 border-transparent hover:border-hudLineStrong hover:bg-black/30",
      ].join(" ")}
    >
      <div className="text-sm font-semibold">{title}</div>
      {danger && <div className="text-[11px] tracking-wider text-hudDim">DANGER: <span className="text-hudRed hud-glow">{danger}</span></div>}
    </Link>
  );
}
