<template>
  <v-navigation-drawer
    :model-value="drawer"
    @update:model-value="$emit('update:drawer', $event)"
    permanent
    class="sidebar"
    :class="theme.global.current.value.dark ? 'dark' : 'light'"
  >
    <!-- Logo -->
    <div class="pa-4 mb-4">
      <router-link to="/" class="d-flex align-center text-decoration-none">
        <div 
          class="logo-icon mr-3"
          :style="{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }"
        >
          <v-icon color="white" size="24">mdi-view-dashboard</v-icon>
        </div>
        <div>
          <h1 class="text-h6 font-weight-bold gradient-text">Kanban</h1>
          <span class="text-caption text-medium-emphasis">Project Manager</span>
        </div>
      </router-link>
    </div>

    <v-divider class="mx-4 mb-4" />

    <!-- Navigation -->
    <v-list nav density="comfortable" class="px-2">
      <v-list-item
        to="/"
        prepend-icon="mdi-home-outline"
        title="Dashboard"
        rounded="lg"
        class="mb-1"
      />
      
      <v-list-item
        to="/settings"
        prepend-icon="mdi-cog-outline"
        title="Configurações"
        rounded="lg"
        class="mb-1"
      />
    </v-list>

    <v-divider class="mx-4 my-4" />

    <!-- Projects List -->
    <div class="px-4 mb-2 d-flex align-center justify-space-between">
      <span class="text-caption text-uppercase text-medium-emphasis font-weight-bold">
        Projetos
      </span>
      <v-btn
        icon
        size="x-small"
        variant="text"
        @click="$emit('create-project')"
      >
        <v-icon size="18">mdi-plus</v-icon>
      </v-btn>
    </div>

    <v-list nav density="comfortable" class="px-2">
      <v-list-item
        v-for="project in projects"
        :key="project.id"
        :to="`/project/${project.id}`"
        rounded="lg"
        class="mb-1"
      >
        <template #prepend>
          <div 
            class="project-color-dot mr-3"
            :style="{ backgroundColor: project.color }"
          />
        </template>
        <v-list-item-title class="text-body-2">
          {{ project.name }}
        </v-list-item-title>
        <template #append>
          <v-chip size="x-small" variant="tonal">
            {{ project.task_count || 0 }}
          </v-chip>
        </template>
      </v-list-item>

      <v-list-item v-if="projects.length === 0" class="text-center">
        <span class="text-caption text-medium-emphasis">
          Nenhum projeto ainda
        </span>
      </v-list-item>
    </v-list>

    <template #append>
      <div class="pa-4">
        <v-divider class="mb-4" />
        
        <!-- Theme Toggle -->
        <v-btn
          block
          variant="tonal"
          @click="$emit('toggle-theme')"
          class="mb-3"
        >
          <v-icon class="mr-2">
            {{ theme.global.current.value.dark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}
          </v-icon>
          {{ theme.global.current.value.dark ? 'Tema Claro' : 'Tema Escuro' }}
        </v-btn>

        <!-- User Info -->
        <div class="d-flex align-center pa-2 rounded-lg" style="background: rgba(99, 102, 241, 0.1);">
          <v-avatar size="36" color="primary">
            <span class="text-body-2 font-weight-bold">AD</span>
          </v-avatar>
          <div class="ml-3">
            <div class="text-body-2 font-weight-medium">Admin</div>
            <div class="text-caption text-medium-emphasis">admin@kanban.local</div>
          </div>
        </div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTheme } from 'vuetify';
import { useProjectStore } from '@/stores/projects';

defineProps<{
  drawer: boolean;
}>();

defineEmits<{
  (e: 'update:drawer', value: boolean): void;
  (e: 'toggle-theme'): void;
  (e: 'create-project'): void;
}>();

const theme = useTheme();
const store = useProjectStore();

const projects = computed(() => store.projects);

onMounted(() => {
  store.fetchProjects();
});
</script>

<style scoped>
.sidebar {
  width: 280px !important;
}

.logo-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.project-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
</style>

