"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useTasks } from "@/lib/useTasks";
import { useGameStore } from "@/lib/store";
import { getActiveTasks } from "@/lib/game";

export default function ActivePage() {
  const { tasks, error } = useTasks();
  const progress = useGameStore(s => s.progress);
  const setProgress = useGameStore(s => s.setProgress);

  useEffect(() => {
    if (tasks) setProgress(tasks, progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!tasks]);

  const active = useMemo(() => {
    if (!tasks) return [];
    return getActiveTasks(tasks, progress);
  }, [tasks, progress]);

  if (error) return <div className="p-6">Ошибка: {error}</div>;
  if (!tasks) return <div className="p-6">Загрузка…</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold">Активные задачи</div>
        <Link className="px-3 py-2 rounded border" href="/">На главную</Link>
      </div>

      <div className="space-y-2">
        {active.map(t => {
          const done = progress[t.id] ?? 0;
          const activeSub = t.subtasks[done]?.text ?? "";
          return (
            <Link key={t.id} href={`/task/${encodeURIComponent(t.id)}`} className="block border rounded p-3">
              <div className="font-medium">{t.title}</div>
              <div className="text-sm opacity-70">Активно: {activeSub}</div>
              <div className="text-xs opacity-50">Направление {t.directionId} • Задание {t.taskNumber}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
