<script setup lang="ts">
import type { Testimonial } from '../types/hotel';

defineProps<{
  testimonials: Testimonial[];
}>();
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-24 border-t border-stone-200/60 dark:border-white/5">
    <div class="mb-16 text-center">
      <div class="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
        <span>✦ Curated Experiences ✦</span>
      </div>
      <h2 class="mt-4 font-display text-3xl font-bold md:text-5xl text-ink dark:text-paper">
        Reflections From Our Guests
      </h2>
      <p class="mx-auto mt-3 max-w-lg text-sm text-stone-600 dark:text-stone-400 font-light">
        Excerpts from travelers who entrusted their private retreats to FindStays.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
      <article
        v-for="t in testimonials"
        :key="t.id"
        class="luxury-card flex flex-col justify-between rounded-[2.5rem] border border-stone-200/90 bg-paper p-8 shadow-md dark:border-white/10 dark:bg-stone-900/80"
      >
        <div>
          <!-- Star Rating & Verified Badge -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-0.5 text-gold">
              <svg v-for="n in t.rating" :key="n" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.285-3.958z" />
              </svg>
            </div>
            <span class="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Verified Stay
            </span>
          </div>

          <!-- Hotel snippet reference -->
          <div class="mt-5 flex items-center gap-3.5 rounded-2xl border border-stone-200/60 bg-stone-100/60 p-3 dark:border-white/5 dark:bg-stone-800/50">
            <img :src="t.imageUrl" :alt="t.hotelName" class="h-11 w-11 rounded-xl object-cover ring-1 ring-gold/30" />
            <div class="overflow-hidden">
              <p class="truncate font-display text-xs font-bold text-ink dark:text-paper">{{ t.hotelName }}</p>
              <p class="truncate text-[11px] text-stone-500 dark:text-stone-400">{{ t.hotelLocation }}</p>
            </div>
          </div>

          <!-- Quote -->
          <p class="mt-6 text-sm leading-relaxed text-stone-600 italic font-serif dark:text-stone-300">
            &ldquo;{{ t.quote }}&rdquo;
          </p>
        </div>

        <!-- Guest Profile Info -->
        <div class="mt-8 flex items-center gap-3.5 border-t border-stone-200/60 pt-5 dark:border-white/5">
          <img
            :src="t.avatarUrl"
            :alt="t.name"
            class="h-11 w-11 rounded-full object-cover ring-2 ring-gold/60"
          />
          <div>
            <p class="font-display text-sm font-bold text-ink dark:text-paper">{{ t.name }}</p>
            <p class="text-[11px] uppercase tracking-wider text-gold font-medium">{{ t.country }}</p>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
