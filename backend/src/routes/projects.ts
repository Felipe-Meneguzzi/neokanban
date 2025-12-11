import { Hono } from 'hono';
import { db } from '../db';

export const projectsRoutes = new Hono();

// Get all projects
projectsRoutes.get('/', async (c) => {
  try {
    const result = await db.query(
      `SELECT p.*, u.name as owner_name, 
              (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count
       FROM projects p 
       LEFT JOIN users u ON p.owner_id = u.id 
       ORDER BY p.created_at DESC`
    );
    return c.json(result.rows);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Get project by ID with full details
projectsRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Get project
    const projectResult = await db.query(
      `SELECT p.*, u.name as owner_name 
       FROM projects p 
       LEFT JOIN users u ON p.owner_id = u.id 
       WHERE p.id = $1`,
      [id]
    );
    
    if (projectResult.rows.length === 0) {
      return c.json({ error: 'Project not found' }, 404);
    }
    
    const project = projectResult.rows[0];
    
    // Get members
    const membersResult = await db.query(
      `SELECT u.id, u.name, u.email, u.avatar, pm.role 
       FROM users u 
       JOIN project_members pm ON u.id = pm.user_id 
       WHERE pm.project_id = $1`,
      [id]
    );
    
    // Get statuses
    const statusesResult = await db.query(
      'SELECT * FROM statuses WHERE project_id = $1 ORDER BY position',
      [id]
    );
    
    // Get labels
    const labelsResult = await db.query(
      'SELECT * FROM labels WHERE project_id = $1 ORDER BY name',
      [id]
    );
    
    // Get priorities
    const prioritiesResult = await db.query(
      'SELECT * FROM priorities WHERE project_id = $1 ORDER BY level',
      [id]
    );
    
    return c.json({
      ...project,
      members: membersResult.rows,
      statuses: statusesResult.rows,
      labels: labelsResult.rows,
      priorities: prioritiesResult.rows,
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Create project
projectsRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, description, color, owner_id } = body;
    
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Create project
      const projectResult = await client.query(
        `INSERT INTO projects (name, description, color, owner_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [name, description, color || '#6366f1', owner_id]
      );
      
      const project = projectResult.rows[0];
      
      // Add owner as member
      await client.query(
        `INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, 'owner')`,
        [project.id, owner_id]
      );
      
      // Create default statuses
      const defaultStatuses = [
        { name: 'Backlog', color: '#64748b', position: 0 },
        { name: 'A Fazer', color: '#3b82f6', position: 1 },
        { name: 'Em Andamento', color: '#f59e0b', position: 2 },
        { name: 'Concluído', color: '#10b981', position: 3 },
      ];
      
      for (const status of defaultStatuses) {
        await client.query(
          `INSERT INTO statuses (name, color, position, project_id) VALUES ($1, $2, $3, $4)`,
          [status.name, status.color, status.position, project.id]
        );
      }
      
      // Create default priorities
      const defaultPriorities = [
        { name: 'Baixa', color: '#64748b', level: 1 },
        { name: 'Média', color: '#f59e0b', level: 2 },
        { name: 'Alta', color: '#ef4444', level: 3 },
      ];
      
      for (const priority of defaultPriorities) {
        await client.query(
          `INSERT INTO priorities (name, color, level, project_id) VALUES ($1, $2, $3, $4)`,
          [priority.name, priority.color, priority.level, project.id]
        );
      }
      
      await client.query('COMMIT');
      return c.json(project, 201);
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

// Update project
projectsRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { name, description, color } = body;
    
    const result = await db.query(
      `UPDATE projects SET name = $1, description = $2, color = $3, updated_at = NOW() 
       WHERE id = $4 
       RETURNING *`,
      [name, description, color, id]
    );
    
    if (result.rows.length === 0) {
      return c.json({ error: 'Project not found' }, 404);
    }
    return c.json(result.rows[0]);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Delete project
projectsRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await db.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return c.json({ error: 'Project not found' }, 404);
    }
    return c.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Add member to project
projectsRoutes.post('/:id/members', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { user_id, role } = body;
    
    await db.query(
      `INSERT INTO project_members (project_id, user_id, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (project_id, user_id) DO UPDATE SET role = $3`,
      [id, user_id, role || 'member']
    );
    
    return c.json({ message: 'Member added successfully' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Remove member from project
projectsRoutes.delete('/:id/members/:userId', async (c) => {
  try {
    const id = c.req.param('id');
    const userId = c.req.param('userId');
    
    await db.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, userId]
    );
    
    return c.json({ message: 'Member removed successfully' });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

