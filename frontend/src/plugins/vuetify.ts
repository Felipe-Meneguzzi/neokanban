import 'vuetify/styles';
import { createVuetify, type ThemeDefinition } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#0a0a0f',
    surface: '#12121a',
    'surface-variant': '#1a1a24',
    'surface-bright': '#22222e',
    primary: '#818cf8',
    'primary-darken-1': '#6366f1',
    secondary: '#a78bfa',
    'secondary-darken-1': '#8b5cf6',
    error: '#f87171',
    info: '#38bdf8',
    success: '#4ade80',
    warning: '#fbbf24',
    'on-background': '#e2e8f0',
    'on-surface': '#e2e8f0',
    'on-primary': '#0f0f14',
    'on-secondary': '#0f0f14',
  },
};

const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#f8fafc',
    surface: '#ffffff',
    'surface-variant': '#f1f5f9',
    'surface-bright': '#ffffff',
    primary: '#6366f1',
    'primary-darken-1': '#4f46e5',
    secondary: '#8b5cf6',
    'secondary-darken-1': '#7c3aed',
    error: '#ef4444',
    info: '#0ea5e9',
    success: '#22c55e',
    warning: '#f59e0b',
    'on-background': '#1e293b',
    'on-surface': '#1e293b',
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff',
  },
};

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: darkTheme,
      light: lightTheme,
    },
  },
  defaults: {
    VBtn: {
      variant: 'flat',
      rounded: 'lg',
    },
    VCard: {
      rounded: 'xl',
      elevation: 0,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    },
    VChip: {
      rounded: 'lg',
    },
  },
});

