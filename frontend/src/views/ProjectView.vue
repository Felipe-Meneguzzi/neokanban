<template>
  <div class="project-view">
    <!-- Loading State -->
    <div v-if="loading" class="d-flex align-center justify-center" style="height: 80vh;">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <!-- Project Content -->
    <template v-else-if="project">
      <!-- Header -->
      <div class="project-header pa-6 pb-4">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center">
            <v-btn icon variant="text" to="/" class="mr-3">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <div 
              class="project-icon mr-4"
              :style="{ background: `linear-gradient(135deg, ${project.color} 0%, ${adjustColor(project.color, 30)} 100%)` }"
            >
              <v-icon color="white" size="28">mdi-view-dashboard</v-icon>
            </div>
            <div>
              <h1 class="text-h4 font-weight-bold">{{ project.name }}</h1>
              <p v-if="project.description" class="text-body-2 text-medium-emphasis">
                {{ project.description }}
              </p>
            </div>
          </div>
          
          <div class="d-flex align-center gap-3">
            <!-- Members -->
            <div class="avatar-group mr-2">
              <v-avatar 
                v-for="member in (project.members || []).slice(0, 3)" 
                :key="member.id"
                size="36"
                :color="getAvatarColor(member.name)"
                :style="{ borderColor: theme.global.current.value.dark ? '#12121a' : '#ffffff' }"
              >
                <v-img v-if="member.avatar" :src="member.avatar" />
                <span v-else class="text-caption font-weight-bold">
                  {{ getInitials(member.name) }}
                </span>
              </v-avatar>
              <v-avatar 
                v-if="(project.members?.length || 0) > 3"
                size="36"
                color="primary"
                :style="{ borderColor: theme.global.current.value.dark ? '#12121a' : '#ffffff' }"
              >
                <span class="text-caption font-weight-bold">
                  +{{ (project.members?.length || 0) - 3 }}
                </span>
              </v-avatar>
            </div>

            <!-- Settings Button -->
            <v-btn 
              icon 
              variant="tonal"
              @click="showSettings = true"
            >
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="d-flex gap-4">
          <v-chip variant="tonal" color="primary">
            <v-icon start size="16">mdi-checkbox-marked-circle-outline</v-icon>
            {{ tasks.length }} tarefas
          </v-chip>
          <v-chip variant="tonal" color="success">
            <v-icon start size="16">mdi-account-group</v-icon>
            {{ project.members?.length || 0 }} membros
          </v-chip>
          <v-chip variant="tonal" color="warning">
            <v-icon start size="16">mdi-tag-multiple</v-icon>
            {{ project.labels?.length || 0 }} labels
          </v-chip>
        </div>
      </div>

      <!-- Kanban Board -->
      <KanbanBoard
        :project-id="project.id"
        :statuses="project.statuses || []"
        :labels="project.labels || []"
        :priorities="project.priorities || []"
        :users="users"
      />
    </template>

    <!-- Project Settings Dialog -->
    <v-dialog v-model="showSettings" max-width="700" scrollable>
      <v-card>
        <v-toolbar color="transparent" density="compact">
          <v-toolbar-title class="text-h6">Configurações do Projeto</v-toolbar-title>
          <v-spacer />
          <v-btn icon @click="showSettings = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-tabs v-model="settingsTab" color="primary">
            <v-tab value="general">Geral</v-tab>
            <v-tab value="labels">Labels</v-tab>
            <v-tab value="priorities">Prioridades</v-tab>
            <v-tab value="members">Membros</v-tab>
          </v-tabs>

          <v-window v-model="settingsTab" class="mt-6">
            <!-- General Settings -->
            <v-window-item value="general">
              <v-text-field
                v-model="projectSettings.name"
                label="Nome do Projeto"
                class="mb-4"
              />
              <v-textarea
                v-model="projectSettings.description"
                label="Descrição"
                rows="3"
                class="mb-4"
              />
              <div class="mb-4">
                <label class="text-body-2 text-medium-emphasis mb-2 d-block">Cor</label>
                <div class="d-flex flex-wrap gap-2">
                  <div
                    v-for="color in projectColors"
                    :key="color"
                    class="color-option"
                    :class="{ selected: projectSettings.color === color }"
                    :style="{ backgroundColor: color }"
                    @click="projectSettings.color = color"
                  />
                </div>
              </div>
              <v-btn color="primary" @click="saveProjectSettings">
                Salvar Alterações
              </v-btn>
            </v-window-item>

            <!-- Labels Settings -->
            <v-window-item value="labels">
              <div class="d-flex align-center mb-4">
                <v-text-field
                  v-model="newLabel.name"
                  label="Nova Label"
                  placeholder="Ex: Backend"
                  density="compact"
                  class="mr-3"
                  hide-details
                />
                <div class="d-flex gap-1 mr-3">
                  <div
                    v-for="color in labelColors"
                    :key="color"
                    class="color-option-small"
                    :class="{ selected: newLabel.color === color }"
                    :style="{ backgroundColor: color }"
                    @click="newLabel.color = color"
                  />
                </div>
                <v-btn color="primary" @click="addLabel">Adicionar</v-btn>
              </div>
              
              <v-list>
                <v-list-item
                  v-for="label in project?.labels"
                  :key="label.id"
                  class="mb-2 rounded-lg"
                  :style="{ backgroundColor: label.color + '15' }"
                >
                  <template #prepend>
                    <v-chip :color="label.color" size="small" class="mr-3">
                      {{ label.name }}
                    </v-chip>
                  </template>
                  <template #append>
                    <v-btn icon size="small" variant="text" color="error" @click="deleteLabel(label.id)">
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-window-item>

            <!-- Priorities Settings -->
            <v-window-item value="priorities">
              <div class="d-flex align-center mb-4">
                <v-text-field
                  v-model="newPriority.name"
                  label="Nova Prioridade"
                  placeholder="Ex: Urgente"
                  density="compact"
                  class="mr-3"
                  hide-details
                />
                <v-text-field
                  v-model.number="newPriority.level"
                  label="Nível"
                  type="number"
                  density="compact"
                  style="max-width: 80px;"
                  class="mr-3"
                  hide-details
                />
                <div class="d-flex gap-1 mr-3">
                  <div
                    v-for="color in labelColors"
                    :key="color"
                    class="color-option-small"
                    :class="{ selected: newPriority.color === color }"
                    :style="{ backgroundColor: color }"
                    @click="newPriority.color = color"
                  />
                </div>
                <v-btn color="primary" @click="addPriority">Adicionar</v-btn>
              </div>
              
              <v-list>
                <v-list-item
                  v-for="priority in project?.priorities"
                  :key="priority.id"
                  class="mb-2 rounded-lg"
                  :style="{ backgroundColor: priority.color + '15' }"
                >
                  <template #prepend>
                    <v-chip :color="priority.color" size="small" class="mr-3">
                      {{ priority.level }}
                    </v-chip>
                  </template>
                  <v-list-item-title>{{ priority.name }}</v-list-item-title>
                  <template #append>
                    <v-btn icon size="small" variant="text" color="error" @click="deletePriority(priority.id)">
                      <v-icon size="18">mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </v-window-item>

            <!-- Members Settings -->
            <v-window-item value="members">
              <v-list>
                <v-list-item
                  v-for="member in project?.members"
                  :key="member.id"
                  class="mb-2 rounded-lg"
                >
                  <template #prepend>
                    <v-avatar :color="getAvatarColor(member.name)" class="mr-3">
                      {{ getInitials(member.name) }}
                    </v-avatar>
                  </template>
                  <v-list-item-title>{{ member.name }}</v-list-item-title>
                  <v-list-item-subtitle>{{ member.email }}</v-list-item-subtitle>
                  <template #append>
                    <v-chip size="small" variant="tonal" :color="member.role === 'owner' ? 'primary' : 'default'">
                      {{ member.role }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTheme } from 'vuetify';
