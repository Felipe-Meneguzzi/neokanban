import { Hono } from 'hono';
import { db } from '../db';

export const labelsRoutes = new Hono();

// Get all labels for a project
labelsRoutes.get('/', async (c) => {
  try {
    const projectId = c.req.query('project_id');
    
    let query = 'SELECT * FROM labels';
    const params: any[] = [];
    
    if (projectId) {
      query += ' WHERE project_id = $1';
      params.push(projectId);
    }
    
    query += ' ORDER BY name';
    
    const result = await db.query(query, params);
    return c.json(result.rows);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get label by ID
labelsRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await db.query('SELECT * FROM labels WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return c.json({ error: 'Label not found' }, 404);
    }
    return c.json(result.rows[0]);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create label
labelsRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, color, project_id } = body;
    
    const result = await db.query(
      `INSERT INTO labels (name, color, project_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, color || '#10b981', project_id]
    );
    
    return c.json(result.rows[0], 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update label
labelsRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { name, color } = body;
    
    const result = await db.query(
      `UPDATE labels SET name = $1, color = $2 WHERE id = $3 RETURNING *`,
      [name, color, id]
    );
    
    if (result.rows.length === 0) {
      return c.json({ error: 'Label not found' }, 404);
    }
    return c.json(result.rows[0]);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete label
labelsRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await db.query('DELETE FROM labels WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return c.json({ error: 'Label not found' }, 404);
    }
    return c.json({ message: 'Label deleted successfully' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

