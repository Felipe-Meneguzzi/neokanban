<template>
  <div class="kanban-board">
    <KanbanColumn
      v-for="status in statuses"
      :key="status.id"
      :status="status"
      :tasks="tasksByStatus[status.id] || []"
      :labels="labels"
      :priorities="priorities"
      :users="users"
      @create-task="handleCreateTask"
      @edit-task="handleEditTask"
      @delete-task="handleDeleteTask"
      @move-task="handleMoveTask"
      @edit-status="handleEditStatus"
      @delete-status="handleDeleteStatus"
    />

    <!-- Add Column Button -->
    <div class="add-column-wrapper">
      <v-btn
        variant="tonal"
        color="primary"
        class="add-column-btn"
        @click="showAddColumn = true"
      >
        <v-icon class="mr-2">mdi-plus</v-icon>
        Adicionar Coluna
      </v-btn>
    </div>

    <!-- Add Column Dialog -->
    <v-dialog v-model="showAddColumn" max-width="400">
      <v-card class="pa-4">
        <v-card-title class="text-h6 mb-4">Nova Coluna</v-card-title>
        <v-text-field
          v-model="newColumnName"
          label="Nome da coluna"
          autofocus
          @keyup.enter="createColumn"
        />
        <div class="d-flex align-center mt-2 mb-4">
          <span class="text-body-2 mr-3">Cor:</span>
          <div class="d-flex gap-2">
            <div
              v-for="color in presetColors"
              :key="color"
              class="color-option"
              :class="{ selected: newColumnColor === color }"
              :style="{ backgroundColor: color }"
              @click="newColumnColor = color"
            />
          </div>
        </div>
        <v-card-actions class="px-0">
          <v-spacer />
          <v-btn variant="text" @click="showAddColumn = false">Cancelar</v-btn>
          <v-btn color="primary" @click="createColumn">Criar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Task Dialog -->
    <TaskDialog
      v-model="showTaskDialog"
      :task="editingTask"
      :statuses="statuses"
      :labels="labels"
      :priorities="priorities"
      :users="users"
      :project-id="projectId"
      @save="saveTask"
    />

    <!-- Edit Status Dialog -->
    <v-dialog v-model="showEditStatus" max-width="400">
      <v-card class="pa-4">
        <v-card-title class="text-h6 mb-4">Editar Coluna</v-card-title>
        <v-text-field
          v-model="editingStatus.name"
          label="Nome da coluna"
        />
        <div class="d-flex align-center mt-2 mb-4">
          <span class="text-body-2 mr-3">Cor:</span>
          <div class="d-flex gap-2">
            <div
              v-for="color in presetColors"
              :key="color"
              class="color-option"
              :class="{ selected: editingStatus.color === color }"
              :style="{ backgroundColor: color }"
              @click="editingStatus.color = color"
            />
          </div>
        </div>
        <v-card-actions class="px-0">
          <v-spacer />
          <v-btn variant="text" @click="showEditStatus = false">Cancelar</v-btn>
          <v-btn color="primary" @click="updateStatus">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useProjectStore, type Task, type Status, type Label, type Priority, type User } from '@/stores/projects';
import KanbanColumn from './KanbanColumn.vue';
import TaskDialog from './TaskDialog.vue';

const props = defineProps<{
  projectId: number;
  statuses: Status[];
  labels: Label[];
  priorities: Priority[];
  users: User[];
}>();

const store = useProjectStore();

const tasksByStatus = computed(() => store.tasksByStatus);

const showAddColumn = ref(false);
const newColumnName = ref('');
const newColumnColor = ref('#3b82f6');

const showTaskDialog = ref(false);
const editingTask = ref<Partial<Task> | null>(null);

const showEditStatus = ref(false);
const editingStatus = ref<{ id: number; name: string; color: string }>({ id: 0, name: '', color: '' });

const presetColors = [
  '#64748b', '#3b82f6', '#8b5cf6', '#ec4899',
  '#f59e0b', '#10b981', '#ef4444', '#06b6d4'
];

const handleCreateTask = (statusId: number) => {
  editingTask.value = {
    status_id: statusId,
    project_id: props.projectId,
    creator_id: 1, // TODO: Get from auth
  };
  showTaskDialog.value = true;
};

const handleEditTask = (task: Task) => {
  editingTask.value = { ...task };
  showTaskDialog.value = true;
};

const handleDeleteTask = async (taskId: number) => {
  await store.deleteTask(taskId);
};

const handleMoveTask = async (taskId: number, statusId: number, position: number) => {
  await store.moveTask(taskId, statusId, position);
};

const handleEditStatus = (status: Status) => {
  editingStatus.value = { id: status.id, name: status.name, color: status.color };
  showEditStatus.value = true;
};

const handleDeleteStatus = async (statusId: number) => {
  await store.deleteStatus(statusId);
};

const createColumn = async () => {
  if (!newColumnName.value.trim()) return;

  await store.createStatus({
    name: newColumnName.value,
    color: newColumnColor.value,
    project_id: props.projectId,
  });

  newColumnName.value = '';
  newColumnColor.value = '#3b82f6';
  showAddColumn.value = false;
};

const updateStatus = async () => {
  await store.updateStatus(editingStatus.value.id, {
    name: editingStatus.value.name,
    color: editingStatus.value.color,
  });
  showEditStatus.value = false;
};

const saveTask = async (taskData: Partial<Task>) => {
  if (taskData.id) {
    await store.updateTask(taskData.id, taskData);
  } else {
    await store.createTask(taskData);
  }
  showTaskDialog.value = false;
};
</script>

<style scoped>
.kanban-board {
  display: flex;
  gap: 16px;
  padding: 16px;
  overflow-x: auto;
  min-height: calc(100vh - 180px);
}

.add-column-wrapper {
  flex-shrink: 0;
  width: 320px;
  display: flex;
  align-items: flex-start;
  padding-top: 12px;
}

.add-column-btn {
  width: 100%;
  height: 48px;
  border: 2px dashed rgba(99, 102, 241, 0.3);
  background: transparent !important;
}

.color-option {
  width: 28px;
  height: 28px;
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

.gap-2 {
  gap: 8px;
}
</style>