import { useProjectStore } from '@/stores/projects';
import KanbanBoard from '@/components/KanbanBoard.vue';

const route = useRoute();
const theme = useTheme();
const store = useProjectStore();

const showSettings = ref(false);
const settingsTab = ref('general');

const project = computed(() => store.currentProject);
const tasks = computed(() => store.tasks);
const users = computed(() => store.users);
const loading = computed(() => store.loading);

const projectSettings = reactive({
  name: '',
  description: '',
  color: '#6366f1',
});

const newLabel = reactive({ name: '', color: '#10b981' });
const newPriority = reactive({ name: '', color: '#f59e0b', level: 1 });

const projectColors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
];

const labelColors = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

onMounted(async () => {
  const projectId = Number(route.params.id);
  await store.fetchProject(projectId);
  await store.fetchUsers();
});

watch(project, (p) => {
  if (p) {
    projectSettings.name = p.name;
    projectSettings.description = p.description || '';
    projectSettings.color = p.color;
  }
});

const adjustColor = (color: string, amount: number) => {
  const clamp = (num: number) => Math.min(255, Math.max(0, num));
  const hex = color.replace('#', '');
  const r = clamp(parseInt(hex.slice(0, 2), 16) + amount);
  const g = clamp(parseInt(hex.slice(2, 4), 16) + amount);
  const b = clamp(parseInt(hex.slice(4, 6), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const saveProjectSettings = async () => {
  if (project.value) {
    await store.updateProject(project.value.id, {
      name: projectSettings.name,
      description: projectSettings.description,
      color: projectSettings.color,
    });
  }
};

const addLabel = async () => {
  if (!newLabel.name.trim() || !project.value) return;
  await store.createLabel({
    name: newLabel.name,
    color: newLabel.color,
    project_id: project.value.id,
  });
  newLabel.name = '';
};

const deleteLabel = async (id: number) => {
  await store.deleteLabel(id);
};

const addPriority = async () => {
  if (!newPriority.name.trim() || !project.value) return;
  await store.createPriority({
    name: newPriority.name,
    color: newPriority.color,
    level: newPriority.level,
    project_id: project.value.id,
  });
  newPriority.name = '';
  newPriority.level = (project.value.priorities?.length || 0) + 1;
};

const deletePriority = async (id: number) => {
  await store.deletePriority(id);
};
</script>

<style scoped>
.project-view {
  min-height: 100vh;
}

.project-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.project-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-group {
  display: flex;
}

.avatar-group .v-avatar {
  border: 2px solid;
  margin-left: -10px;
}

.avatar-group .v-avatar:first-child {
  margin-left: 0;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: white;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
}

.color-option-small {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.color-option-small:hover {
  transform: scale(1.1);
}

.color-option-small.selected {
  border-color: white;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.gap-3 {
  gap: 12px;
}

.gap-4 {
  gap: 16px;
}
</style>

