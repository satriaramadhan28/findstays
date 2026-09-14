<script setup lang="ts">
import { ref } from 'vue';
import type { Hotel } from '../types/hotel';
import { useWishlist } from '../composables/useWishlist';

const props = defineProps<{
  hotel: Hotel;
  size?: 'large' | 'small';
}>();

const emit = defineEmits<{
  select: [hotel: Hotel];
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
  <div
    class="luxury-card group relative block cursor-pointer overflow-hidden rounded-[2.5rem] border border-gold/20 shadow-xl transition-all duration-700 hover:shadow-2xl hover:border-gold/60"
    :class="size === 'small' ? 'aspect-[16/10]' : 'aspect-[4/5] md:aspect-auto md:h-full min-h-[420px]'"
    @click="emit('select', hotel)"
  >
    <img
      :src="hotel.imageUrl"
      :alt="hotel.name"
      class="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
    />
    <!-- Luxury Vignette Gradient -->
    <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent opacity-95"></div>

    <!-- Top floating bar -->
    <div class="absolute inset-x-6 top-6 flex items-center justify-between">
      <span
        v-if="hotel.badge"
        class="rounded-full border border-gold/50 bg-ink/80 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold shadow-xl backdrop-blur-md"
      >
        ✦ {{ hotel.badge }}
      </span>
      <span v-else></span>

      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-ink/75 text-paper shadow-xl backdrop-blur-md transition-transform hover:scale-110 active:scale-95 hover:border-rose-400"
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

    <!-- Bottom content -->
    <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-8">
      <div class="max-w-[82%]">
        <span v-if="hotel.categoryLabel" class="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
          {{ hotel.categoryLabel }}
        </span>
        <h3
          class="font-display font-bold text-paper mt-1"
          :class="size === 'small' ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-4xl'"
        >
          {{ hotel.name }}
        </h3>
        <p class="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-300">
          <span class="font-medium">{{ hotel.location }}</span>
          <span aria-hidden="true" class="text-gold">·</span>
          <span class="flex items-center gap-0.5 text-gold">
            <svg v-for="n in hotel.rating" :key="n" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.285-3.958z" />
            </svg>
          </span>
          <span>({{ hotel.reviewsCount }} reviews)</span>
          <span aria-hidden="true" class="text-gold">·</span>
          <span class="font-bold text-gold font-mono">${{ hotel.pricePerNight }} / nt</span>
        </p>
      </div>

      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-ink/60 text-gold backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-gold group-hover:text-ink shadow-xl">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 -translate-x-0.5 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </div>
    </div>
  </div>
</template>
