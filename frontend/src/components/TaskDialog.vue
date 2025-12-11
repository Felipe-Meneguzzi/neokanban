<template>
  <v-dialog 
    :model-value="modelValue" 
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card class="pa-6">
      <v-card-title class="text-h5 mb-4 px-0">
        {{ task?.id ? 'Editar Tarefa' : 'Nova Tarefa' }}
      </v-card-title>

      <v-form @submit.prevent="save">
        <!-- Title -->
        <v-text-field
          v-model="form.title"
          label="Título"
          placeholder="Digite o título da tarefa"
          :rules="[v => !!v || 'Título é obrigatório']"
          class="mb-3"
          autofocus
        />

        <!-- Description -->
        <v-textarea
          v-model="form.description"
          label="Descrição"
          placeholder="Descreva a tarefa (opcional)"
          rows="3"
          class="mb-3"
        />

        <v-row>
          <!-- Status -->
          <v-col cols="12" md="6">
            <v-select
              v-model="form.status_id"
              :items="statuses"
              item-title="name"
              item-value="id"
              label="Status"
            >
              <template #item="{ item, props }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <div 
                      class="status-dot mr-3" 
                      :style="{ backgroundColor: item.raw.color }"
                    />
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>

          <!-- Priority -->
          <v-col cols="12" md="6">
            <v-select
              v-model="form.priority_id"
              :items="priorities"
              item-title="name"
              item-value="id"
              label="Prioridade"
              clearable
            >
              <template #item="{ item, props }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-chip 
                      size="x-small" 
                      :color="item.raw.color"
                      class="mr-2"
                    >
                      {{ item.raw.level }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
        </v-row>

        <v-row>
          <!-- Assignee -->
          <v-col cols="12" md="6">
            <v-select
              v-model="form.assignee_id"
              :items="users"
              item-title="name"
              item-value="id"
              label="Responsável"
              clearable
            >
              <template #item="{ item, props }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-avatar size="28" :color="getAvatarColor(item.raw.name)">
                      {{ getInitials(item.raw.name) }}
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>

          <!-- Deadline -->
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.deadline"
              label="Prazo"
              type="datetime-local"
              clearable
            />
          </v-col>
        </v-row>

        <!-- Labels -->
        <div class="mb-4">
          <label class="text-body-2 text-medium-emphasis mb-2 d-block">
            Labels / Escopos
          </label>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="label in labels"
              :key="label.id"
              :variant="form.labels.includes(label.id) ? 'flat' : 'outlined'"
              :color="label.color"
              @click="toggleLabel(label.id)"
              class="cursor-pointer"
            >
              {{ label.name }}
            </v-chip>
          </div>
        </div>

        <v-divider class="my-4" />

        <v-card-actions class="px-0">
          <v-btn
            v-if="task?.id"
            color="error"
            variant="text"
            @click="confirmDelete"
          >
            <v-icon class="mr-1">mdi-delete</v-icon>
            Excluir
          </v-btn>
          <v-spacer />
          <v-btn variant="text" @click="close">Cancelar</v-btn>
          <v-btn color="primary" type="submit">
            {{ task?.id ? 'Salvar' : 'Criar' }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>

    <!-- Delete Confirmation -->
    <v-dialog v-model="showDeleteConfirm" max-width="400">
      <v-card class="pa-4">
        <v-card-title class="text-h6">Excluir tarefa?</v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteConfirm = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteTask">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import type { Task, Status, Label, Priority, User } from '@/stores/projects';

const props = defineProps<{
  modelValue: boolean;
  task: Partial<Task> | null;
  statuses: Status[];
  labels: Label[];
  priorities: Priority[];
  users: User[];
  projectId: number;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'save', task: Partial<Task>): void;
  (e: 'delete', taskId: number): void;
}>();

const showDeleteConfirm = ref(false);

const form = reactive({
  title: '',
  description: '',
  status_id: null as number | null,
  priority_id: null as number | null,
  assignee_id: null as number | null,
  deadline: '',
  labels: [] as number[],
});

watch(() => props.task, (newTask) => {
  if (newTask) {
    form.title = newTask.title || '';
    form.description = newTask.description || '';
    form.status_id = newTask.status_id || null;
    form.priority_id = newTask.priority_id || null;
    form.assignee_id = newTask.assignee_id || null;
    form.deadline = newTask.deadline ? formatDateForInput(newTask.deadline) : '';
    form.labels = newTask.labels?.map(l => l.id) || [];
  } else {
    resetForm();
  }
});

const formatDateForInput = (date: string) => {
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
};

const resetForm = () => {
  form.title = '';
  form.description = '';
  form.status_id = null;
  form.priority_id = null;
  form.assignee_id = null;
  form.deadline = '';
  form.labels = [];
};

const toggleLabel = (labelId: number) => {
  const index = form.labels.indexOf(labelId);
  if (index === -1) {
    form.labels.push(labelId);
  } else {
    form.labels.splice(index, 1);
  }
};

const save = () => {
  if (!form.title.trim()) return;

  emit('save', {
    ...props.task,
    title: form.title,
    description: form.description,
    status_id: form.status_id!,
    priority_id: form.priority_id,
    assignee_id: form.assignee_id,
    deadline: form.deadline || undefined,
    labels: form.labels,
    project_id: props.projectId,
  });
};

const close = () => {
  emit('update:modelValue', false);
  resetForm();
};

const confirmDelete = () => {
  showDeleteConfirm.value = true;
};

const deleteTask = () => {
  if (props.task?.id) {
    emit('delete', props.task.id);
  }
  showDeleteConfirm.value = false;
  close();
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
</script>

<style scoped>
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.gap-2 {
  gap: 8px;
}

.cursor-pointer {
  cursor: pointer;
}
</style>

