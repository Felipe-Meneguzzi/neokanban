<template>
  <v-app>
    <AppSidebar v-model:drawer="drawer" @toggle-theme="toggleTheme" />

    <v-main
      class="main-content"
      :class="{ 'ml-0': !drawer }"
      style="
        --v-layout-left: 0px !important;
        --v-layout-right: 0px !important;
        --v-layout-top: 0px !important;
      "
    >
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>

    <!-- Mobile menu button -->
    <v-btn
      v-if="!drawer"
      icon
      class="d-md-none"
      style="position: fixed; left: 16px; top: 16px; z-index: 99"
      @click="drawer = true"
    >
      <v-icon>mdi-menu</v-icon>
    </v-btn>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useTheme } from "vuetify";
import AppSidebar from "@/components/AppSidebar.vue";

const theme = useTheme();
const drawer = ref(true);

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? "light" : "dark";
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.main-content {
  transition: margin-left 0.3s ease;
}
</style>
