import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgres://kanban:kanban123@localhost:5432/kanban';

export const pool = new Pool({
  connectionString,
});

export const db = {
  query: async (text: string, params?: any[]) => {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    return res;
  },
  
  getClient: () => pool.connect(),
};

// Test connection
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection error:', err.message));

