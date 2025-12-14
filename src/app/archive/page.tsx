"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useTasks } from "@/lib/useTasks";
import { useGameStore } from "@/lib/store";
import { getArchiveTasks } from "@/lib/game";

export default function ArchivePage() {
  const { tasks, error } = useTasks();
  const progress = useGameStore(s => s.progress);
  const setProgress = useGameStore(s => s.setProgress);

  useEffect(() => {
    if (tasks) setProgress(tasks, progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!tasks]);

  const archived = useMemo(() => {
    if (!tasks) return [];
    return getArchiveTasks(tasks, progress);
  }, [tasks, progress]);

  if (error) return <div className="p-6">Ошибка: {error}</div>;
  if (!tasks) return <div className="p-6">Загрузка…</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-semibold">Архив</div>
        <Link className="px-3 py-2 rounded border" href="/">На главную</Link>
      </div>

      <div className="space-y-2">
        {archived.length === 0 && <div className="opacity-70">Пока пусто.</div>}
        {archived.map(t => (
          <Link key={t.id} href={`/task/${encodeURIComponent(t.id)}`} className="block border rounded p-3">
            <div className="font-medium">{t.title}</div>
            <div className="text-xs opacity-50">Направление {t.directionId} • Задание {t.taskNumber}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
