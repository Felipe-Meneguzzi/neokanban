<template>
  <div class="home-view pa-6">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-8">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">
          <span class="gradient-text">Dashboard</span>
        </h1>
        <p class="text-body-1 text-medium-emphasis">
          Bem-vindo ao seu gerenciador de projetos
        </p>
      </div>
      <v-btn color="primary" size="large" @click="showCreateProject = true">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Novo Projeto
      </v-btn>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-8">
      <v-col cols="12" sm="6" lg="3">
        <v-card class="stats-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-medium-emphasis mb-1">Total de Projetos</p>
              <h2 class="text-h4 font-weight-bold">{{ projects.length }}</h2>
            </div>
            <v-avatar size="56" color="primary" variant="tonal">
              <v-icon size="28">mdi-folder-multiple</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <v-card class="stats-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-medium-emphasis mb-1">Tarefas Totais</p>
              <h2 class="text-h4 font-weight-bold">{{ totalTasks }}</h2>
            </div>
            <v-avatar size="56" color="secondary" variant="tonal">
              <v-icon size="28">mdi-checkbox-marked-circle-outline</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <v-card class="stats-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-medium-emphasis mb-1">Usuários</p>
              <h2 class="text-h4 font-weight-bold">{{ users.length }}</h2>
            </div>
            <v-avatar size="56" color="success" variant="tonal">
              <v-icon size="28">mdi-account-group</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" lg="3">
        <v-card class="stats-card pa-5">
          <div class="d-flex align-center justify-space-between">
            <div>
              <p class="text-body-2 text-medium-emphasis mb-1">Em Andamento</p>
              <h2 class="text-h4 font-weight-bold">{{ inProgress }}</h2>
            </div>
            <v-avatar size="56" color="warning" variant="tonal">
              <v-icon size="28">mdi-progress-clock</v-icon>
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Projects Section -->
    <div class="mb-4 d-flex align-center justify-space-between">
      <h2 class="text-h5 font-weight-bold">Seus Projetos</h2>
      <v-text-field
        v-model="search"
        placeholder="Buscar projetos..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        style="max-width: 300px;"
        hide-details
      />
    </div>

    <!-- Projects Grid -->
    <v-row v-if="filteredProjects.length > 0">
      <v-col 
        v-for="project in filteredProjects" 
        :key="project.id"
        cols="12" sm="6" lg="4"
      >
        <v-card 
          class="project-card hover-lift pa-5"
          :to="`/project/${project.id}`"
        >
          <div class="d-flex align-center mb-4">
            <div 
              class="project-icon mr-3"
              :style="{ background: `linear-gradient(135deg, ${project.color} 0%, ${adjustColor(project.color, 30)} 100%)` }"
            >
              <v-icon color="white" size="24">mdi-view-dashboard</v-icon>
            </div>
            <div class="flex-grow-1">
              <h3 class="text-h6 font-weight-bold">{{ project.name }}</h3>
              <span class="text-caption text-medium-emphasis">
                {{ project.owner_name || 'Sem dono' }}
              </span>
            </div>
            <v-menu>
              <template #activator="{ props }">
                <v-btn icon size="small" variant="text" v-bind="props" @click.prevent>
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item @click.prevent="editProject(project)">
                  <template #prepend>
                    <v-icon size="18">mdi-pencil</v-icon>
                  </template>
                  <v-list-item-title>Editar</v-list-item-title>
                </v-list-item>
                <v-list-item @click.prevent="confirmDeleteProject(project)">
                  <template #prepend>
                    <v-icon size="18" color="error">mdi-delete</v-icon>
                  </template>
                  <v-list-item-title class="text-error">Excluir</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <p 
            v-if="project.description" 
            class="text-body-2 text-medium-emphasis mb-4 description-preview"
          >
            {{ project.description }}
          </p>

          <div class="d-flex align-center justify-space-between">
            <v-chip size="small" variant="tonal" color="primary">
              <v-icon start size="14">mdi-checkbox-marked-circle-outline</v-icon>
              {{ project.task_count || 0 }} tarefas
            </v-chip>
            <span class="text-caption text-medium-emphasis">
              {{ formatDate(project.created_at) }}
            </span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-card v-else class="empty-state pa-12 text-center">
      <v-icon size="80" color="primary" class="mb-4" style="opacity: 0.5;">
        mdi-folder-plus-outline
      </v-icon>
      <h3 class="text-h5 mb-2">Nenhum projeto encontrado</h3>
      <p class="text-body-1 text-medium-emphasis mb-6">
        Comece criando seu primeiro projeto para organizar suas tarefas
      </p>
      <v-btn color="primary" size="large" @click="showCreateProject = true">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Criar Primeiro Projeto
      </v-btn>
    </v-card>

    <!-- Create/Edit Project Dialog -->
    <v-dialog v-model="showCreateProject" max-width="500">
      <v-card class="pa-6">
        <v-card-title class="text-h5 mb-4 px-0">
          {{ editingProject ? 'Editar Projeto' : 'Novo Projeto' }}
        </v-card-title>
        <v-form @submit.prevent="saveProject">
          <v-text-field
            v-model="projectForm.name"
            label="Nome do Projeto"
            placeholder="Ex: Website Redesign"
            :rules="[(v: string) => !!v || 'Nome é obrigatório']"
            class="mb-3"
            autofocus
          />
          <v-textarea
            v-model="projectForm.description"
            label="Descrição"
            placeholder="Descreva o projeto (opcional)"
            rows="3"
            class="mb-3"
          />
          <div class="mb-4">
            <label class="text-body-2 text-medium-emphasis mb-2 d-block">
              Cor do Projeto
            </label>
            <div class="d-flex flex-wrap gap-2">
              <div
                v-for="color in projectColors"
                :key="color"
                class="color-option"
                :class="{ selected: projectForm.color === color }"
                :style="{ backgroundColor: color }"
                @click="projectForm.color = color"
              />
            </div>
          </div>
          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn variant="text" @click="closeProjectDialog">Cancelar</v-btn>
            <v-btn color="primary" type="submit">
              {{ editingProject ? 'Salvar' : 'Criar' }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card class="pa-4">
        <v-card-title class="text-h6">Excluir projeto?</v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir "{{ projectToDelete?.name }}"? 
          Todas as tarefas serão perdidas.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteConfirm = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteProject">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useProjectStore, type Project } from '@/stores/projects';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const store = useProjectStore();

const search = ref('');
const showCreateProject = ref(false);
const showDeleteConfirm = ref(false);
const editingProject = ref<Project | null>(null);
const projectToDelete = ref<Project | null>(null);

const projectForm = reactive({
  name: '',
  description: '',
  color: '#6366f1',
});

const projectColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
];

