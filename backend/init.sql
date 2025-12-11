-- Kanban Project Manager Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1',
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom Labels/Tags (scopes like backend, frontend, infra)
CREATE TABLE IF NOT EXISTS labels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#10b981',
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Status/Columns (backlog, em andamento, aguardando, etc)
CREATE TABLE IF NOT EXISTS statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3b82f6',
    position INTEGER DEFAULT 0,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Priority Levels
CREATE TABLE IF NOT EXISTS priorities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#f59e0b',
    level INTEGER DEFAULT 0,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status_id INTEGER REFERENCES statuses(id) ON DELETE SET NULL,
    priority_id INTEGER REFERENCES priorities(id) ON DELETE SET NULL,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    deadline TIMESTAMP,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task Labels (many-to-many relationship)
CREATE TABLE IF NOT EXISTS task_labels (
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    label_id INTEGER REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, label_id)
);

-- Project Members (many-to-many relationship)
CREATE TABLE IF NOT EXISTS project_members (
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    PRIMARY KEY (project_id, user_id)
);

-- Insert default user
INSERT INTO users (name, email, password) VALUES 
    ('Admin', 'admin@kanban.local', '$2b$10$rOzJqQZQZQZQZQZQZQZQZuYvYvYvYvYvYvYvYvYvYvYvYvYvYvYvY'),
    ('João Silva', 'joao@kanban.local', '$2b$10$rOzJqQZQZQZQZQZQZQZQZuYvYvYvYvYvYvYvYvYvYvYvYvYvYvYvY'),
    ('Maria Santos', 'maria@kanban.local', '$2b$10$rOzJqQZQZQZQZQZQZQZQZuYvYvYvYvYvYvYvYvYvYvYvYvYvYvYvY');

-- Insert demo project
INSERT INTO projects (name, description, color, owner_id) VALUES 
    ('Projeto Demo', 'Um projeto de demonstração do Kanban', '#6366f1', 1);

-- Insert default statuses
INSERT INTO statuses (name, color, position, project_id) VALUES 
    ('Backlog', '#64748b', 0, 1),
    ('A Fazer', '#3b82f6', 1, 1),
    ('Em Andamento', '#f59e0b', 2, 1),
    ('Em Revisão', '#8b5cf6', 3, 1),
    ('Aguardando', '#ec4899', 4, 1),
    ('Concluído', '#10b981', 5, 1);

-- Insert default labels (scopes)
INSERT INTO labels (name, color, project_id) VALUES 
    ('Backend', '#ef4444', 1),
    ('Frontend', '#3b82f6', 1),
    ('Infraestrutura', '#8b5cf6', 1),
    ('DevOps', '#f97316', 1),
    ('Database', '#06b6d4', 1),
    ('UI/UX', '#ec4899', 1),
    ('Documentação', '#84cc16', 1),
    ('Bug', '#dc2626', 1),
    ('Feature', '#22c55e', 1);

-- Insert default priorities
INSERT INTO priorities (name, color, level, project_id) VALUES 
    ('Baixa', '#64748b', 1, 1),
    ('Média', '#f59e0b', 2, 1),
    ('Alta', '#f97316', 3, 1),
    ('Urgente', '#ef4444', 4, 1),
    ('Crítica', '#dc2626', 5, 1);

-- Add project members
INSERT INTO project_members (project_id, user_id, role) VALUES 
    (1, 1, 'owner'),
    (1, 2, 'member'),
    (1, 3, 'member');

-- Insert demo tasks
INSERT INTO tasks (title, description, status_id, priority_id, project_id, assignee_id, creator_id, deadline, position) VALUES 
    ('Configurar ambiente de desenvolvimento', 'Instalar e configurar todas as dependências do projeto', 6, 3, 1, 1, 1, NOW() + INTERVAL '7 days', 0),
    ('Criar API de autenticação', 'Implementar endpoints de login, registro e logout', 3, 4, 1, 2, 1, NOW() + INTERVAL '3 days', 0),
    ('Desenvolver componente Kanban', 'Criar o board principal com drag and drop', 3, 3, 1, 3, 1, NOW() + INTERVAL '5 days', 1),
    ('Implementar sistema de notificações', 'Notificar usuários sobre mudanças nas tarefas', 2, 2, 1, NULL, 1, NOW() + INTERVAL '14 days', 0),
    ('Criar testes unitários', 'Escrever testes para as principais funcionalidades', 1, 2, 1, NULL, 1, NOW() + INTERVAL '21 days', 0),
    ('Documentar API', 'Criar documentação Swagger/OpenAPI', 1, 1, 1, NULL, 1, NOW() + INTERVAL '30 days', 1),
    ('Otimizar performance', 'Analisar e melhorar tempo de resposta', 1, 2, 1, NULL, 1, NULL, 2);

-- Add labels to tasks
INSERT INTO task_labels (task_id, label_id) VALUES 
    (1, 3), (1, 4),
    (2, 1),
    (3, 2), (3, 6),
    (4, 1), (4, 2),
    (5, 1), (5, 2),
    (6, 7),
    (7, 1), (7, 2), (7, 3);

