<script setup lang="ts">
import { ref, computed } from 'vue';

const emit = defineEmits<{
  search: [
    params: {
      location: string;
      person: string;
      checkIn: string;
      checkOut: string;
      guestsCount?: { adults: number; children: number; rooms: number };
    },
  ];
}>();

const location = ref('');
const checkIn = ref('');
const checkOut = ref('');

// Guests counter state
const isGuestPopoverOpen = ref(false);
const guests = ref({
  adults: 2,
  children: 0,
  rooms: 1,
});

const guestSummary = computed(() => {
  const totalGuests = guests.value.adults + guests.value.children;
  const guestText = totalGuests === 1 ? '1 Guest' : `${totalGuests} Guests`;
  const roomText = guests.value.rooms === 1 ? '1 Room' : `${guests.value.rooms} Rooms`;
  return `${guestText}, ${roomText}`;
});

function increment(type: 'adults' | 'children' | 'rooms') {
  if (type === 'adults' && guests.value.adults < 10) guests.value.adults++;
  if (type === 'children' && guests.value.children < 8) guests.value.children++;
  if (type === 'rooms' && guests.value.rooms < 5) guests.value.rooms++;
}

function decrement(type: 'adults' | 'children' | 'rooms') {
  if (type === 'adults' && guests.value.adults > 1) guests.value.adults--;
  if (type === 'children' && guests.value.children > 0) guests.value.children--;
  if (type === 'rooms' && guests.value.rooms > 1) guests.value.rooms--;
}

const quickDestinations = [
  'Bali, Indonesia',
  'Kyoto, Japan',
  'Amalfi Coast, Italy',
  'Swiss Alps, Switzerland',
  'Santorini, Greece',
  'Surabaya, Indonesia',
];

const pillars = [
  { label: 'Private Estates', val: '100% Curated' },
  { label: 'Concierge Rating', val: '4.98 / 5.0' },
  { label: 'Member Privileges', val: 'Guaranteed' },
];

function selectDestination(dest: string) {
  location.value = dest;
  handleSearch();
}

function handleSearch() {
  isGuestPopoverOpen.value = false;
  emit('search', {
    location: location.value,
    person: guestSummary.value,
    checkIn: checkIn.value,
    checkOut: checkOut.value,
    guestsCount: { ...guests.value },
  });
}
</script>

