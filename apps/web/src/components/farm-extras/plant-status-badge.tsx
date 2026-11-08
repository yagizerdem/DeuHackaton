import type { PlantHealthStatus } from "@DeparkHackaton/dto";
import { Badge } from "@components/ui/badge";
import { cn } from "@/lib/utils";

export const STATUS_STYLE: Record<
  PlantHealthStatus,
  { label: string; badge: string; dot: string }
> = {
  healthy: {
    label: "Sağlıklı",
    badge: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    dot: "bg-green-600",
  },
  watching: {
    label: "İzleniyor",
    badge: "bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200",
    dot: "bg-yellow-500",
  },
  treating: {
    label: "Tedavide",
    badge: "bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200",
    dot: "bg-orange-500",
  },
  critical: {
    label: "Kritik",
    badge: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
    dot: "bg-red-600",
  },
  unknown: {
    label: "Analiz yok",
    badge: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground/50",
  },
};

/** Most urgent first, used for sorting and for the filter options. */
export const STATUS_ORDER: PlantHealthStatus[] = [
  "critical",
  "treating",
  "watching",
  "healthy",
  "unknown",
];

export default function PlantStatusBadge({
  status,
  className,
}: {
  status: PlantHealthStatus;
  className?: string;
}) {
  const style = STATUS_STYLE[status];
  return (
    <Badge variant="secondary" className={cn(style.badge, className)}>
      <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden />
      {style.label}
    </Badge>
  );
}
