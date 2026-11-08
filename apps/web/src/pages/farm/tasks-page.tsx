import { useEffect, useState } from "react";
import { Pencil, Plus, Repeat } from "lucide-react";
import type { TaskDto } from "@DeparkHackaton/dto";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Checkbox } from "@components/ui/checkbox";
import { Skeleton } from "@components/ui/skeleton";
import ConfirmDelete from "@components/farm/confirm-delete";
import FarmShell from "@components/farm/farm-shell";
import TaskFormDialog from "@components/farm/task-form-dialog";
import {
  useCompleteTask,
  useDeleteTask,
  useParcels,
  usePlants,
  useTasks,
  useUpdateTask,
} from "@/lib/farm-api";
import { cn } from "@/lib/utils";

type Filter = "open" | "done" | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "done", label: "Done" },
  { value: "all", label: "All" },
];

const REPEAT_LABEL = {
  none: "",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
} as const;

export default function TasksPage() {
  // "new" opens the empty form, a task opens it for editing
  const [editor, setEditor] = useState<TaskDto | "new" | null>(null);
  const [filter, setFilter] = useState<Filter>("open");
  // ticks every minute so a task turns overdue without a reload
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  const tasks = useTasks();
  const plants = usePlants();
  const parcels = useParcels();
  const completeTask = useCompleteTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const plantName = new Map(plants.data?.map((p) => [p.id, p.name]));
  const parcelName = new Map(parcels.data?.map((p) => [p.id, p.name]));
  const visible = tasks.data?.filter(
    (task) => filter === "all" || task.done === (filter === "done"),
  );

  function toggle(task: TaskDto) {
    if (task.done) {
      updateTask.mutate({ id: task.id, patch: { done: false } });
    } else {
      completeTask.mutate(task.id);
    }
  }

  return (
    <FarmShell
      title="Tasks"
      actions={
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border/60 p-0.5">
            {FILTERS.map((item) => (
              <Button
                key={item.value}
                size="sm"
                variant={filter === item.value ? "secondary" : "ghost"}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <Button onClick={() => setEditor("new")}>
            <Plus />
            Add task
          </Button>
        </div>
      }
    >
      {tasks.isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : tasks.isError ? (
        <p className="text-sm text-destructive">Could not load your tasks.</p>
      ) : visible?.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {filter === "open"
            ? "Nothing to do. Add a task such as “Spray on Monday”."
            : "No tasks here."}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible?.map((task) => {
            const overdue = !task.done && new Date(task.dueDate).getTime() < now;
            return (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
              >
                <Checkbox
                  checked={task.done}
                  aria-label={task.done ? "Reopen task" : "Mark task done"}
                  disabled={completeTask.isPending || updateTask.isPending}
                  onCheckedChange={() => toggle(task)}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-stitch-body text-stitch-body-md text-foreground",
                      task.done && "text-muted-foreground line-through",
                    )}
                  >
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "font-stitch-label",
                        overdue && "font-semibold text-destructive",
                      )}
                    >
                      {overdue && "Overdue · "}
                      {new Date(task.dueDate).toLocaleString([], {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    {task.plantId && <span>{plantName.get(task.plantId)}</span>}
                    {task.parcelId && (
                      <span>{parcelName.get(task.parcelId)}</span>
                    )}
                    {task.notes && <span className="truncate">{task.notes}</span>}
                  </div>
                </div>
                {task.repeat !== "none" && (
                  <Badge variant="outline" className="gap-1">
                    <Repeat className="size-3" />
                    {REPEAT_LABEL[task.repeat]}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Edit"
                  aria-label={`Edit ${task.title}`}
                  onClick={() => setEditor(task)}
                >
                  <Pencil />
                </Button>
                <ConfirmDelete
                  name={task.title}
                  onConfirm={() => deleteTask.mutate(task.id)}
                />
              </li>
            );
          })}
        </ul>
      )}

      {editor && (
        <TaskFormDialog
          open
          onOpenChange={(open) => !open && setEditor(null)}
          task={editor === "new" ? undefined : editor}
          plants={plants.data ?? []}
          parcels={parcels.data ?? []}
        />
      )}
    </FarmShell>
  );
}