const projects = computed(() => store.projects);
const users = computed(() => store.users);
const totalTasks = computed(() => projects.value.reduce((acc, p) => acc + Number(p.task_count || 0), 0));
const inProgress = computed(() => 2); // TODO: Calculate from actual data

const filteredProjects = computed(() => {
  if (!search.value) return projects.value;
  const term = search.value.toLowerCase();
  return projects.value.filter(p => 
    p.name.toLowerCase().includes(term) ||
    p.description?.toLowerCase().includes(term)
  );
});

onMounted(async () => {
  await store.fetchProjects();
  await store.fetchUsers();
});

const formatDate = (date: string) => {
  return formatDistanceToNow(parseISO(date), { addSuffix: true, locale: ptBR });
};

const adjustColor = (color: string, amount: number) => {
  const clamp = (num: number) => Math.min(255, Math.max(0, num));
  const hex = color.replace('#', '');
  const r = clamp(parseInt(hex.slice(0, 2), 16) + amount);
  const g = clamp(parseInt(hex.slice(2, 4), 16) + amount);
  const b = clamp(parseInt(hex.slice(4, 6), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const editProject = (project: Project) => {
  editingProject.value = project;
  projectForm.name = project.name;
  projectForm.description = project.description || '';
  projectForm.color = project.color;
  showCreateProject.value = true;
};

const confirmDeleteProject = (project: Project) => {
  projectToDelete.value = project;
  showDeleteConfirm.value = true;
};

const saveProject = async () => {
  if (!projectForm.name.trim()) return;

  if (editingProject.value) {
    await store.updateProject(editingProject.value.id, {
      name: projectForm.name,
      description: projectForm.description,
      color: projectForm.color,
    });
  } else {
    await store.createProject({
      name: projectForm.name,
      description: projectForm.description,
      color: projectForm.color,
      owner_id: 1, // TODO: Get from auth
    });
  }

  closeProjectDialog();
};

const deleteProject = async () => {
  if (projectToDelete.value) {
    await store.deleteProject(projectToDelete.value.id);
    showDeleteConfirm.value = false;
    projectToDelete.value = null;
  }
};

const closeProjectDialog = () => {
  showCreateProject.value = false;
  editingProject.value = null;
  projectForm.name = '';
  projectForm.description = '';
  projectForm.color = '#6366f1';
};
</script>

<style scoped>
.home-view {
  max-width: 1400px;
  margin: 0 auto;
}

.stats-card {
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.project-card {
  height: 100%;
  cursor: pointer;
  text-decoration: none;
}

.project-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.description-preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.color-option {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 3px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: white;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}

.gap-2 {
  gap: 8px;
}
</style>

