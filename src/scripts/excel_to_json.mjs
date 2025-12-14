import fs from "node:fs";
import path from "node:path";
import xlsx from "xlsx";

/**
 * Usage:
 *   node scripts/excel_to_json.mjs ./input.xlsx ./public/tasks.json
 */
const [,, inputXlsx, outputJson] = process.argv;
if (!inputXlsx || !outputJson) {
  console.error("Usage: node scripts/excel_to_json.mjs <input.xlsx> <output.json>");
  process.exit(1);
}

const wb = xlsx.readFile(inputXlsx);
const sheetName = wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

// ⚠️ Подстрой под ТОЧНЫЕ названия колонок в Excel
const COL = {
  direction: "Направление",
  taskNumber: "Номер задания",
  subtaskNumber: "номер подзадачи",
  taskTitle: "Описание задачи",
  subtaskText: "описание подзадачи",
};

const asInt = (v) => {
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : 0;
};

const byTask = new Map(); // key: `${dir}-${taskNo}`

for (const r of rows) {
  const directionId = asInt(r[COL.direction]);
  const taskNumber = asInt(r[COL.taskNumber]);
  const subtaskNumber = asInt(r[COL.subtaskNumber]);
  const taskTitle = String(r[COL.taskTitle] || "").trim();
  const subtaskText = String(r[COL.subtaskText] || "").trim();

  if (!directionId || !taskNumber || !subtaskNumber) continue;

  const id = `${directionId}-${taskNumber}`;
  if (!byTask.has(id)) {
    byTask.set(id, {
      id,
      directionId,
      taskNumber,
      title: taskTitle || `Задача ${taskNumber}`,
      subtasks: [],
    });
  }
  byTask.get(id).subtasks.push({
    n: subtaskNumber,
    text: subtaskText || `Подзадача ${subtaskNumber}`,
  });
}

const tasks = Array.from(byTask.values())
  .map(t => ({
    ...t,
    subtasks: t.subtasks
      .sort((a,b) => a.n - b.n)
      .map((s, idx) => ({ id: `${t.id}:${idx+1}`, text: s.text })),
  }))
  .sort((a,b) => (a.directionId - b.directionId) || (a.taskNumber - b.taskNumber));

fs.mkdirSync(path.dirname(outputJson), { recursive: true });
fs.writeFileSync(outputJson, JSON.stringify({ tasks }, null, 2), "utf-8");
console.log(`OK: wrote ${tasks.length} tasks to ${outputJson}`);
