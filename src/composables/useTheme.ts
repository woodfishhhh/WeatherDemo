import { readonly, shallowRef } from 'vue';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'weather-theme-mode';
const theme = shallowRef<ThemeMode>('dark');

const applyTheme = (nextTheme: ThemeMode) => {
  theme.value = nextTheme;
  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;
};

const getPreferredTheme = (): ThemeMode => {
  const savedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useTheme = () => {
  const initializeTheme = () => {
    applyTheme(getPreferredTheme());
  };

  const toggleTheme = () => {
    const nextTheme: ThemeMode = theme.value === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    return nextTheme;
  };

  return {
    theme: readonly(theme),
    initializeTheme,
    toggleTheme,
  };
};
