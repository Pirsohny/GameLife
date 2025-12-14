"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { useTasks } from "@/lib/useTasks";
import { useGameStore } from "@/lib/store";
import {
  levelInfo,
  pickRecommendations,
  totalXp,
  getActiveTasks,
  getArchiveTasks,
  isMainDirection,
  totalDoneSubtasks, 
  dailyPaceInfo
} from "@/lib/game";

import { HudShell } from "@/components/HudShell";
import { HudPanel } from "@/components/HudPanel";
import { JobItem } from "@/components/JobItem";

export default function HomePage() {
  const router = useRouter();
  const { tasks, error } = useTasks();

  const progress = useGameStore((s) => s.progress);
  const setProgress = useGameStore((s) => s.setProgress);
  const complete = useGameStore((s) => s.complete);

  // нормализация и лочки после загрузки задач
  useEffect(() => {
    if (tasks) setProgress(tasks, progress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!tasks]);

  const xp = tasks ? totalXp(tasks, progress) : 0;
  const lvl = levelInfo(xp);

  const doneSubs = tasks ? totalDoneSubtasks(tasks, progress) : 0;
  const pace = dailyPaceInfo(doneSubs, "2025-12-14", 5);
  const paceProgress01 = pace.target > 0 ? Math.min(1, Math.max(0, pace.totalDone / pace.target)) : 1;

  const activeTasks = useMemo(() => {
    if (!tasks) return [];
    return getActiveTasks(tasks, progress);
  }, [tasks, progress]);

  const mainActive = useMemo(
    () => activeTasks.filter((t) => isMainDirection(t.directionId)),
    [activeTasks]
  );
  const sideActive = useMemo(
    () => activeTasks.filter((t) => !isMainDirection(t.directionId)),
    [activeTasks]
  );

  const archiveTasks = useMemo(() => {
    if (!tasks) return [];
    return getArchiveTasks(tasks, progress);
  }, [tasks, progress]);

  const completedPreview = useMemo(() => {
    // покажем последние 6 завершённых
    return archiveTasks.slice(-6).reverse();
  }, [archiveTasks]);

  const recs = useMemo(() => {
    if (!tasks) return [];
    return pickRecommendations(tasks, progress, 5);
  }, [tasks, progress]);

  if (error) return <div className="p-6">Ошибка загрузки задач: {error}</div>;
  if (!tasks) return <div className="p-6">Загрузка…</div>;

  return (
    <HudShell>
      <div className="grid grid-cols-12 gap-0">
        {/* LEFT колонка */}
        <div className="col-span-12 md:col-span-5 border-r border-hudLine">
          <div className="p-4 space-y-4">
            {/* Навигация как “кнопки слева” */}
            <div className="flex gap-2">
              <Link
                className="px-3 py-2 rounded border border-hudLine bg-black/25 hover:bg-black/35 shadow-hud text-sm"
                href="/active"
              >
                АКТИВНЫЕ (12)
              </Link>
              <Link
                className="px-3 py-2 rounded border border-hudLine bg-black/25 hover:bg-black/35 shadow-hud text-sm"
                href="/archive"
              >
                АРХИВ
              </Link>
            </div>

            <HudPanel title="MAIN JOBS">
              <div className="space-y-2">
                {mainActive.map((t) => (
                  <JobItem
                    key={t.id}
                    href={`/task/${encodeURIComponent(t.id)}`}
                    title={t.title}
                    danger={`TASK ${t.taskNumber}`}
                  />
                ))}
                {mainActive.length === 0 && (
                  <div className="text-sm text-hudDim">Нет активных основных задач.</div>
                )}
              </div>
            </HudPanel>

            <HudPanel title="SIDE JOBS">
              <div className="space-y-2">
                {sideActive.map((t) => (
                  <JobItem
                    key={t.id}
                    href={`/task/${encodeURIComponent(t.id)}`}
                    title={t.title}
                    danger={`TASK ${t.taskNumber}`}
                  />
                ))}
                {sideActive.length === 0 && (
                  <div className="text-sm text-hudDim">Нет активных доп. задач.</div>
                )}
              </div>
            </HudPanel>

            <HudPanel title="COMPLETED">
              <div className="space-y-2 opacity-80">
                {completedPreview.map((t) => (
                  <JobItem
                    key={t.id}
                    href={`/task/${encodeURIComponent(t.id)}`}
                    title={t.title}
                    danger="JOB COMPLETE"
                  />
                ))}
                {archiveTasks.length === 0 && (
                  <div className="text-sm text-hudDim">Пока ничего не закрыто.</div>
                )}
              </div>
            </HudPanel>
          </div>
        </div>

        {/* RIGHT колонка */}
        <div className="col-span-12 md:col-span-7">
          <div className="p-4 space-y-4">
            {/* Уровень + прогресс */}
            <div className="border border-hudLine bg-black/35 shadow-hud hud-cut">
              <div className="px-4 py-3 border-b border-hudLine flex items-center justify-between">
                <div>
                  <div className="font-hudTitle tracking-widest text-sm text-hudDim">
                    LEVEL / XP
                  </div>
                  <div className="text-2xl font-semibold hud-glow">
                    УРОВЕНЬ {lvl.level}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-hudDim">
                    До следующего: <span className="text-hudRed hud-glow">{lvl.xpToNext}</span> XP
                  </div>
                  <div className="text-xs text-hudDim">Нужно: {lvl.xpForNext} XP</div>
                </div>
              </div>

              <div className="p-4 space-y-3">
              {/* XP bar */}
                <div className="h-3 rounded bg-black/40 overflow-hidden border border-hudLine">
                  <div
                    className="h-3 bg-hudRed"
                    style={{ width: `${Math.round(lvl.progress01 * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-hudDim">
                  Текущие очки (за закрытые задачи):{" "}
                  <span className="text-hudText">{xp}</span>
                </div>

                {/* DAILY PACE */}
                <div className="pt-2 border-t border-hudLine space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-hudDim">
                      Темп: <span className="text-hudText">5</span> подзадач/день • Дней с 14.12.2025:{" "}
                        <span className="text-hudText">{pace.days}</span>
                      </div>
                      <div className="text-hudDim">
                        План: <span className="text-hudText">{pace.target}</span> • Сделано:{" "}
                          <span className="text-hudText">{pace.totalDone}</span>
                        </div>
                      </div>
                      <div className="h-2 rounded bg-black/40 overflow-hidden border border-hudLine">
                        <div
                          className="h-2 bg-hudRed"
                          style={{ width: `${Math.round(paceProgress01 * 100)}%` }}
                        />
                      </div>

                      <div className="text-xs text-hudDim">
                        {pace.delta < 0 ? (
                          <>
                          Нужно сделать ещё{" "}
                          <span className="text-hudRed hud-glow">{Math.abs(pace.delta)}</span>
                          </>
                          ) : pace.delta > 0 ? (
                          <>
                          Перебор <span className="text-hudText">+{pace.delta}</span>
                          </>
                          ) : (
                          <>Ровно по плану</>
                          )}
                        </div>
                      </div>
                    </div>

            {/* Рекомендации (5 подзадач) */}
            <HudPanel title="RECOMMENDED SUBTASKS">
              <div className="space-y-2">
                {recs.map((r) => (
                  <div
                    key={r.taskId}
                    className="border border-hudLine bg-black/20 p-3 hover:bg-black/30 shadow-hud"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1"
                        style={{ accentColor: "#FF3C3C" }}
                        onChange={() => complete(tasks, r.taskId)}
                      />
                      <button
                        className="text-left w-full"
                        onClick={() => router.push(`/task/${encodeURIComponent(r.taskId)}`)}
                      >
                        <div className="font-semibold">{r.taskTitle}</div>
                        <div className="text-sm text-hudDim">{r.subtaskText}</div>
                        <div className="text-[11px] text-hudDim mt-1">
                          Направление {r.directionId} • Задание {r.taskNumber}
                        </div>
                      </button>
                    </div>
                  </div>
                ))}

                {recs.length === 0 && (
                  <div className="text-sm text-hudDim">
                    Пока нечего рекомендовать (возможно всё закрыто).
                  </div>
                )}
              </div>
            </HudPanel>
          </div>
        </div>
      </div>
    </HudShell>
  );
}
