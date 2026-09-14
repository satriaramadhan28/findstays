<script setup lang="ts">
import { ref } from 'vue';
import type { Hotel } from '../types/hotel';
import { useWishlist } from '../composables/useWishlist';

const props = defineProps<{
  hotel: Hotel;
}>();

const emit = defineEmits<{
  click: [hotel: Hotel];
  'toggle-favorite': [hotel: Hotel, isAdded: boolean];
}>();

const { isFavorite, toggleFavorite } = useWishlist();
const isBouncing = ref(false);

function handleFavoriteClick(e: MouseEvent) {
  e.stopPropagation();
  isBouncing.value = true;
  const added = toggleFavorite(props.hotel.id);
  emit('toggle-favorite', props.hotel, added);
  setTimeout(() => {
    isBouncing.value = false;
  }, 400);
}
</script>

<template>
  <article
    class="luxury-card group relative flex cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-stone-200/90 bg-paper shadow-sm dark:border-white/10 dark:bg-stone-900/90"
    @click="emit('click', hotel)"
  >
    <!-- Image & Badge Container -->
    <div class="relative aspect-[4/3] w-full overflow-hidden bg-stone-900">
      <img
        :src="hotel.imageUrl"
        :alt="hotel.name"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-black/20 opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>

      <!-- Top Badges & Wishlist -->
      <div class="absolute inset-x-4 top-4 flex items-center justify-between">
        <span
          v-if="hotel.badge"
          class="rounded-full border border-gold/40 bg-ink/75 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold shadow-lg backdrop-blur-md"
        >
          ✦ {{ hotel.badge }}
        </span>
        <span v-else></span>

        <!-- Wishlist Button -->
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-ink/70 text-paper shadow-lg backdrop-blur-md transition-transform hover:scale-110 active:scale-95 hover:border-rose-400"
          :class="{ 'animate-heart-bounce text-rose-500 border-rose-400': isFavorite(hotel.id) }"
          :aria-label="isFavorite(hotel.id) ? 'Remove from favorites' : 'Add to favorites'"
          @click="handleFavoriteClick"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="h-4 w-4 transition-colors"
            :fill="isFavorite(hotel.id) ? '#f43f5e' : 'none'"
            :stroke="isFavorite(hotel.id) ? '#f43f5e' : 'currentColor'"
            stroke-width="2"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      <!-- Category Label Overlay -->
      <div v-if="hotel.categoryLabel" class="absolute bottom-3 left-4">
        <span class="rounded-lg bg-paper/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-ink backdrop-blur-md dark:bg-ink/80 dark:text-gold">
          {{ hotel.categoryLabel }}
        </span>
      </div>
    </div>

    <!-- Content Details -->
    <div class="flex flex-1 flex-col p-6">
      <div class="flex-1">
        <h3 class="font-display text-xl font-bold text-ink transition-colors group-hover:text-gold dark:text-paper leading-snug">
          {{ hotel.name }}
        </h3>
        <p class="mt-1.5 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gold shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span class="line-clamp-1 font-medium">{{ hotel.location }}</span>
        </p>
      </div>

      <!-- Rating & Verified Reviews -->
      <div class="mt-4 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
        <div class="flex items-center gap-0.5 text-gold">
          <svg v-for="n in hotel.rating" :key="n" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.285-3.958z" />
          </svg>
        </div>
        <span class="font-bold text-ink dark:text-paper">{{ hotel.rating }}.0</span>
        <span>·</span>
        <span class="text-[11px]">({{ hotel.reviewsCount }} verified ratings)</span>
      </div>

      <!-- Price & Action Footer -->
      <div class="mt-5 flex items-center justify-between border-t border-stone-200/60 pt-4 dark:border-white/5">
        <div>
          <span class="text-[10px] uppercase tracking-wider text-stone-400 block -mb-0.5">Rates From</span>
          <div class="flex items-baseline gap-1.5">
            <span class="font-display text-2xl font-bold text-ink dark:text-paper">${{ hotel.pricePerNight }}</span>
            <span class="text-xs text-stone-500 dark:text-stone-400">/ night</span>
          </div>
        </div>

        <span class="rounded-full border border-stone-300 bg-paper px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-800 transition-all group-hover:border-gold group-hover:bg-gold group-hover:text-ink dark:border-white/10 dark:bg-stone-800 dark:text-paper dark:group-hover:bg-gold dark:group-hover:text-ink">
          Reserve &rarr;
        </span>
      </div>
    </div>
  </article>
</template>
