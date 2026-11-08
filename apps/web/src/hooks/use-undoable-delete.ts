import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const UNDO_WINDOW_MS = 6000;

interface Batch {
  ids: string[];
  state: "pending" | "undone" | "committed";
}

const without = (set: ReadonlySet<string>, ids: string[]) => {
  const next = new Set(set);
  ids.forEach((id) => next.delete(id));
  return next;
};

/**
 * Deletes after a short undo window. `schedule` hides the items right away and
 * shows a toast with an undo button. The delete requests are only sent once the
 * window is over, so undo never has to restore anything on the server. Leaving
 * the page sends them at once. A closed tab sends nothing, so the items stay.
 */
export function useUndoableDelete(remove: (id: string) => Promise<unknown>) {
  const queryClient = useQueryClient();
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const batches = useRef(new Set<Batch>());

  const commit = useCallback(
    async (batch: Batch) => {
      // undo, auto close and dismiss can all fire for the same toast
      if (batch.state !== "pending") return;
      batch.state = "committed";
      batches.current.delete(batch);

      const results = await Promise.allSettled(batch.ids.map(remove));
      const failed = results.filter((r) => r.status === "rejected").length;
      await queryClient.invalidateQueries();
      setHidden((current) => without(current, batch.ids));
      if (failed > 0) toast.error(`${failed} kayıt silinemedi`);
    },
    [queryClient, remove],
  );

  const schedule = useCallback(
    (ids: string[], message: string) => {
      const batch: Batch = { ids, state: "pending" };
      batches.current.add(batch);
      setHidden((current) => new Set([...current, ...ids]));

      toast(message, {
        duration: UNDO_WINDOW_MS,
        action: {
          label: "Geri al",
          onClick: () => {
            if (batch.state !== "pending") return;
            batch.state = "undone";
            batches.current.delete(batch);
            setHidden((current) => without(current, ids));
          },
        },
        onAutoClose: () => void commit(batch),
        onDismiss: () => void commit(batch),
      });
    },
    [commit],
  );

  // Flush on leaving only. The ref keeps this effect from re-running (and
  // flushing early) whenever `commit` gets a new identity.
  const commitRef = useRef(commit);
  useEffect(() => {
    commitRef.current = commit;
  }, [commit]);
  useEffect(() => {
    const pending = batches.current;
    return () => pending.forEach((batch) => void commitRef.current(batch));
  }, []);

  return { hidden, schedule };
}
