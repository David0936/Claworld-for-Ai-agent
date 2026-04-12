/**
 * Activities Database — JSON-based storage
 * No native modules required. Pure Node.js fs.
 */
import fs from "fs";
import path from "path";
import os from "os";

const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(os.homedir(), ".openclaw");
const WORKSPACE_DIR = path.join(OPENCLAW_DIR, "workspace");
const DB_DIR = path.join(WORKSPACE_DIR, ".claworld");
const DB_PATH = path.join(DB_DIR, "activities.json");

export interface Activity {
  id?: number;
  type: string;
  description: string;
  metadata?: string;
  timestamp?: string;
}

interface ActivityStore {
  nextId: number;
  activities: Activity[];
}

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function loadStore(): ActivityStore {
  ensureDir();
  if (!fs.existsSync(DB_PATH)) {
    return { nextId: 1, activities: [] };
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { nextId: 1, activities: [] };
  }
}

function saveStore(store: ActivityStore) {
  ensureDir();
  // Keep only last 30 days + last 5000 activities
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffStr = cutoff.toISOString();

  const filtered = store.activities.filter(
    (a) => a.timestamp && a.timestamp >= cutoffStr
  );
  const trimmed = filtered.slice(-5000);

  fs.writeFileSync(DB_PATH, JSON.stringify({ nextId: store.nextId, activities: trimmed }, null, 2));
}

export function insertActivity(activity: Omit<Activity, "id">): number {
  const store = loadStore();
  const id = store.nextId++;
  store.activities.push({
    ...activity,
    id,
    timestamp: activity.timestamp || new Date().toISOString(),
  });
  saveStore(store);
  return id;
}

export interface ListActivitiesOptions {
  limit?: number;
  offset?: number;
  type?: string;
  search?: string;
  days?: number;
}

export function listActivities(options: ListActivitiesOptions = {}): {
  activities: Activity[];
  total: number;
} {
  const { limit = 50, offset = 0, type, search, days = 7 } = options;
  const store = loadStore();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString();

  let filtered = store.activities.filter((a) => {
    if (a.timestamp && a.timestamp < cutoffStr) return false;
    if (type && a.type !== type) return false;
    if (search && !a.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Sort by timestamp descending
  filtered.sort((a, b) => {
    const ta = a.timestamp || "";
    const tb = b.timestamp || "";
    return tb.localeCompare(ta);
  });

  const total = filtered.length;
  const paginated = filtered.slice(offset, offset + limit);

  return { activities: paginated, total };
}

export function getActivityStats(days = 30): Record<string, unknown> {
  const store = loadStore();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString();

  const filtered = store.activities.filter((a) => a.timestamp && a.timestamp >= cutoffStr);

  // Count by type
  const typeMap: Record<string, number> = {};
  for (const a of filtered) {
    typeMap[a.type] = (typeMap[a.type] || 0) + 1;
  }
  const byType = Object.entries(typeMap)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Count by day
  const dayMap: Record<string, number> = {};
  for (const a of filtered) {
    if (a.timestamp) {
      const day = a.timestamp.substring(0, 10);
      dayMap[day] = (dayMap[day] || 0) + 1;
    }
  }
  const byDay = Object.entries(dayMap)
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return { byType, byDay, total: filtered.length, days };
}
