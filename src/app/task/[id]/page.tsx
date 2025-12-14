"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTasks } from "@/lib/useTasks";
import { useGameStore } from "@/lib/store";

export default function TaskPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const taskId = decodeURIComponent(params.id);

  const { tasks, error } = useTasks();
  const progress = useGameStore(s => s.progress);
  const setProgress = useGameStore(s => s.setProgress);
  const complete = useGameStore(s => s.complete);
  const rollback = useGameStore(s => s.rollback);

  useEffect(() => {
    if (tasks) setProgress(tasks, progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!tasks]);

  const task = useMemo(() => tasks?.find(t => t.id === taskId), [tasks, taskId]);
  const doneCount = task ? (progress[task.id] ?? 0) : 0;

  if (error) return <div className="p-6">Ошибка: {error}</div>;
  if (!tasks) return <div className="p-6">Загрузка…</div>;
  if (!task) return <div className="p-6">Задача не найдена. <Link href="/">На главную</Link></div>;

  const completed = task.subtasks.slice(0, doneCount);
  const active = task.subtasks[doneCount];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold">{task.title}</div>
        <Link className="px-3 py-2 rounded border" href="/">На главную</Link>
      </div>

      <div className="space-y-2">
        {completed.map((s, idx) => (
          <button
            key={s.id}
            className="w-full text-left border rounded p-3 opacity-70 line-through"
            onClick={() => rollback(tasks, task.id, idx)} // откат до idx (сделает idx активной)
          >
            {s.text}
          </button>
        ))}

        {active ? (
          <div className="border rounded p-3 flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1"
              onChange={() => {
                complete(tasks, task.id);
                // если это была последняя подзадача — после complete() задача уйдёт в архив, и нас логично кидать на главную
                const newDone = (progress[task.id] ?? 0) + 1;
                if (newDone >= task.subtasks.length) router.push("/");
              }}
            />
            <div>
              <div className="font-medium">Активная подзадача</div>
              <div className="text-sm opacity-80">{active.text}</div>
            </div>
          </div>
        ) : (
          <div className="border rounded p-3">
            Всё выполнено. <button className="underline" onClick={() => router.push("/")}>Вернуться</button>
          </div>
        )}
      </div>
    </div>
  );
}
