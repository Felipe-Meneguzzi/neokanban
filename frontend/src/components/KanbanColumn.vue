<template>
  <div 
    class="kanban-column" 
    :class="theme.global.current.value.dark ? 'dark' : 'light'"
  >
    <!-- Column Header -->
    <div 
      class="kanban-column-header"
      :style="{ backgroundColor: status.color + '20' }"
    >
      <div class="d-flex align-center">
        <div 
          class="status-dot mr-2" 
          :style="{ backgroundColor: status.color }"
        />
        <span class="font-weight-medium">{{ status.name }}</span>
        <v-chip 
          size="x-small" 
          class="ml-2"
          variant="tonal"
        >
          {{ tasks.length }}
        </v-chip>
      </div>
      <div>
        <v-menu>
          <template #activator="{ props }">
            <v-btn icon size="x-small" variant="text" v-bind="props">
              <v-icon size="18">mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="$emit('edit-status', status)">
              <template #prepend>
                <v-icon size="18">mdi-pencil</v-icon>
              </template>
              <v-list-item-title>Editar</v-list-item-title>
            </v-list-item>
            <v-list-item @click="confirmDelete">
              <template #prepend>
                <v-icon size="18" color="error">mdi-delete</v-icon>
              </template>
              <v-list-item-title class="text-error">Excluir</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- Tasks Container -->
    <div 
      class="kanban-tasks"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
      :class="{ 'drag-over': isDragOver }"
    >
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        draggable="true"
        @dragstart="onDragStart($event, task)"
        @dragend="onDragEnd"
        @click="$emit('edit-task', task)"
        @delete="$emit('delete-task', task.id)"
      />

      <!-- Empty State -->
      <div v-if="tasks.length === 0" class="empty-column">
        <v-icon size="32" color="grey">mdi-tray-remove</v-icon>
        <span class="text-caption text-medium-emphasis mt-2">
          Nenhuma tarefa
        </span>
      </div>
    </div>

    <!-- Add Task Button -->
    <v-btn
      variant="text"
      color="primary"
      class="add-task-btn mt-2"
      @click="$emit('create-task', status.id)"
    >
      <v-icon class="mr-1" size="18">mdi-plus</v-icon>
      Adicionar tarefa
    </v-btn>

    <!-- Delete Confirmation -->
    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card class="pa-4">
        <v-card-title class="text-h6">Excluir coluna?</v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir a coluna "{{ status.name }}"? 
          As tarefas desta coluna ficarão sem status.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteConfirm = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteColumn">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTheme } from 'vuetify';
import type { Task, Status } from '@/stores/projects';
import TaskCard from './TaskCard.vue';

const props = defineProps<{
  status: Status;
  tasks: Task[];
}>();

const emit = defineEmits<{
  (e: 'create-task', statusId: number): void;
  (e: 'edit-task', task: Task): void;
  (e: 'delete-task', taskId: number): void;
  (e: 'move-task', taskId: number, statusId: number, position: number): void;
  (e: 'edit-status', status: Status): void;
  (e: 'delete-status', statusId: number): void;
}>();

const theme = useTheme();
const isDragOver = ref(false);
const showDeleteConfirm = ref(false);

const onDragStart = (event: DragEvent, task: Task) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify({
      taskId: task.id,
      sourceStatusId: task.status_id,
    }));
  }
};

const onDragEnd = () => {
  isDragOver.value = false;
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const onDragLeave = () => {
  isDragOver.value = false;
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
  
  if (event.dataTransfer) {
    const data = JSON.parse(event.dataTransfer.getData('application/json'));
    const position = props.tasks.length;
    
    emit('move-task', data.taskId, props.status.id, position);
  }
};

const confirmDelete = () => {
  showDeleteConfirm.value = true;
};

const deleteColumn = () => {
  emit('delete-status', props.status.id);
  showDeleteConfirm.value = false;
};
</script>

<style scoped>
.kanban-column {
  flex-shrink: 0;
  width: 320px;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  padding: 12px;
}

.kanban-column.dark {
  background: rgba(18, 18, 26, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.kanban-column.light {
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.kanban-tasks {
  flex: 1;
  min-height: 100px;
  padding: 4px;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.kanban-tasks.drag-over {
  background: rgba(99, 102, 241, 0.1);
}

.empty-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  opacity: 0.5;
}

.add-task-btn {
  width: 100%;
}
</style>

