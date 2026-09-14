import { ref, watchEffect } from 'vue';

const STORAGE_KEY = 'findstays-theme';

const prefersDark =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const stored =
  typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;

const isDark = ref(stored ? stored === 'dark' : Boolean(prefersDark));

// Keep the <html> class and localStorage in sync with isDark, everywhere useDarkMode() is used.
watchEffect(() => {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', isDark.value);
  window.localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light');
});

export function useDarkMode() {
  const toggleDarkMode = () => {
    isDark.value = !isDark.value;
  };

  return { isDark, toggleDarkMode };
}
