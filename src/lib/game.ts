export type Task = {
  id: string;              // "2-7"
  directionId: number;     // 1..12
  taskNumber: number;      // 1..22
  title: string;
  subtasks: { id: string; text: string }[];
};

export type TasksData = { tasks: Task[] };
export type Progress = Record<string, number>; // taskId -> doneCount

export const isMainDirection = (directionId: number) => directionId >= 1 && directionId <= 7;

export function pointsForTask(directionId: number, taskNumber: number): number {
  if (isMainDirection(directionId)) {
    if (taskNumber <= 3) return 100;
    if (taskNumber <= 7) return 150;
    if (taskNumber <= 10) return 200;
    if (taskNumber <= 13) return 250;
    if (taskNumber <= 17) return 300;
    if (taskNumber <= 20) return 350;
    return 400;
  } else {
    return taskNumber <= 13 ? 10 : 20;
  }
}

export function levelInfo(totalXp: number) {
  let L = 0;
  while (500 * (L + 1) * (L + 2) / 2 <= totalXp) L++;

  const xpAtLevelStart = 500 * L * (L + 1) / 2;
  const xpForNext = 500 * (L + 1);
  const intoLevel = totalXp - xpAtLevelStart;
  const progress01 = xpForNext === 0 ? 0 : Math.min(1, Math.max(0, intoLevel / xpForNext));

  return { level: L, xpForNext, xpToNext: xpForNext - intoLevel, progress01 };
}

export function buildIndex(tasks: Task[]) {
  const byDirection = new Map<number, Task[]>();
  for (const t of tasks) {
    if (!byDirection.has(t.directionId)) byDirection.set(t.directionId, []);
    byDirection.get(t.directionId)!.push(t);
  }
  for (const [d, arr] of byDirection) arr.sort((a,b) => a.taskNumber - b.taskNumber);
  return { byDirection };
}

export function normalizeProgress(progress: Progress, tasks: Task[]) {
  const { byDirection } = buildIndex(tasks);
  const next: Progress = { ...progress };

  for (const t of tasks) {
    const max = t.subtasks.length;
    next[t.id] = Math.max(0, Math.min(max, next[t.id] ?? 0));
  }

  // лочим всё после первой незавершённой в каждом направлении
  for (const [, arr] of byDirection) {
    const firstIncompleteIdx = arr.findIndex(t => (next[t.id] ?? 0) < t.subtasks.length);
    if (firstIncompleteIdx === -1) continue;
    for (let i = firstIncompleteIdx + 1; i < arr.length; i++) next[arr[i].id] = 0;
  }

  return next;
}

export function getActiveTasks(tasks: Task[], progress: Progress): Task[] {
  const { byDirection } = buildIndex(tasks);
  const active: Task[] = [];
  for (const [, arr] of byDirection) {
    const t = arr.find(x => (progress[x.id] ?? 0) < x.subtasks.length);
    if (t) active.push(t);
  }
  return active.sort((a,b) => a.directionId - b.directionId);
}

export function getArchiveTasks(tasks: Task[], progress: Progress): Task[] {
  const { byDirection } = buildIndex(tasks);
  const archived: Task[] = [];

  for (const [, arr] of byDirection) {
    const firstIncompleteIdx = arr.findIndex(t => (progress[t.id] ?? 0) < t.subtasks.length);
    const cutoff = firstIncompleteIdx === -1 ? arr.length : firstIncompleteIdx;
    for (let i = 0; i < cutoff; i++) {
      const t = arr[i];
      if ((progress[t.id] ?? 0) >= t.subtasks.length) archived.push(t);
    }
  }
  return archived.sort((a,b) => (a.directionId - b.directionId) || (a.taskNumber - b.taskNumber));
}

export function totalXp(tasks: Task[], progress: Progress) {
  let xp = 0;
  for (const t of tasks) {
    if ((progress[t.id] ?? 0) >= t.subtasks.length) xp += pointsForTask(t.directionId, t.taskNumber);
  }
  return xp;
}

export function mainVsSideDoneSubtasks(tasks: Task[], progress: Progress) {
  let mainDone = 0, sideDone = 0;
  for (const t of tasks) {
    const done = progress[t.id] ?? 0;
    if (isMainDirection(t.directionId)) mainDone += done;
    else sideDone += done;
  }
  return { mainDone, sideDone };
}

export function recommendedCounts(mainDone: number, sideDone: number, total = 5) {
  if (mainDone === 0 && sideDone === 0) {
    const main = Math.round(total * (7 / 12)); // 3
    return { main, side: total - main };
  }
  if (mainDone === 0) return { main: total, side: 0 };
  if (sideDone === 0) return { main: 0, side: total };

  const mainScore = 7 / mainDone;
  const sideScore = 5 / sideDone;

  let main = Math.round(total * (mainScore / (mainScore + sideScore)));
  main = Math.max(0, Math.min(total, main));
  return { main, side: total - main };
}

function sample<T>(arr: T[], k: number) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(k, a.length));
}

export type RecommendedItem = {
  taskId: string;
  taskTitle: string;
  directionId: number;
  taskNumber: number;
  subtaskIndex: number;
  subtaskText: string;
};

export function pickRecommendations(tasks: Task[], progress: Progress, total = 5): RecommendedItem[] {
  const activeTasks = getActiveTasks(tasks, progress);

  const activeItems: RecommendedItem[] = activeTasks.map(t => {
    const done = progress[t.id] ?? 0;
    return {
      taskId: t.id,
      taskTitle: t.title,
      directionId: t.directionId,
      taskNumber: t.taskNumber,
      subtaskIndex: done,
      subtaskText: t.subtasks[done]?.text ?? "",
    };
  }).filter(x => x.subtaskText);

  const mainPool = activeItems.filter(x => isMainDirection(x.directionId));
  const sidePool = activeItems.filter(x => !isMainDirection(x.directionId));

  const { mainDone, sideDone } = mainVsSideDoneSubtasks(tasks, progress);
  let { main, side } = recommendedCounts(mainDone, sideDone, total);

  main = Math.min(main, mainPool.length);
  side = Math.min(side, sidePool.length);

  let picked = [...sample(mainPool, main), ...sample(sidePool, side)];
  if (picked.length < total) {
    const rest = activeItems.filter(x => !picked.some(p => p.taskId === x.taskId));
    picked = [...picked, ...sample(rest, total - picked.length)];
  }
  return picked.slice(0, total);
}

export function completeActiveSubtask(tasks: Task[], progress: Progress, taskId: string): Progress {
  const t = tasks.find(x => x.id === taskId);
  if (!t) return progress;
  const done = progress[taskId] ?? 0;
  const next = { ...progress, [taskId]: Math.min(t.subtasks.length, done + 1) };
  return normalizeProgress(next, tasks);
}

export function rollbackToIndex(tasks: Task[], progress: Progress, taskId: string, i: number): Progress {
  const t = tasks.find(x => x.id === taskId);
  if (!t) return progress;
  const next = { ...progress, [taskId]: Math.max(0, Math.min(t.subtasks.length, i)) };
  return normalizeProgress(next, tasks);
}
