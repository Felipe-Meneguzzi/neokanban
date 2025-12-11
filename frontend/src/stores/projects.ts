import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '@/services/api';

export interface Project {
  id: number;
  name: string;
  description: string;
  color: string;
  owner_id: number;
  owner_name?: string;
  task_count?: number;
  created_at: string;
  updated_at: string;
  members?: User[];
  statuses?: Status[];
  labels?: Label[];
  priorities?: Priority[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface Status {
  id: number;
  name: string;
  color: string;
  position: number;
  project_id: number;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  project_id: number;
}

export interface Priority {
  id: number;
  name: string;
  color: string;
  level: number;
  project_id: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status_id: number;
  status_name?: string;
  status_color?: string;
  priority_id?: number;
  priority_name?: string;
  priority_color?: string;
  priority_level?: number;
  project_id: number;
  assignee_id?: number;
  assignee_name?: string;
  assignee_avatar?: string;
  creator_id?: number;
  creator_name?: string;
  deadline?: string;
  position: number;
  labels: Label[];
  created_at: string;
  updated_at: string;
}

export const useProjectStore = defineStore('projects', () => {
  const projects = ref<Project[]>([]);
  const currentProject = ref<Project | null>(null);
  const tasks = ref<Task[]>([]);
  const users = ref<User[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const tasksByStatus = computed(() => {
    const grouped: Record<number, Task[]> = {};
    if (currentProject.value?.statuses) {
      for (const status of currentProject.value.statuses) {
        grouped[status.id] = tasks.value
          .filter(t => t.status_id === status.id)
          .sort((a, b) => a.position - b.position);
      }
    }
    return grouped;
  });

  // Actions
  async function fetchProjects() {
    loading.value = true;
    try {
      projects.value = await api.get('/projects');
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function fetchProject(id: number) {
    loading.value = true;
    try {
      currentProject.value = await api.get(`/projects/${id}`);
      await fetchTasks(id);
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function createProject(data: Partial<Project>) {
    try {
      const project = await api.post('/projects', data);
      projects.value.unshift(project);
      return project;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function updateProject(id: number, data: Partial<Project>) {
    try {
      const project = await api.put(`/projects/${id}`, data);
      const index = projects.value.findIndex(p => p.id === id);
      if (index !== -1) {
        projects.value[index] = project;
      }
      if (currentProject.value?.id === id) {
        currentProject.value = { ...currentProject.value, ...project };
      }
      return project;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function deleteProject(id: number) {
    try {
      await api.delete(`/projects/${id}`);
      projects.value = projects.value.filter(p => p.id !== id);
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  // Tasks
  async function fetchTasks(projectId: number) {
    try {
      tasks.value = await api.get(`/tasks?project_id=${projectId}`);
    } catch (e: any) {
      error.value = e.message;
    }
  }

  async function createTask(data: Partial<Task>) {
    try {
      const task = await api.post('/tasks', data);
      tasks.value.push(task);
      await fetchTasks(data.project_id!);
      return task;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function updateTask(id: number, data: Partial<Task>) {
    try {
      const task = await api.put(`/tasks/${id}`, data);
      const index = tasks.value.findIndex(t => t.id === id);
      if (index !== -1) {
        await fetchTasks(tasks.value[index].project_id);
      }
      return task;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function moveTask(id: number, statusId: number, position: number) {
    try {
      await api.patch(`/tasks/${id}/move`, { status_id: statusId, position });
      if (currentProject.value) {
        await fetchTasks(currentProject.value.id);
      }
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function deleteTask(id: number) {
    try {
      await api.delete(`/tasks/${id}`);
      tasks.value = tasks.value.filter(t => t.id !== id);
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  // Users
  async function fetchUsers() {
    try {
      users.value = await api.get('/users');
    } catch (e: any) {
      error.value = e.message;
    }
  }

  // Statuses
  async function createStatus(data: { name: string; color: string; project_id: number }) {
    try {
      const status = await api.post('/statuses', data);
      if (currentProject.value?.statuses) {
        currentProject.value.statuses.push(status);
      }
      return status;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function updateStatus(id: number, data: { name: string; color: string }) {
    try {
      const status = await api.put(`/statuses/${id}`, data);
      if (currentProject.value?.statuses) {
        const index = currentProject.value.statuses.findIndex(s => s.id === id);
        if (index !== -1) {
          currentProject.value.statuses[index] = status;
        }
      }
      return status;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function deleteStatus(id: number) {
    try {
      await api.delete(`/statuses/${id}`);
      if (currentProject.value?.statuses) {
        currentProject.value.statuses = currentProject.value.statuses.filter(s => s.id !== id);
      }
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  // Labels
  async function createLabel(data: { name: string; color: string; project_id: number }) {
    try {
      const label = await api.post('/labels', data);
      if (currentProject.value?.labels) {
        currentProject.value.labels.push(label);
      }
      return label;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function updateLabel(id: number, data: { name: string; color: string }) {
    try {
      const label = await api.put(`/labels/${id}`, data);
      if (currentProject.value?.labels) {
        const index = currentProject.value.labels.findIndex(l => l.id === id);
        if (index !== -1) {
          currentProject.value.labels[index] = label;
        }
      }
      return label;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function deleteLabel(id: number) {
    try {
      await api.delete(`/labels/${id}`);
      if (currentProject.value?.labels) {
        currentProject.value.labels = currentProject.value.labels.filter(l => l.id !== id);
      }
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  // Priorities
  async function createPriority(data: { name: string; color: string; level: number; project_id: number }) {
    try {
      const priority = await api.post('/priorities', data);
      if (currentProject.value?.priorities) {
        currentProject.value.priorities.push(priority);
      }
      return priority;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function updatePriority(id: number, data: { name: string; color: string; level: number }) {
    try {
      const priority = await api.put(`/priorities/${id}`, data);
      if (currentProject.value?.priorities) {
        const index = currentProject.value.priorities.findIndex(p => p.id === id);
        if (index !== -1) {
          currentProject.value.priorities[index] = priority;
        }
      }
      return priority;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  async function deletePriority(id: number) {
    try {
      await api.delete(`/priorities/${id}`);
      if (currentProject.value?.priorities) {
        currentProject.value.priorities = currentProject.value.priorities.filter(p => p.id !== id);
      }
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  }

  return {
    // State
    projects,
    currentProject,
    tasks,
    users,
    loading,
    error,
    // Getters
    tasksByStatus,
    // Actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    fetchTasks,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    fetchUsers,
    createStatus,
    updateStatus,
    deleteStatus,
    createLabel,
    updateLabel,
    deleteLabel,
    createPriority,
    updatePriority,
    deletePriority,
  };
});

