import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/agenda.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const SQL = await initSqlJs();
let db: any;

if (fs.existsSync(dbPath)) {
  const fileBuffer = fs.readFileSync(dbPath);
  db = new SQL.Database(fileBuffer);
} else {
  db = new SQL.Database();
}

db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('activity', 'appointment', 'idea', 'note', 'todo_organize')),
    title TEXT NOT NULL,
    content TEXT,
    start_date TEXT,
    end_date TEXT,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    status TEXT CHECK(status IN ('todo', 'in_progress', 'done', 'new', 'to_evaluate', 'in_development', 'archived')),
    priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    tags TEXT DEFAULT '[]',
    categories TEXT DEFAULT '[]',
    metadata TEXT DEFAULT '{}',
    original_text TEXT,
    source TEXT DEFAULT 'web',
    search_text TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    is_archived INTEGER DEFAULT 0
  );
`);

export function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

export { db };
