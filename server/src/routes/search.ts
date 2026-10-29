import { Router } from 'express';
import { db } from '../db/schema.js';

const router = Router();

router.get('/', (req, res) => {
  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.json([]);
  }
  
  const queryLower = q.toLowerCase();
  const stmt = db.prepare(`
    SELECT * FROM items 
    WHERE is_archived = 0 
    AND (LOWER(search_text) LIKE ? OR LOWER(title) LIKE ? OR LOWER(content) LIKE ? OR LOWER(original_text) LIKE ?)
    ORDER BY created_at DESC
    LIMIT 50
  `);
  stmt.bind([`%${queryLower}%`, `%${queryLower}%`, `%${queryLower}%`, `%${queryLower}%`]);
  
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

export default router;
