<script setup lang="ts">
import { ref } from 'vue';
import { useDarkMode } from '../composables/useDarkMode';
import { useWishlist } from '../composables/useWishlist';

const props = defineProps<{
  user: { name: string; email: string } | null;
  bookingsCount?: number;
}>();

const emit = defineEmits<{
  'open-auth': [mode: 'login' | 'register'];
  'open-wishlist': [];
  'open-bookings': [];
  logout: [];
}>();

const { isDark, toggleDarkMode } = useDarkMode();
const { favoriteCount } = useWishlist();

const isMobileMenuOpen = ref(false);

const links = [
  { label: 'The Collection', href: '#best-list' },
  { label: 'Featured Sanctuaries', href: '#featured' },
  { label: 'The Distinction', href: '#distinction' },
  { label: 'Guest Journals', href: '#testimonials' },
  { label: 'My Reservations', action: 'bookings' },
];

function scrollTo(href: string) {
  isMobileMenuOpen.value = false;
  const el = document.querySelector(href);
  el?.scrollIntoView({ behavior: 'smooth' });
}

function handleLinkClick(link: { label: string; href?: string; action?: string }) {
  if (link.action === 'bookings') {
    isMobileMenuOpen.value = false;
    emit('open-bookings');
  } else if (link.href) {
    scrollTo(link.href);
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-stone-200/60 bg-paper/90 backdrop-blur-xl transition-all duration-300 dark:border-white/10 dark:bg-ink/90"
  >
    <!-- Top Announcement Bar / Concierge Banner -->
    <div class="border-b border-stone-200/40 bg-stone-100/60 px-6 py-1.5 text-center text-[11px] tracking-[0.2em] uppercase text-stone-600 dark:border-white/5 dark:bg-stone-900/60 dark:text-stone-400">
      <span class="text-gold font-semibold">✦ Bespoke Escapes ✦</span> Complimentary Champagne &amp; Suite Upgrades for Privileged Members
    </div>

    <nav class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <!-- Luxury Brand Logo -->
      <a href="#" class="group flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-ink via-stone-900 to-stone-800 text-gold shadow-md ring-1 ring-gold/30 dark:from-stone-900 dark:to-ink">
          <span class="font-display text-lg font-bold tracking-wider">FS</span>
        </div>
        <div class="flex flex-col">
          <span class="font-display text-xl font-bold tracking-tight text-ink dark:text-paper group-hover:text-gold transition-colors">
            FINDSTAYS
          </span>
          <span class="text-[9px] uppercase tracking-[0.3em] text-gold font-medium -mt-1">
            Private Sanctuaries
          </span>
        </div>
      </a>

      <!-- Desktop Navigation Links -->
      <ul class="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 md:flex dark:text-stone-300">
        <li v-for="link in links" :key="link.label">
          <button
            type="button"
            class="transition-colors hover:text-gold cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-0 after:bg-gold after:transition-all hover:after:w-full"
            @click="handleLinkClick(link)"
          >
            {{ link.label }}
          </button>
        </li>
      </ul>

      <!-- Action Items & Auth -->
      <div class="flex items-center gap-3">
        <!-- Wishlist Button with Badge -->
        <button
          type="button"
          class="relative flex h-10 w-10 items-center justify-center rounded-full border border-stone-800/10 text-stone-700 transition-all hover:border-gold/50 hover:text-gold hover:shadow-md dark:border-white/10 dark:text-stone-200"
          title="View saved wishlist"
          aria-label="View saved wishlist"
          @click="emit('open-wishlist')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <span
            v-if="favoriteCount > 0"
            class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink shadow-sm ring-2 ring-paper dark:ring-ink"
          >
            {{ favoriteCount }}
          </span>
        </button>

        <!-- Dark / Light Theme Toggle -->
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-stone-800/10 text-stone-700 transition-all hover:border-gold/50 hover:text-gold dark:border-white/10 dark:text-stone-300"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDarkMode"
        >
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>

        <!-- User Logged In -->
        <div v-if="props.user" class="hidden items-center gap-3 sm:flex">
          <div class="text-right">
            <p class="text-[9px] font-bold uppercase tracking-[0.25em] text-gold">VIP Member</p>
            <p class="text-xs font-bold text-ink dark:text-paper">{{ props.user.name }}</p>
          </div>
          <button
            type="button"
            class="rounded-full border border-stone-800/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-700 transition-all hover:border-gold hover:text-gold dark:border-white/20 dark:text-stone-300"
            @click="emit('logout')"
          >
            Sign Out
          </button>
        </div>

        <!-- Guest User Actions -->
        <template v-else>
          <button
            type="button"
            class="hidden text-xs font-bold uppercase tracking-wider text-stone-700 transition-colors hover:text-gold sm:block dark:text-stone-200"
            @click="emit('open-auth', 'login')"
          >
            Sign In
          </button>
          <button
            type="button"
            class="hidden rounded-full bg-gradient-to-r from-stone-900 to-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-gold shadow-lg ring-1 ring-gold/40 transition-all hover:ring-gold hover:scale-105 sm:block dark:from-stone-900 dark:to-stone-800 dark:text-gold"
            @click="emit('open-auth', 'register')"
          >
            Join Privilege
          </button>
        </template>

        <!-- Mobile Menu Toggle Button -->
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-stone-800/10 md:hidden dark:border-white/10 text-ink dark:text-paper"
          aria-label="Toggle Navigation Menu"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <svg v-if="!isMobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </nav>

    <!-- Mobile Drawer Menu -->
    <div
      v-if="isMobileMenuOpen"
      class="border-b border-stone-200 bg-paper px-6 py-6 shadow-2xl md:hidden dark:border-white/10 dark:bg-stone-900"
    >
      <div class="flex flex-col gap-4">
        <button
          v-for="link in links"
          :key="link.label"
          type="button"
          class="text-left text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:text-gold dark:text-paper"
          @click="handleLinkClick(link)"
        >
          {{ link.label }}
        </button>

        <div class="border-t border-stone-200 pt-4 dark:border-white/10">
          <div v-if="props.user" class="flex items-center justify-between">
            <p class="text-xs font-semibold text-ink dark:text-paper">{{ props.user.name }}</p>
            <button
              type="button"
              class="rounded-full border border-stone-300 px-3.5 py-1 text-xs font-semibold text-stone-600 dark:border-white/20"
              @click="emit('logout')"
            >
              Sign Out
            </button>
          </div>
          <div v-else class="flex gap-3">
            <button
              type="button"
              class="w-1/2 rounded-full border border-stone-300 py-2.5 text-center text-xs font-semibold text-ink dark:border-white/20 dark:text-paper"
              @click="emit('open-auth', 'login'); isMobileMenuOpen = false"
            >
              Sign In
            </button>
            <button
              type="button"
              class="w-1/2 rounded-full bg-ink py-2.5 text-center text-xs font-semibold text-gold ring-1 ring-gold/40"
              @click="emit('open-auth', 'register'); isMobileMenuOpen = false"
            >
              Join Privilege
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
