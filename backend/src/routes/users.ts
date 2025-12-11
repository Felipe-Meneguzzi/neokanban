import { Hono } from 'hono';
import { db } from '../db';

export const usersRoutes = new Hono();

// Get all users
usersRoutes.get('/', async (c) => {
  try {
    const result = await db.query(
      'SELECT id, name, email, avatar, created_at FROM users ORDER BY name'
    );
    return c.json(result.rows);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get user by ID
usersRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await db.query(
      'SELECT id, name, email, avatar, created_at FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    return c.json(result.rows[0]);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create user
usersRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password, avatar } = body;
    
    const result = await db.query(
      `INSERT INTO users (name, email, password, avatar) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, email, avatar, created_at`,
      [name, email, password, avatar]
    );
    return c.json(result.rows[0], 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Update user
usersRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { name, email, avatar } = body;
    
    const result = await db.query(
      `UPDATE users SET name = $1, email = $2, avatar = $3, updated_at = NOW() 
       WHERE id = $4 
       RETURNING id, name, email, avatar, created_at, updated_at`,
      [name, email, avatar, id]
    );
    if (result.rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    return c.json(result.rows[0]);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete user
usersRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    return c.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get user's projects
usersRoutes.get('/:id/projects', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await db.query(
      `SELECT p.*, pm.role 
       FROM projects p 
       JOIN project_members pm ON p.id = pm.project_id 
       WHERE pm.user_id = $1 
       ORDER BY p.created_at DESC`,
      [id]
    );
    return c.json(result.rows);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

