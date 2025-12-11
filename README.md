# 🎯 Kanban - Gerenciador de Projetos

Um gerenciador de projetos estilo Kanban completo e moderno, construído com Vue 3, Vuetify 3 e Node.js com Bun.

![Kanban Preview](https://via.placeholder.com/800x400?text=Kanban+Project+Manager)

## ✨ Funcionalidades

- 📋 **Quadro Kanban** - Drag & drop de tarefas entre colunas
- 🎨 **Status Personalizados** - Crie colunas como Backlog, Em Andamento, Aguardando, etc.
- 🏷️ **Labels/Escopos** - Categorize tarefas (Backend, Frontend, Infra, etc.)
- ⚡ **Prioridades** - Defina níveis de prioridade customizados
- 📅 **Prazos** - Acompanhe deadlines das tarefas
- 👥 **Atribuição de Usuários** - Aloque tarefas para membros da equipe
- 🌙 **Tema Claro/Escuro** - Interface adaptável
- 📱 **Responsivo** - Funciona em desktop e mobile

## 🛠️ Tecnologias

### Frontend
- **Vue 3** - Framework JavaScript progressivo
- **Vuetify 3** - Biblioteca de componentes Material Design
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento SPA
- **date-fns** - Manipulação de datas

### Backend
- **Node.js** - Runtime JavaScript
- **Bun** - JavaScript runtime & package manager
- **Hono** - Framework web ultrarrápido
- **PostgreSQL** - Banco de dados relacional

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

## 🚀 Início Rápido

### Pré-requisitos

- Docker e Docker Compose instalados

### Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd kanban
```

2. Inicie os containers:
```bash
docker-compose up -d
```

3. Acesse a aplicação:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432

### Comandos Úteis

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f frontend
docker-compose logs -f backend

# Parar todos os serviços
docker-compose down

# Reconstruir containers
docker-compose up -d --build

# Limpar tudo (incluindo volumes)
docker-compose down -v
```

## 📁 Estrutura do Projeto

```
kanban/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── init.sql                 # Schema do banco + dados demo
│   └── src/
│       ├── index.ts             # Entry point
│       ├── db.ts                # Conexão PostgreSQL
│       └── routes/
│           ├── users.ts
│           ├── projects.ts
│           ├── tasks.ts
│           ├── statuses.ts
│           ├── labels.ts
│           └── priorities.ts
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.ts
        ├── App.vue
        ├── plugins/
        │   └── vuetify.ts
        ├── router/
        │   └── index.ts
        ├── stores/
        │   └── projects.ts
        ├── services/
        │   └── api.ts
        ├── components/
        │   ├── AppSidebar.vue
        │   ├── KanbanBoard.vue
        │   ├── KanbanColumn.vue
        │   ├── TaskCard.vue
        │   └── TaskDialog.vue
        ├── views/
        │   ├── HomeView.vue
        │   ├── ProjectView.vue
        │   └── SettingsView.vue
        └── styles/
            └── main.scss
```

## 🔌 API Endpoints

### Users
| Method | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users` | Listar usuários |
| GET | `/api/users/:id` | Obter usuário |
| POST | `/api/users` | Criar usuário |
| PUT | `/api/users/:id` | Atualizar usuário |
| DELETE | `/api/users/:id` | Remover usuário |

### Projects
| Method | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/projects` | Listar projetos |
| GET | `/api/projects/:id` | Obter projeto com detalhes |
| POST | `/api/projects` | Criar projeto |
| PUT | `/api/projects/:id` | Atualizar projeto |
| DELETE | `/api/projects/:id` | Remover projeto |
| POST | `/api/projects/:id/members` | Adicionar membro |
| DELETE | `/api/projects/:id/members/:userId` | Remover membro |

### Tasks
| Method | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/tasks?project_id=` | Listar tarefas do projeto |
| GET | `/api/tasks/:id` | Obter tarefa |
| POST | `/api/tasks` | Criar tarefa |
| PUT | `/api/tasks/:id` | Atualizar tarefa |
| PATCH | `/api/tasks/:id/move` | Mover tarefa |
| DELETE | `/api/tasks/:id` | Remover tarefa |

### Statuses, Labels, Priorities
| Method | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/statuses?project_id=` | Listar status |
| POST | `/api/statuses` | Criar status |
| PUT | `/api/statuses/:id` | Atualizar status |
| DELETE | `/api/statuses/:id` | Remover status |

> Endpoints similares para `/api/labels` e `/api/priorities`

## 🎨 Customização

### Temas
O sistema suporta tema claro e escuro. Você pode customizar as cores em:
- `frontend/src/plugins/vuetify.ts`

### Estilos
Estilos globais podem ser modificados em:
- `frontend/src/styles/main.scss`

## 📊 Dados Demo

O projeto vem com dados de demonstração:
- 3 usuários (Admin, João Silva, Maria Santos)
- 1 projeto demo com 6 status
- 9 labels pré-definidas (Backend, Frontend, Infra, etc.)
- 5 níveis de prioridade
- 7 tarefas de exemplo

## 🔒 Variáveis de Ambiente

### Backend
| Variável | Descrição | Default |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgres://kanban:kanban123@db:5432/kanban` |
| `PORT` | Porta do servidor | `3000` |
| `JWT_SECRET` | Chave para tokens JWT | `kanban-secret-key-change-in-production` |

### Frontend
Configurações em `vite.config.ts` para proxy da API.

## 🚧 Roadmap

- [ ] Autenticação JWT completa
- [ ] Notificações em tempo real (WebSocket)
- [ ] Comentários nas tarefas
- [ ] Anexos de arquivos
- [ ] Filtros e busca avançada
- [ ] Relatórios e dashboards
- [ ] Integração com calendário
- [ ] Mobile app (Capacitor)

## 📝 Licença

MIT License - sinta-se livre para usar este projeto.

---

Feito com ❤️ usando Vue 3 + Vuetify + Bun

