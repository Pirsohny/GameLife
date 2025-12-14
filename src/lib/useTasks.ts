"use client";

import { useEffect, useState } from "react";
import type { TasksData, Task } from "./game";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/tasks.json")
      .then(r => r.json() as Promise<TasksData>)
      .then(data => setTasks(data.tasks))
      .catch(e => setError(String(e)));
  }, []);

  return { tasks, error };
}
