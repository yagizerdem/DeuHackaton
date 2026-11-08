import { CalendarClock, GripVertical, Pencil, Repeat, Sprout, Trash2 } from "lucide-react";
import type { BoardTaskDto, TaskStatus } from "@DeparkHackaton/dto";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { NativeSelect, NativeSelectOption } from "@components/ui/native-select";
import { formatDate } from "@components/farm-extras/format";
import { cn } from "@/lib/utils";

export const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Yapılacak",
  doing: "Sürüyor",
  done: "Bitti",
};

const REPEAT_LABEL = { none: "", daily: "Her gün", weekly: "Her hafta", monthly: "Her ay" } as const;

interface BoardTaskCardProps {
  task: BoardTaskDto;
  plantName?: string;
  overdue: boolean;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  /** the select below is the keyboard and touch way to do what dragging does */
  onMove: (status: TaskStatus) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function BoardTaskCard({
  task,
  plantName,
  overdue,
  dragging,
  onDragStart,
  onDragEnd,
  onMove,
  onEdit,
  onDelete,
}: BoardTaskCardProps) {
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab space-y-2 rounded-lg border border-border/60 bg-card p-3 shadow-sm active:cursor-grabbing",
        dragging && "opacity-40",
        task.status === "done" && "opacity-75",
      )}
    >
      <div className="flex items-start gap-1.5">
        <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className={cn("font-stitch-body text-sm font-medium", task.status === "done" && "line-through")}>
            {task.title}
          </p>
          {task.notes && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{task.notes}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant={overdue ? "destructive" : "secondary"}>
          <CalendarClock aria-hidden />
          {formatDate(task.dueDate)}
          {overdue && " · gecikti"}
        </Badge>
        {task.repeat !== "none" && (
          <Badge variant="outline">
            <Repeat aria-hidden />
            {REPEAT_LABEL[task.repeat]}
          </Badge>
        )}
        {plantName && (
          <Badge variant="outline">
            <Sprout aria-hidden />
            {plantName}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <NativeSelect
          size="sm"
          aria-label={`${task.title} görevini taşı`}
          value={task.status}
          onChange={(e) => onMove(e.target.value as TaskStatus)}
        >
          {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((status) => (
            <NativeSelectOption key={status} value={status}>
              {STATUS_LABEL[status]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <div className="flex">
          <Button size="icon-sm" variant="ghost" aria-label={`${task.title} düzenle`} onClick={onEdit}>
            <Pencil />
          </Button>
          <Button size="icon-sm" variant="ghost" className="text-destructive" aria-label={`${task.title} sil`} onClick={onDelete}>
            <Trash2 />
          </Button>
        </div>
      </div>
    </li>
  );
}
