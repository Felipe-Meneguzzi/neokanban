import { Hono } from 'hono';
import { db } from '../db';

export const tasksRoutes = new Hono();

// Get all tasks for a project
tasksRoutes.get('/', async (c) => {
  try {
    const projectId = c.req.query('project_id');
    
    let query = `
      SELECT t.*, 
             s.name as status_name, s.color as status_color,
             p.name as priority_name, p.color as priority_color, p.level as priority_level,
             u.name as assignee_name, u.avatar as assignee_avatar,
             c.name as creator_name,
             COALESCE(
               json_agg(
                 json_build_object('id', l.id, 'name', l.name, 'color', l.color)
               ) FILTER (WHERE l.id IS NOT NULL), 
               '[]'
             ) as labels
      FROM tasks t
      LEFT JOIN statuses s ON t.status_id = s.id
      LEFT JOIN priorities p ON t.priority_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN users c ON t.creator_id = c.id
      LEFT JOIN task_labels tl ON t.id = tl.task_id
      LEFT JOIN labels l ON tl.label_id = l.id
    `;
    
    const params: any[] = [];
    
    if (projectId) {
      query += ' WHERE t.project_id = $1';
      params.push(projectId);
    }
    
    query += ' GROUP BY t.id, s.name, s.color, p.name, p.color, p.level, u.name, u.avatar, c.name';
    query += ' ORDER BY t.status_id, t.position';
    
    const result = await db.query(query, params);
    return c.json(result.rows);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get task by ID
tasksRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const result = await db.query(`
      SELECT t.*, 
             s.name as status_name, s.color as status_color,
             p.name as priority_name, p.color as priority_color,
             u.name as assignee_name, u.email as assignee_email, u.avatar as assignee_avatar,
             c.name as creator_name,
             COALESCE(
               json_agg(
                 json_build_object('id', l.id, 'name', l.name, 'color', l.color)
               ) FILTER (WHERE l.id IS NOT NULL), 
               '[]'
             ) as labels
      FROM tasks t
      LEFT JOIN statuses s ON t.status_id = s.id
      LEFT JOIN priorities p ON t.priority_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      LEFT JOIN users c ON t.creator_id = c.id
      LEFT JOIN task_labels tl ON t.id = tl.task_id
      LEFT JOIN labels l ON tl.label_id = l.id
      WHERE t.id = $1
      GROUP BY t.id, s.name, s.color, p.name, p.color, u.name, u.email, u.avatar, c.name
    `, [id]);
    
    if (result.rows.length === 0) {
      return c.json({ error: 'Task not found' }, 404);
    }
    
    return c.json(result.rows[0]);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create task
tasksRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, status_id, priority_id, project_id, assignee_id, creator_id, deadline, labels } = body;
    
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get max position for the status
      const posResult = await client.query(
        'SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM tasks WHERE status_id = $1',
        [status_id]
      );
      const position = posResult.rows[0].next_pos;
      
      // Create task
      const taskResult = await client.query(
        `INSERT INTO tasks (title, description, status_id, priority_id, project_id, assignee_id, creator_id, deadline, position) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [title, description, status_id, priority_id, project_id, assignee_id, creator_id, deadline, position]
      );
      
      const task = taskResult.rows[0];
      
      // Add labels if provided
      if (labels && labels.length > 0) {
        for (const labelId of labels) {
          await client.query(
            'INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2)',
            [task.id, labelId]
          );
        }
      }
      
      await client.query('COMMIT');
      return c.json(task, 201);
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

// Update task
tasksRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { title, description, status_id, priority_id, assignee_id, deadline, labels } = body;
    
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        `UPDATE tasks 
         SET title = COALESCE($1, title), 
             description = COALESCE($2, description), 
             status_id = COALESCE($3, status_id), 
             priority_id = COALESCE($4, priority_id), 
             assignee_id = $5, 
             deadline = $6,
             updated_at = NOW() 
         WHERE id = $7 
         RETURNING *`,
        [title, description, status_id, priority_id, assignee_id, deadline, id]
      );
      
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return c.json({ error: 'Task not found' }, 404);
      }
      
      // Update labels if provided
      if (labels !== undefined) {
        await client.query('DELETE FROM task_labels WHERE task_id = $1', [id]);
        for (const labelId of labels) {
          await client.query(
            'INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2)',
            [id, labelId]
          );
        }
      }
      
      await client.query('COMMIT');
      return c.json(result.rows[0]);
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

// Move task (update status and/or position)
tasksRoutes.patch('/:id/move', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { status_id, position } = body;
    
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Get current task
      const currentTask = await client.query('SELECT * FROM tasks WHERE id = $1', [id]);
      if (currentTask.rows.length === 0) {
        await client.query('ROLLBACK');
        return c.json({ error: 'Task not found' }, 404);
      }
      
      const task = currentTask.rows[0];
      const oldStatusId = task.status_id;
      const oldPosition = task.position;
      const newStatusId = status_id ?? oldStatusId;
      const newPosition = position ?? oldPosition;
      
      if (oldStatusId === newStatusId) {
        // Same column - reorder
        if (newPosition > oldPosition) {
          await client.query(
            `UPDATE tasks SET position = position - 1 
             WHERE status_id = $1 AND position > $2 AND position <= $3`,
            [newStatusId, oldPosition, newPosition]
          );
        } else if (newPosition < oldPosition) {
          await client.query(
            `UPDATE tasks SET position = position + 1 
             WHERE status_id = $1 AND position >= $2 AND position < $3`,
            [newStatusId, newPosition, oldPosition]
          );
        }
      } else {
        // Different column
        // Decrement positions in old column
        await client.query(
          `UPDATE tasks SET position = position - 1 
           WHERE status_id = $1 AND position > $2`,
          [oldStatusId, oldPosition]
        );
        
        // Increment positions in new column
        await client.query(
          `UPDATE tasks SET position = position + 1 
           WHERE status_id = $1 AND position >= $2`,
          [newStatusId, newPosition]
        );
      }
      
      // Update the task
      const result = await client.query(
        `UPDATE tasks SET status_id = $1, position = $2, updated_at = NOW() 
         WHERE id = $3 
         RETURNING *`,
        [newStatusId, newPosition, id]
      );
      
      await client.query('COMMIT');
      return c.json(result.rows[0]);
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

// Delete task
tasksRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return c.json({ error: 'Task not found' }, 404);
    }
    return c.json({ message: 'Task deleted successfully' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

