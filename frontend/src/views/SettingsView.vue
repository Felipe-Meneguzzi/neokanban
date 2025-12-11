<template>
  <div class="settings-view pa-6">
    <div class="max-width-container">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-h4 font-weight-bold mb-2">
          <span class="gradient-text">Configurações</span>
        </h1>
        <p class="text-body-1 text-medium-emphasis">
          Personalize sua experiência no Kanban
        </p>
      </div>

      <v-row>
        <v-col cols="12" md="8">
          <!-- Appearance -->
          <v-card class="mb-6 pa-6">
            <h2 class="text-h6 font-weight-bold mb-4">Aparência</h2>
            
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <p class="text-body-1 font-weight-medium">Tema</p>
                <p class="text-body-2 text-medium-emphasis">
                  Escolha entre tema claro ou escuro
                </p>
              </div>
              <v-btn-toggle v-model="currentTheme" mandatory>
                <v-btn value="dark" variant="outlined">
                  <v-icon class="mr-2">mdi-moon-waning-crescent</v-icon>
                  Escuro
                </v-btn>
                <v-btn value="light" variant="outlined">
                  <v-icon class="mr-2">mdi-white-balance-sunny</v-icon>
                  Claro
                </v-btn>
              </v-btn-toggle>
            </div>
          </v-card>

          <!-- Users Management -->
          <v-card class="mb-6 pa-6">
            <div class="d-flex align-center justify-space-between mb-4">
              <h2 class="text-h6 font-weight-bold">Usuários</h2>
              <v-btn color="primary" @click="showAddUser = true">
                <v-icon class="mr-2">mdi-plus</v-icon>
                Novo Usuário
              </v-btn>
            </div>

            <v-list>
              <v-list-item
                v-for="user in users"
                :key="user.id"
                class="mb-2 rounded-lg"
              >
                <template #prepend>
                  <v-avatar :color="getAvatarColor(user.name)" class="mr-3">
                    {{ getInitials(user.name) }}
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">
                  {{ user.name }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
                <template #append>
                  <v-btn icon size="small" variant="text" @click="editUser(user)">
                    <v-icon size="18">mdi-pencil</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- About -->
          <v-card class="pa-6">
            <h2 class="text-h6 font-weight-bold mb-4">Sobre</h2>
            <div class="d-flex align-center mb-4">
              <div 
                class="logo-icon mr-4"
                :style="{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }"
              >
                <v-icon color="white" size="32">mdi-view-dashboard</v-icon>
              </div>
              <div>
                <h3 class="text-h5 font-weight-bold gradient-text">Kanban</h3>
                <p class="text-body-2 text-medium-emphasis">Project Manager v1.0.0</p>
              </div>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              Um gerenciador de projetos estilo Kanban completo, com suporte a 
              múltiplos projetos, status personalizados, labels, prioridades e 
              atribuição de tarefas.
            </p>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <!-- Quick Stats -->
          <v-card class="pa-6 mb-6">
            <h3 class="text-subtitle-1 font-weight-bold mb-4">Estatísticas</h3>
            <div class="stat-item mb-3">
              <span class="text-body-2 text-medium-emphasis">Projetos</span>
              <span class="text-h6 font-weight-bold">{{ projects.length }}</span>
            </div>
            <div class="stat-item mb-3">
              <span class="text-body-2 text-medium-emphasis">Usuários</span>
              <span class="text-h6 font-weight-bold">{{ users.length }}</span>
            </div>
            <div class="stat-item">
              <span class="text-body-2 text-medium-emphasis">Total de Tarefas</span>
              <span class="text-h6 font-weight-bold">{{ totalTasks }}</span>
            </div>
          </v-card>

          <!-- Keyboard Shortcuts -->
          <v-card class="pa-6">
            <h3 class="text-subtitle-1 font-weight-bold mb-4">Atalhos de Teclado</h3>
            <div class="shortcut-item mb-2">
              <v-chip size="small" variant="tonal" class="mono">N</v-chip>
              <span class="text-body-2 ml-3">Nova tarefa</span>
            </div>
            <div class="shortcut-item mb-2">
              <v-chip size="small" variant="tonal" class="mono">P</v-chip>
              <span class="text-body-2 ml-3">Novo projeto</span>
            </div>
            <div class="shortcut-item mb-2">
              <v-chip size="small" variant="tonal" class="mono">/</v-chip>
              <span class="text-body-2 ml-3">Buscar</span>
            </div>
            <div class="shortcut-item">
              <v-chip size="small" variant="tonal" class="mono">?</v-chip>
              <span class="text-body-2 ml-3">Ajuda</span>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Add/Edit User Dialog -->
    <v-dialog v-model="showAddUser" max-width="500">
      <v-card class="pa-6">
        <v-card-title class="text-h5 mb-4 px-0">
          {{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}
        </v-card-title>
        <v-form @submit.prevent="saveUser">
          <v-text-field
            v-model="userForm.name"
            label="Nome"
            :rules="[v => !!v || 'Nome é obrigatório']"
            class="mb-3"
          />
          <v-text-field
            v-model="userForm.email"
            label="Email"
            type="email"
            :rules="[v => !!v || 'Email é obrigatório']"
            class="mb-3"
          />
          <v-text-field
            v-if="!editingUser"
            v-model="userForm.password"
            label="Senha"
            type="password"
            :rules="[v => !!v || 'Senha é obrigatória']"
            class="mb-3"
          />
          <v-card-actions class="px-0">
            <v-spacer />
            <v-btn variant="text" @click="closeUserDialog">Cancelar</v-btn>
            <v-btn color="primary" type="submit">
              {{ editingUser ? 'Salvar' : 'Criar' }}
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useTheme } from 'vuetify';
import { useProjectStore, type User } from '@/stores/projects';
import { api } from '@/services/api';

const theme = useTheme();
const store = useProjectStore();

const currentTheme = computed({
  get: () => theme.global.name.value,
  set: (val) => { theme.global.name.value = val; }
});

const showAddUser = ref(false);
const editingUser = ref<User | null>(null);

const userForm = reactive({
  name: '',
  email: '',
  password: '',
});

const users = computed(() => store.users);
const projects = computed(() => store.projects);
const totalTasks = computed(() => projects.value.reduce((acc, p) => acc + (p.task_count || 0), 0));

onMounted(async () => {
  await store.fetchUsers();
  await store.fetchProjects();
});

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

const editUser = (user: User) => {
  editingUser.value = user;
  userForm.name = user.name;
  userForm.email = user.email;
  userForm.password = '';
  showAddUser.value = true;
};

const saveUser = async () => {
  if (!userForm.name.trim() || !userForm.email.trim()) return;

  if (editingUser.value) {
    await api.put(`/users/${editingUser.value.id}`, {
      name: userForm.name,
      email: userForm.email,
    });
  } else {
    await api.post('/users', {
      name: userForm.name,
      email: userForm.email,
      password: userForm.password,
    });
  }

  await store.fetchUsers();
  closeUserDialog();
};

const closeUserDialog = () => {
  showAddUser.value = false;
  editingUser.value = null;
  userForm.name = '';
  userForm.email = '';
  userForm.password = '';
};
</script>

<style scoped>
.settings-view {
  max-width: 1200px;
  margin: 0 auto;
}

.logo-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item:last-child {
  border-bottom: none;
}

.shortcut-item {
  display: flex;
  align-items: center;
}
</style>