<template>
  <section class="relative overflow-hidden pt-6">
    <div class="relative mx-4 max-w-7xl overflow-hidden rounded-[3rem] border border-stone-800/10 shadow-2xl md:mx-auto dark:border-white/10">
      <!-- High-Resolution Luxury Editorial Visual -->
      <img
        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85"
        alt="Alpine Luxury Palace & Forest"
        class="absolute inset-0 h-full w-full object-cover transform scale-105 transition-transform duration-1000 ease-out"
      />
      <!-- Dramatic Luxury Vignette Overlays -->
      <div class="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/25"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/40 to-transparent"></div>

      <div class="relative flex flex-col gap-12 px-6 py-20 md:px-16 md:py-28">
        <!-- Luxury Hero Typography -->
        <div class="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <div class="max-w-2xl">
            <!-- Prestige Badge -->
            <div class="inline-flex items-center gap-2.5 rounded-full border border-gold/40 bg-ink/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold backdrop-blur-md shadow-lg">
              <span class="h-2 w-2 rounded-full bg-gold shadow-[0_0_8px_rgba(197,160,89,0.8)]"></span>
              <span>An Anthology of Secluded Sanctuaries</span>
            </div>

            <h1 class="mt-6 font-display text-4xl leading-[1.08] font-bold text-paper sm:text-6xl md:text-7xl">
              Stay Quietly, <br />
              <span class="italic font-normal font-serif text-gold-light">With Absolute Elegance.</span>
            </h1>

            <p class="mt-6 max-w-lg text-base leading-relaxed text-stone-300/90 font-light">
              We curate private rainforest villas, cliffside coastal palaces, and timeless heritage retreats where discretion, culinary mastery, and tranquility reign supreme.
            </p>

            <!-- Refined Destination Quick Chips -->
            <div class="mt-8 flex flex-wrap items-center gap-2.5">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-gold">Featured Havens:</span>
              <button
                v-for="dest in quickDestinations"
                :key="dest"
                type="button"
                class="rounded-full border border-gold/30 bg-ink/50 px-3.5 py-1 text-xs font-medium text-stone-200 backdrop-blur-md transition-all hover:border-gold hover:bg-gold/20 hover:text-gold active:scale-95"
                @click="selectDestination(dest)"
              >
                {{ dest.split(',')[0] }}
              </button>
            </div>
          </div>

          <!-- Luxury Trust Metrics -->
          <dl class="flex flex-wrap gap-8 sm:gap-10 border-l border-gold/20 pl-6">
            <div v-for="p in pillars" :key="p.label" class="flex flex-col">
              <dt class="font-display text-2xl sm:text-3xl font-bold text-gold">{{ p.val }}</dt>
              <dd class="mt-0.5 text-[11px] uppercase tracking-widest text-stone-300 font-medium">{{ p.label }}</dd>
            </div>
          </dl>
        </div>

        <!-- Glassmorphic Luxury Search Bar Console -->
        <form
          class="relative grid grid-cols-1 gap-2 rounded-3xl border border-gold/30 bg-ink/80 p-3 shadow-2xl backdrop-blur-2xl sm:grid-cols-2 lg:grid-cols-12 lg:items-center"
          @submit.prevent="handleSearch"
        >
          <!-- Destination Field -->
          <div class="flex flex-col gap-1 rounded-2xl p-3.5 transition-colors hover:bg-white/5 sm:col-span-2 lg:col-span-4">
            <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Destination or Estate</span>
            <div class="flex items-center gap-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gold shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <input
                v-model="location"
                type="text"
                placeholder="e.g. Bali, Amalfi Coast, Kyoto, Swiss Alps"
                class="w-full bg-transparent text-sm font-semibold text-paper outline-none placeholder:text-stone-400 placeholder:font-normal"
              />
            </div>
          </div>

          <!-- Check-in Field -->
          <div class="flex flex-col gap-1 rounded-2xl p-3.5 transition-colors hover:bg-white/5 lg:col-span-2 lg:border-l lg:border-white/10">
            <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Arrival Date</span>
            <input
              v-model="checkIn"
              type="date"
              class="w-full bg-transparent text-xs font-semibold text-paper outline-none [color-scheme:dark]"
            />
          </div>

          <!-- Check-out Field -->
          <div class="flex flex-col gap-1 rounded-2xl p-3.5 transition-colors hover:bg-white/5 lg:col-span-2 lg:border-l lg:border-white/10">
            <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Departure Date</span>
            <input
              v-model="checkOut"
              type="date"
              class="w-full bg-transparent text-xs font-semibold text-paper outline-none [color-scheme:dark]"
            />
          </div>

          <!-- Guests & Suite Field -->
          <div class="relative flex flex-col gap-1 rounded-2xl p-3.5 transition-colors hover:bg-white/5 sm:col-span-2 lg:col-span-2 lg:border-l lg:border-white/10">
            <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Party &amp; Suites</span>
            <button
              type="button"
              class="flex items-center justify-between text-left text-xs font-semibold text-paper"
              @click="isGuestPopoverOpen = !isGuestPopoverOpen"
            >
              <span class="truncate">{{ guestSummary }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gold shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            <!-- Popover Dropdown -->
            <div
              v-if="isGuestPopoverOpen"
              class="absolute top-full left-0 z-50 mt-3 w-72 rounded-3xl border border-gold/30 bg-ink/95 p-5 shadow-2xl backdrop-blur-2xl"
            >
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs font-semibold text-paper">Adults</p>
                    <p class="text-[10px] text-stone-400">Ages 13 and above</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      class="flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 text-gold text-sm font-semibold disabled:opacity-30"
                      :disabled="guests.adults <= 1"
                      @click="decrement('adults')"
                    >-</button>
                    <span class="w-4 text-center text-xs font-bold text-paper">{{ guests.adults }}</span>
                    <button
                      type="button"
                      class="flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 text-gold text-sm font-semibold"
                      @click="increment('adults')"
                    >+</button>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs font-semibold text-paper">Children</p>
                    <p class="text-[10px] text-stone-400">Ages 0 - 12</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      class="flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 text-gold text-sm font-semibold disabled:opacity-30"
                      :disabled="guests.children <= 0"
                      @click="decrement('children')"
                    >-</button>
                    <span class="w-4 text-center text-xs font-bold text-paper">{{ guests.children }}</span>
                    <button
                      type="button"
                      class="flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 text-gold text-sm font-semibold"
                      @click="increment('children')"
                    >+</button>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-xs font-semibold text-paper">Suites &amp; Villas</p>
                    <p class="text-[10px] text-stone-400">Private units required</p>
                  </div>
                  <div class="flex items-center gap-3">
                    <button
                      type="button"
                      class="flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 text-gold text-sm font-semibold disabled:opacity-30"
                      :disabled="guests.rooms <= 1"
                      @click="decrement('rooms')"
                    >-</button>
                    <span class="w-4 text-center text-xs font-bold text-paper">{{ guests.rooms }}</span>
                    <button
                      type="button"
                      class="flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 text-gold text-sm font-semibold"
                      @click="increment('rooms')"
                    >+</button>
                  </div>
                </div>

                <div class="border-t border-white/10 pt-3 flex justify-end">
                  <button
                    type="button"
                    class="rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-ink hover:bg-gold-light"
                    @click="isGuestPopoverOpen = false"
                  >
                    Confirm Selection
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Luxury Search CTA Button -->
          <div class="sm:col-span-2 lg:col-span-2">
            <button
              type="submit"
              class="flex h-full w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold px-6 py-4 text-xs font-bold uppercase tracking-widest text-ink shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ring-1 ring-gold/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
              <span>Explore Stays</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
