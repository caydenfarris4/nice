import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "data");
mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(join(DATA_DIR, "nice.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sources_project ON sources(project_id);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  brief TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id);

CREATE TABLE IF NOT EXISTS analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  lens TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_analyses_project_lens ON analyses(project_id, lens);
`);

export type Project = {
  id: number;
  name: string;
  description: string;
  created_at: string;
};

export type Source = {
  id: number;
  project_id: number;
  filename: string;
  mime_type: string;
  size: number;
  content: string;
  created_at: string;
};

export type Message = {
  id: number;
  project_id: number;
  role: "user" | "assistant";
  content: string;
  brief: string | null;
  created_at: string;
};

export type Analysis = {
  id: number;
  project_id: number;
  lens: string;
  payload: string;
  created_at: string;
};

export const queries = {
  listProjects: db.prepare("SELECT * FROM projects ORDER BY created_at DESC"),
  getProject: db.prepare("SELECT * FROM projects WHERE id = ?"),
  createProject: db.prepare("INSERT INTO projects (name, description) VALUES (?, ?)"),
  deleteProject: db.prepare("DELETE FROM projects WHERE id = ?"),

  listSources: db.prepare(
    "SELECT id, project_id, filename, mime_type, size, '' as content, created_at FROM sources WHERE project_id = ? ORDER BY created_at DESC"
  ),
  getSourcesFull: db.prepare(
    "SELECT * FROM sources WHERE project_id = ? ORDER BY created_at ASC"
  ),
  insertSource: db.prepare(
    "INSERT INTO sources (project_id, filename, mime_type, size, content) VALUES (?, ?, ?, ?, ?)"
  ),
  deleteSource: db.prepare("DELETE FROM sources WHERE id = ? AND project_id = ?"),

  listMessages: db.prepare(
    "SELECT * FROM messages WHERE project_id = ? ORDER BY created_at ASC"
  ),
  insertMessage: db.prepare(
    "INSERT INTO messages (project_id, role, content, brief) VALUES (?, ?, ?, ?)"
  ),

  getAnalysis: db.prepare(
    "SELECT * FROM analyses WHERE project_id = ? AND lens = ? ORDER BY created_at DESC LIMIT 1"
  ),
  insertAnalysis: db.prepare(
    "INSERT INTO analyses (project_id, lens, payload) VALUES (?, ?, ?)"
  ),
};

export default db;
