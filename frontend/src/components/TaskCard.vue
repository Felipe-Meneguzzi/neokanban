<template>
  <v-card
    class="task-card"
    :class="theme.global.current.value.dark ? 'dark' : 'light'"
    @click="$emit('click')"
  >
    <!-- Priority Indicator -->
    <div 
      v-if="task.priority_color" 
      class="priority-indicator"
      :style="{ backgroundColor: task.priority_color }"
    />

    <v-card-text class="pa-3">
      <!-- Labels -->
      <div v-if="task.labels?.length" class="d-flex flex-wrap gap-1 mb-2">
        <span
          v-for="label in task.labels"
          :key="label.id"
          class="label-chip"
          :style="{ 
            backgroundColor: label.color + '20',
            color: label.color 
          }"
        >
          {{ label.name }}
        </span>
      </div>

      <!-- Title -->
      <h4 class="text-body-1 font-weight-medium mb-2">
        {{ task.title }}
      </h4>

      <!-- Description preview -->
      <p 
        v-if="task.description" 
        class="text-body-2 text-medium-emphasis mb-3 description-preview"
      >
        {{ task.description }}
      </p>

      <!-- Footer -->
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-3">
          <!-- Deadline -->
          <div 
            v-if="task.deadline" 
            class="deadline"
            :class="deadlineClass"
          >
            <v-icon size="14">mdi-calendar-clock</v-icon>
            {{ formatDeadline(task.deadline) }}
          </div>

          <!-- Priority Badge -->
          <v-chip
            v-if="task.priority_name"
            size="x-small"
            :color="task.priority_color"
            variant="tonal"
          >
            {{ task.priority_name }}
          </v-chip>
        </div>

        <!-- Assignee -->
        <v-avatar 
          v-if="task.assignee_name" 
          size="28"
          :color="getAvatarColor(task.assignee_name)"
        >
          <v-img v-if="task.assignee_avatar" :src="task.assignee_avatar" />
          <span v-else class="text-caption font-weight-bold">
            {{ getInitials(task.assignee_name) }}
          </span>
        </v-avatar>
      </div>
    </v-card-text>

    <!-- Delete Button (on hover) -->
    <v-btn
      icon
      size="x-small"
      variant="text"
      color="error"
      class="delete-btn"
      @click.stop="$emit('delete')"
    >
      <v-icon size="16">mdi-close</v-icon>
    </v-btn>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import { formatDistanceToNow, isPast, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Task } from '@/stores/projects';

const props = defineProps<{
  task: Task;
}>();

defineEmits<{
  (e: 'click'): void;
  (e: 'delete'): void;
}>();

const theme = useTheme();

const deadlineClass = computed(() => {
  if (!props.task.deadline) return 'ok';
  const deadline = parseISO(props.task.deadline);
  if (isPast(deadline)) return 'overdue';
  if (differenceInDays(deadline, new Date()) <= 2) return 'soon';
  return 'ok';
});

const formatDeadline = (deadline: string) => {
  return formatDistanceToNow(parseISO(deadline), { 
    addSuffix: true,
    locale: ptBR 
  });
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
.task-card {
  position: relative;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.task-card.dark {
  background: rgba(26, 26, 36, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.task-card.light {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.2);
}

.priority-indicator {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
}

.label-chip {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.description-preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.deadline {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.deadline.overdue {
  color: #ef4444;
}

.deadline.soon {
  color: #f59e0b;
}

.deadline.ok {
  color: #64748b;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-card:hover .delete-btn {
  opacity: 1;
}

.gap-1 {
  gap: 4px;
}

.gap-3 {
  gap: 12px;
}
</style>

