import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Progress, Task } from "./game";
import { normalizeProgress, completeActiveSubtask, rollbackToIndex } from "./game";

type State = {
  progress: Progress;
  setProgress: (tasks: Task[], p: Progress) => void;
  complete: (tasks: Task[], taskId: string) => void;
  rollback: (tasks: Task[], taskId: string, subtaskIndex: number) => void;
};

export const useGameStore = create<State>()(
  persist(
    (set, get) => ({
      progress: {},
      setProgress: (tasks, p) => set({ progress: normalizeProgress(p, tasks) }),
      complete: (tasks, taskId) => set({ progress: completeActiveSubtask(tasks, get().progress, taskId) }),
      rollback: (tasks, taskId, subtaskIndex) =>
        set({ progress: rollbackToIndex(tasks, get().progress, taskId, subtaskIndex) }),
    }),
    { name: "life-rpg-progress-v1" }
  )
);
