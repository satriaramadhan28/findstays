<script setup lang="ts">
defineProps<{
  show: boolean;
  message: string;
  type?: 'success' | 'info' | 'error';
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform translate-y-4 opacity-0 scale-95"
    >
      <div
        v-if="show"
        class="fixed bottom-6 right-6 z-[100] flex max-w-md items-center gap-3 rounded-2xl border bg-paper/95 p-4 shadow-2xl backdrop-blur-xl dark:bg-stone-900/95"
        :class="
          type === 'error'
            ? 'border-rose-500/30 text-rose-600 dark:text-rose-400'
            : 'border-emerald-500/30 text-ink dark:text-paper'
        "
        role="alert"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          :class="
            type === 'error'
              ? 'bg-rose-500/10 text-rose-500'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          "
        >
          <svg v-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>

        <p class="text-xs font-semibold leading-relaxed flex-1">{{ message }}</p>

        <button
          type="button"
          class="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1"
          aria-label="Dismiss toast"
          @click="emit('close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
