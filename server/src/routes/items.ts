import { Router } from 'express';
import { db, saveDb } from '../db/schema.js';
import { nanoid } from 'nanoid';

const router = Router();

router.get('/', (req, res) => {
  const { type, archived } = req.query;
  let sql = 'SELECT * FROM items WHERE 1=1';
  const params: any[] = [];
  
  if (archived === 'true') {
    sql += ' AND is_archived = 1';
  } else {
    sql += ' AND is_archived = 0';
  }
  
  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  const stmt = db.prepare(sql);
  if (params.length) {
    stmt.bind(params);
  }
  
  const items: any[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    items.push({
      ...row,
      tags: JSON.parse(row.tags || '[]'),
      categories: JSON.parse(row.categories || '[]'),
      metadata: JSON.parse(row.metadata || '{}'),
      is_archived: Boolean(row.is_archived)
    });
  }
  stmt.free();
  
  res.json(items);
});

router.post('/', (req, res) => {
  const id = nanoid();
  const {
    type, title, content, start_date, end_date, start_time, end_time,
    location, status, priority = 'medium', tags = [], categories = [],
    metadata = {}, original_text, source = 'web'
  } = req.body;
  
  const searchParts = [title || '', content || '', original_text || '', ...(tags || [])];
  const search_text = searchParts.filter(Boolean).join(' ').toLowerCase();
  
  db.run(`
    INSERT INTO items (id, type, title, content, start_date, end_date, start_time, end_time,
    location, status, priority, tags, categories, metadata, original_text, source, search_text)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, type, title, content, start_date, end_date, start_time, end_time,
    location, status, priority, JSON.stringify(tags), JSON.stringify(categories),
    JSON.stringify(metadata), original_text, source, search_text
  ]);
  saveDb();
  
  const stmt = db.prepare('SELECT * FROM items WHERE id = ?');
  stmt.bind([id]);
  stmt.step();
  const item: any = stmt.getAsObject();
  stmt.free();
  
  res.json({
    ...item,
    tags: JSON.parse(item.tags || '[]'),
    categories: JSON.parse(item.categories || '[]'),
    metadata: JSON.parse(item.metadata || '{}'),
    is_archived: Boolean(item.is_archived)
  });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const fields: string[] = [];
  const values: any[] = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (key === 'tags' || key === 'categories' || key === 'metadata') {
      fields.push(`${key} = ?`);
      values.push(JSON.stringify(value));
    } else if (key === 'is_archived') {
      fields.push(`${key} = ?`);
      values.push(value ? 1 : 0);
    } else if (key === 'status' && value === 'done') {
      fields.push('completed_at = ?');
      values.push(new Date().toISOString());
      fields.push(`${key} = ?`);
      values.push(value);
    } else {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No updates' });
  }
  
  fields.push("updated_at = datetime('now')");
  values.push(id);
  
  db.run(`UPDATE items SET ${fields.join(', ')} WHERE id = ?`, values);
  saveDb();
  
  const stmt = db.prepare('SELECT * FROM items WHERE id = ?');
  stmt.bind([id]);
  stmt.step();
  const item: any = stmt.getAsObject();
  stmt.free();
  
  res.json({
    ...item,
    tags: JSON.parse(item.tags || '[]'),
    categories: JSON.parse(item.categories || '[]'),
    metadata: JSON.parse(item.metadata || '{}'),
    is_archived: Boolean(item.is_archived)
  });
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM items WHERE id = ?', [id]);
  saveDb();
  res.json({ message: 'Deleted' });
});

export default router;
