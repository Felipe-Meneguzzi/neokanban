import { Hono } from 'hono';
import { db } from '../db';

export const prioritiesRoutes = new Hono();

// Get all priorities for a project
prioritiesRoutes.get('/', async (c) => {
  try {
    const projectId = c.req.query('project_id');
    
    let query = 'SELECT * FROM priorities';
    const params: any[] = [];
    
    if (projectId) {
      query += ' WHERE project_id = $1';
      params.push(projectId);
    }
    
    query += ' ORDER BY level';
    
    const result = await db.query(query, params);
    return c.json(result.rows);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get priority by ID
prioritiesRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await db.query('SELECT * FROM priorities WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return c.json({ error: 'Priority not found' }, 404);
    }
    return c.json(result.rows[0]);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create priority
prioritiesRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, color, level, project_id } = body;
    
    const result = await db.query(
      `INSERT INTO priorities (name, color, level, project_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, color || '#f59e0b', level, project_id]
    );
    
    return c.json(result.rows[0], 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update priority
prioritiesRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { name, color, level } = body;
    
    const result = await db.query(
      `UPDATE priorities SET name = $1, color = $2, level = $3 WHERE id = $4 RETURNING *`,
      [name, color, level, id]
    );
    
    if (result.rows.length === 0) {
      return c.json({ error: 'Priority not found' }, 404);
    }
    return c.json(result.rows[0]);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete priority
prioritiesRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await db.query('DELETE FROM priorities WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return c.json({ error: 'Priority not found' }, 404);
    }
    return c.json({ message: 'Priority deleted successfully' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

