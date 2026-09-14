<script setup lang="ts">
import type { Hotel } from '../types/hotel';
import { useWishlist } from '../composables/useWishlist';

const props = defineProps<{
  show: boolean;
  hotels: Hotel[];
}>();

const emit = defineEmits<{
  close: [];
  select: [hotel: Hotel];
}>();

const { wishlist, toggleFavorite } = useWishlist();

function getFavoriteHotels(): Hotel[] {
  return props.hotels.filter((h) => wishlist.value.includes(h.id));
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex justify-end bg-ink/60 backdrop-blur-sm transition-opacity"
      @click.self="emit('close')"
    >
      <div class="flex h-full w-full max-w-md flex-col bg-paper shadow-2xl transition-transform dark:bg-stone-900 border-l border-stone-200 dark:border-white/10">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-stone-200 px-6 py-5 dark:border-white/10">
          <div class="flex items-center gap-2">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </span>
            <div>
              <h3 class="font-display text-lg font-bold text-ink dark:text-paper">Saved Stays</h3>
              <p class="text-xs text-stone-500">{{ wishlist.length }} boutique properties saved</p>
            </div>
          </div>

          <button
            type="button"
            class="rounded-full p-2 text-stone-400 hover:text-ink dark:hover:text-paper"
            aria-label="Close wishlist"
            @click="emit('close')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Wishlist Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="getFavoriteHotels().length === 0" class="flex flex-col items-center justify-center py-20 text-center">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h4 class="font-display text-base font-semibold text-ink dark:text-paper">No saved stays yet</h4>
            <p class="mt-1 max-w-xs text-xs text-stone-500">Tap the heart icon on any boutique hotel to keep track of places you'd love to visit.</p>
          </div>

          <div v-else class="space-y-4">
            <article
              v-for="hotel in getFavoriteHotels()"
              :key="hotel.id"
              class="group flex cursor-pointer gap-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 p-3 transition-all hover:border-primary/40 hover:bg-paper dark:border-white/10 dark:bg-stone-800/40 dark:hover:bg-stone-800"
              @click="emit('select', hotel); emit('close')"
            >
              <img :src="hotel.imageUrl" :alt="hotel.name" class="h-20 w-24 rounded-xl object-cover shrink-0" />
              <div class="flex flex-1 flex-col justify-between overflow-hidden">
                <div>
                  <div class="flex items-start justify-between gap-1">
                    <h5 class="truncate font-display text-sm font-semibold text-ink group-hover:text-primary dark:text-paper">
                      {{ hotel.name }}
                    </h5>
                    <button
                      type="button"
                      class="text-rose-500 hover:scale-110 p-1"
                      title="Remove from favorites"
                      @click.stop="toggleFavorite(hotel.id)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                    </button>
                  </div>
                  <p class="truncate text-xs text-stone-500">{{ hotel.location }}</p>
                </div>

                <div class="flex items-baseline justify-between pt-1">
                  <span class="font-display text-sm font-bold text-ink dark:text-paper">${{ hotel.pricePerNight }}<span class="text-[10px] text-stone-400 font-normal"> / nt</span></span>
                  <span class="text-[11px] font-semibold text-primary">View &rarr;</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
