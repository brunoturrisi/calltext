import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "..", "calltext.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

export function query<T = Record<string, unknown>>(sql: string, params?: any[]): T[] {
  try {
    const stmt = db.prepare(sql);
    if (params) return stmt.all(...params) as T[];
    return stmt.all() as T[];
  } catch (e) {
    console.error("DB error:", e);
    return [];
  }
}

export function run(sql: string, params?: any[]) {
  const stmt = db.prepare(sql);
  if (params) return stmt.run(...params);
  return stmt.run();
}

// Crea le tabelle all'avvio
run(`CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  access_code TEXT DEFAULT '1234', is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);
run(`CREATE TABLE IF NOT EXISTS call_logs (
  id TEXT PRIMARY KEY, caller_number TEXT NOT NULL, call_sid TEXT,
  status TEXT NOT NULL DEFAULT 'missed', business_slug TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);
run(`CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY, business_slug TEXT NOT NULL, caller_name TEXT,
  caller_number TEXT, status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);
run(`CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY, session_id TEXT NOT NULL, role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);
run(`CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY, business_slug TEXT NOT NULL, name TEXT,
  phone TEXT, interest TEXT, notes TEXT, status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
)`);

// Dati demo
const existing = query("SELECT id FROM businesses WHERE slug = 'bar-centrale'");
if (existing.length === 0) {
  run("INSERT INTO businesses (id, slug, name, access_code) VALUES (?, ?, ?, ?)", 
    [randomId(), 'bar-centrale', 'Bar Centrale', '1234']);
  run("INSERT INTO leads (id, business_slug, name, interest, status) VALUES (?, ?, ?, ?, ?)",
    [randomId(), 'bar-centrale', 'Mario Rossi', 'Vorrei prenotare un tavolo per 4', 'new']);
  run("INSERT INTO leads (id, business_slug, name, interest, status) VALUES (?, ?, ?, ?, ?)",
    [randomId(), 'bar-centrale', 'Anna Bianchi', 'Quanto costa un aperitivo?', 'new']);
}

function randomId() { return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }); }
