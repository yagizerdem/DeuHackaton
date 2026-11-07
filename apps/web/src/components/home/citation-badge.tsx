import { cn } from "@/lib/utils";

interface CitationBadgeProps {
  index: number;
  href?: string;
  className?: string;
}

const BADGE_CLASS =
  "rounded bg-stitch-tertiary-fixed px-1.5 py-0.5 font-stitch-label text-xs font-semibold text-stitch-on-tertiary-fixed-variant";

export default function CitationBadge({
  index,
  href,
  className,
}: CitationBadgeProps) {
  if (!href)
    return <span className={cn(BADGE_CLASS, className)}>[{index}]</span>;

  return (
    <a
      href={href}
      className={cn(
        BADGE_CLASS,
        "mx-0.5 inline-flex items-center border border-stitch-on-tertiary-container/30 transition-colors hover:bg-stitch-tertiary-fixed-dim",
        className,
      )}
    >
      [{index}]
    </a>
  );
}
