import { Hono } from 'hono';
import { db } from '../db';

export const statusesRoutes = new Hono();

// Get all statuses for a project
statusesRoutes.get('/', async (c) => {
  try {
    const projectId = c.req.query('project_id');
    
    let query = 'SELECT * FROM statuses';
    const params: any[] = [];
    
    if (projectId) {
      query += ' WHERE project_id = $1';
      params.push(projectId);
    }
    
    query += ' ORDER BY position';
    
    const result = await db.query(query, params);
    return c.json(result.rows);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get status by ID
statusesRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await db.query('SELECT * FROM statuses WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return c.json({ error: 'Status not found' }, 404);
    }
    return c.json(result.rows[0]);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create status
statusesRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, color, project_id } = body;
    
    // Get max position
    const posResult = await db.query(
      'SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM statuses WHERE project_id = $1',
      [project_id]
    );
    const position = posResult.rows[0].next_pos;
    
    const result = await db.query(
      `INSERT INTO statuses (name, color, position, project_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, color || '#3b82f6', position, project_id]
    );
    
    return c.json(result.rows[0], 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update status
statusesRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { name, color } = body;
    
    const result = await db.query(
      `UPDATE statuses SET name = $1, color = $2 WHERE id = $3 RETURNING *`,
      [name, color, id]
    );
    
    if (result.rows.length === 0) {
      return c.json({ error: 'Status not found' }, 404);
    }
    return c.json(result.rows[0]);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Reorder statuses
statusesRoutes.patch('/reorder', async (c) => {
  try {
    const body = await c.req.json();
    const { statuses } = body; // Array of { id, position }
    
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      for (const status of statuses) {
        await client.query(
          'UPDATE statuses SET position = $1 WHERE id = $2',
          [status.position, status.id]
        );
      }
      
      await client.query('COMMIT');
      return c.json({ message: 'Statuses reordered successfully' });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete status
statusesRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await db.query('DELETE FROM statuses WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return c.json({ error: 'Status not found' }, 404);
    }
    return c.json({ message: 'Status deleted successfully' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

