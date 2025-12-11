import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { db } from './db';
import { usersRoutes } from './routes/users';
import { projectsRoutes } from './routes/projects';
import { tasksRoutes } from './routes/tasks';
import { statusesRoutes } from './routes/statuses';
import { labelsRoutes } from './routes/labels';
import { prioritiesRoutes } from './routes/priorities';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', logger());

// Health check
app.get('/', (c) => c.json({ message: 'Kanban API is running!', version: '1.0.0' }));
app.get('/health', (c) => c.json({ status: 'ok' }));

// API Routes
app.route('/api/users', usersRoutes);
app.route('/api/projects', projectsRoutes);
app.route('/api/tasks', tasksRoutes);
app.route('/api/statuses', statusesRoutes);
app.route('/api/labels', labelsRoutes);
app.route('/api/priorities', prioritiesRoutes);

const port = process.env.PORT || 3000;

console.log(`🚀 Kanban API running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};

