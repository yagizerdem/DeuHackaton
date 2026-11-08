import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ListChecks, Plus, Sprout } from "lucide-react";
import type { BoardTaskDto, TaskStatus } from "@DeparkHackaton/dto";
import { Button } from "@components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@components/ui/empty";
import { Skeleton } from "@components/ui/skeleton";
import FarmShell from "@components/farm/farm-shell";
import TaskFormDialog from "@components/farm/task-form-dialog";
import BoardColumn from "@components/farm-extras/board-column";
import BoardTaskCard, { STATUS_LABEL } from "@components/farm-extras/board-task-card";
import { useUndoableDelete } from "@/hooks/use-undoable-delete";
import { useParcels, usePlants } from "@/lib/farm-api";
import { requestDeleteTask, useBoard, useMoveTask } from "@/lib/farm-overview-api";

const COLUMNS: TaskStatus[] = ["todo", "doing", "done"];
// finished tasks pile up, show the latest ones
const DONE_PAGE = 12;

export default function TaskBoardPage() {
  // "new" opens the empty form, a task opens it for editing
  const [editor, setEditor] = useState<BoardTaskDto | "new" | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [doneShown, setDoneShown] = useState(DONE_PAGE);
  // ticks every minute so a task turns overdue without a reload
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const board = useBoard();
  const plants = usePlants();
  const parcels = useParcels();
  const move = useMoveTask();
  const { hidden, schedule } = useUndoableDelete(requestDeleteTask);

  const plantNames = useMemo(
    () => new Map(plants.data?.map((p) => [p.id, p.name])),
    [plants.data],
  );

  const columns = useMemo(() => {
    const tasks = board.data?.filter((t) => !hidden.has(t.id)) ?? [];
    const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);
    return {
      todo: byStatus("todo"),
      doing: byStatus("doing"),
      // latest finished first
      done: byStatus("done").sort((a, b) => (b.doneAt ?? "").localeCompare(a.doneAt ?? "")),
    } satisfies Record<TaskStatus, BoardTaskDto[]>;
  }, [board.data, hidden]);
  const total = columns.todo.length + columns.doing.length + columns.done.length;

  function moveTask(id: string, status: TaskStatus) {
    const task = board.data?.find((t) => t.id === id);
    if (task && task.status !== status) move.mutate({ id, status });
  }

  return (
    <FarmShell
      title="Görev panosu"
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" nativeButton={false} render={<Link to="/plants/overview" />}>
            <Sprout />
            Bitki envanteri
          </Button>
          <Button onClick={() => setEditor("new")}>
            <Plus />
            Görev ekle
          </Button>
        </div>
      }
    >
      {board.isPending ? (
        <div className="grid gap-4 md:grid-cols-3" role="status" aria-label="Görevler yükleniyor">
          {COLUMNS.map((status) => (
            <div key={status} className="space-y-2 rounded-xl border border-border/60 p-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
          ))}
        </div>
      ) : board.isError ? (
        <p role="alert" className="text-sm text-destructive">Görevler yüklenemedi.</p>
      ) : total === 0 ? (
        <Empty className="border border-dashed border-border">
          <EmptyHeader>
            <EmptyMedia variant="icon"><ListChecks /></EmptyMedia>
            <EmptyTitle>Henüz görevin yok</EmptyTitle>
            <EmptyDescription>
              Sulama, ilaçlama gibi işlerini ekle, sonra sütunlar arasında sürükleyerek ilerlet.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setEditor("new")}>
              <Plus />
              İlk görevini ekle
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <p className="mb-3 text-xs text-muted-foreground">
            Görevleri sütunlar arasında sürükle. Klavye veya dokunmatik kullanıyorsan karttaki
            listeden taşı.
          </p>
          <div className="grid items-start gap-4 md:grid-cols-3">
            {COLUMNS.map((status) => {
              const tasks = columns[status];
              const shown = status === "done" ? tasks.slice(0, doneShown) : tasks;
              return (
                <BoardColumn
                  key={status}
                  title={STATUS_LABEL[status]}
                  count={tasks.length}
                  onDropTask={(id) => moveTask(id, status)}
                >
                  {shown.map((task) => (
                    <BoardTaskCard
                      key={task.id}
                      task={task}
                      plantName={task.plantId ? plantNames.get(task.plantId) : undefined}
                      overdue={task.status !== "done" && new Date(task.dueDate).getTime() < now}
                      dragging={draggingId === task.id}
                      onDragStart={() => setDraggingId(task.id)}
                      onDragEnd={() => setDraggingId(null)}
                      onMove={(next) => moveTask(task.id, next)}
                      onEdit={() => setEditor(task)}
                      onDelete={() => schedule([task.id], `“${task.title}” silindi`)}
                    />
                  ))}
                  {status === "done" && tasks.length > shown.length && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDoneShown((n) => n + DONE_PAGE)}
                    >
                      {tasks.length - shown.length} görev daha göster
                    </Button>
                  )}
                </BoardColumn>
              );
            })}
          </div>
        </>
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
