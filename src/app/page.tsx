"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useTasks } from "@/lib/useTasks";
import { useGameStore } from "@/lib/store";
import { levelInfo, pickRecommendations, totalXp } from "@/lib/game";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const { tasks, error } = useTasks();
  const progress = useGameStore(s => s.progress);
  const setProgress = useGameStore(s => s.setProgress);
  const complete = useGameStore(s => s.complete);

  useEffect(() => {
    if (tasks) setProgress(tasks, progress); // нормализация и лочки
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!tasks]);

  const xp = tasks ? totalXp(tasks, progress) : 0;
  const lvl = levelInfo(xp);

  const recs = useMemo(() => {
    if (!tasks) return [];
    return pickRecommendations(tasks, progress, 5);
  }, [tasks, progress]);

  if (error) return <div className="p-6">Ошибка загрузки задач: {error}</div>;
  if (!tasks) return <div className="p-6">Загрузка…</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-semibold">Уровень {lvl.level}</div>
          <div className="text-sm opacity-70">
            До следующего: {lvl.xpToNext} XP (нужно {lvl.xpForNext})
          </div>
        </div>
        <div className="space-x-2">
          <Link className="px-3 py-2 rounded bg-black text-white" href="/active">Активные</Link>
          <Link className="px-3 py-2 rounded border" href="/archive">Архив</Link>
        </div>
      </div>

      <div className="border rounded p-3">
        <div className="h-3 rounded bg-black/10 overflow-hidden">
          <div className="h-3 bg-black" style={{ width: `${Math.round(lvl.progress01 * 100)}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-lg font-semibold">Рекомендуемые подзадачи</div>

        {recs.map((r) => (
          <div key={r.taskId} className="border rounded p-3 flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1"
              onChange={() => {
                complete(tasks, r.taskId);
                // если задача закрылась — просто вернёмся на главную (мы и так на главной)
              }}
            />
            <button
              className="text-left"
              onClick={() => router.push(`/task/${encodeURIComponent(r.taskId)}`)}
            >
              <div className="font-medium">{r.taskTitle}</div>
              <div className="text-sm opacity-70">{r.subtaskText}</div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
