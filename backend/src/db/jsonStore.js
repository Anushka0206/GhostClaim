// src/db/jsonStore.js
//
// GhostClaim Shield uses a tiny file-backed JSON store instead of a real
// database. This keeps the prototype dependency-free (no native builds,
// no external DB server) so it runs anywhere with just `npm install`.
//
// Swapping this for PostgreSQL later is a contained change: every table
// is read/written through the same get/set/all interface below, so only
// this file needs to change, not the routes or services that use it.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "data");

function filePathFor(table) {
  return path.join(DATA_DIR, `${table}.json`);
}

function ensureFile(table) {
  const file = filePathFor(table);
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "[]", "utf-8");
  }
}

export function readTable(table) {
  ensureFile(table);
  const raw = fs.readFileSync(filePathFor(table), "utf-8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function writeTable(table, rows) {
  ensureFile(table);
  fs.writeFileSync(filePathFor(table), JSON.stringify(rows, null, 2), "utf-8");
}

export function insertRow(table, row) {
  const rows = readTable(table);
  rows.push(row);
  writeTable(table, rows);
  return row;
}

export function updateRow(table, id, patch) {
  const rows = readTable(table);
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  rows[idx] = { ...rows[idx], ...patch };
  writeTable(table, rows);
  return rows[idx];
}

export function findById(table, id) {
  const rows = readTable(table);
  return rows.find((r) => r.id === id) || null;
}

export function resetTable(table) {
  writeTable(table, []);
}
