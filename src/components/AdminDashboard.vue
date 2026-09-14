<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Hotel } from '../types/hotel';
import type { BookingRecord } from '../services/hotelApi';

const props = defineProps<{
  bookings: BookingRecord[];
  hotels: Hotel[];
  user?: { name: string; email: string; role?: string } | null;
}>();

const emit = defineEmits<{
  close: [];
  'create-hotel': [hotel: Hotel];
  'update-hotel': [hotel: Hotel];
  'delete-hotel': [hotelId: string];
}>();

const createForm = ref<Hotel>({
  id: '',
  name: '',
  location: '',
  rating: 5,
  reviewsCount: 120,
  pricePerNight: 250,
  imageUrl: '',
  badge: '',
  description: '',
  amenities: ['Private Pool', 'Free High-Speed Wi-Fi', 'Butler Service', 'Spa'],
});

const editingId = ref<string | null>(null);

const totalRevenue = computed(() =>
  props.bookings.reduce((sum, booking) => sum + (booking.pricePerNight ?? 0), 0),
);

const recentBookings = computed(() => props.bookings);

function resetForm() {
  editingId.value = null;
  createForm.value = {
    id: '',
    name: '',
    location: '',
    rating: 5,
    reviewsCount: 120,
    pricePerNight: 250,
    imageUrl: '',
    badge: '',
    description: '',
    amenities: ['Private Pool', 'Free High-Speed Wi-Fi', 'Butler Service', 'Spa'],
  };
}

function submitHotel() {
  if (!createForm.value.name.trim() || !createForm.value.location.trim()) return;

  const hotel: Hotel = {
    ...createForm.value,
    id: editingId.value ?? `hotel-${Date.now()}`,
    name: createForm.value.name.trim(),
    location: createForm.value.location.trim(),
    imageUrl: createForm.value.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    badge: createForm.value.badge || 'Curated Stay',
    description: createForm.value.description || 'An extraordinary private retreat.',
    amenities: createForm.value.amenities?.length ? createForm.value.amenities : ['Private Pool', 'Free Wi-Fi'],
  };

  if (editingId.value) {
    emit('update-hotel', hotel);
  } else {
    emit('create-hotel', hotel);
  }

  resetForm();
}

function editHotel(hotel: Hotel) {
  editingId.value = hotel.id;
  createForm.value = { ...hotel };
  window.scrollTo({ top: 300, behavior: 'smooth' });
}

function deleteHotel(hotelId: string) {
  if (confirm('Are you sure you wish to delete this luxury property from the ledger?')) {
    emit('delete-hotel', hotelId);
    if (editingId.value === hotelId) {
      resetForm();
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-paper text-ink transition-colors duration-500 dark:bg-ink dark:text-paper font-sans">
    <!-- Admin Header -->
    <header class="mx-auto max-w-7xl px-6 pt-8">
      <div class="flex flex-col gap-4 rounded-[2.5rem] border border-gold/40 bg-gradient-to-r from-ink via-stone-900 to-ink p-8 text-paper shadow-2xl md:flex-row md:items-center md:justify-between">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
            <span>✦ Executive Ledger &amp; Management ✦</span>
          </div>
          <h1 class="mt-2 font-display text-3xl font-bold text-paper md:text-4xl">FindStays Executive Console</h1>
          <p class="text-xs text-stone-300 font-light mt-1">Manage luxury property inventories, incoming reservations, and live ledger revenue.</p>
        </div>

        <button
          type="button"
          class="rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-7 py-3 text-xs font-bold uppercase tracking-widest text-ink shadow-xl transition-transform hover:scale-105"
          @click="emit('close')"
        >
          &larr; Return to Guest View
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-6 py-10">
      <!-- KPI Stats -->
      <section class="grid gap-6 md:grid-cols-3">
        <article class="luxury-card rounded-3xl border border-gold/30 bg-paper p-7 shadow-lg dark:bg-stone-900/80">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Total Reservations</p>
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-gold text-xs font-bold">FS</span>
          </div>
          <p class="mt-4 font-display text-4xl font-bold text-ink dark:text-paper font-mono">{{ bookings.length }}</p>
          <p class="mt-1 text-xs text-stone-500">Confirmed VIP stays</p>
        </article>

        <article class="luxury-card rounded-3xl border border-gold/30 bg-paper p-7 shadow-lg dark:bg-stone-900/80">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Settled Volume</p>
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-gold text-xs font-bold">$</span>
          </div>
          <p class="mt-4 font-display text-4xl font-bold text-gold font-mono">${{ totalRevenue }}</p>
          <p class="mt-1 text-xs text-stone-500">Gross revenue generated</p>
        </article>

        <article class="luxury-card rounded-3xl border border-gold/30 bg-paper p-7 shadow-lg dark:bg-stone-900/80">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">Active Sanctuaries</p>
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-gold text-xs font-bold">✦</span>
          </div>
          <p class="mt-4 font-display text-4xl font-bold text-ink dark:text-paper font-mono">{{ hotels.length }}</p>
          <p class="mt-1 text-xs text-stone-500">Curated boutique estates</p>
        </article>
      </section>

      <!-- Main Layout: Hotel Form (Left) & Bookings / Ledger (Right) -->
      <section class="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <!-- Add / Edit Hotel Form -->
        <div class="luxury-card rounded-[2.5rem] border border-gold/30 bg-paper p-8 shadow-xl dark:bg-stone-900/80">
          <div class="mb-6 flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">✦ Estate Configuration ✦</span>
              <h2 class="font-display text-2xl font-bold text-ink dark:text-paper mt-0.5">
                {{ editingId ? 'Edit Property Details' : 'Register New Estate' }}
              </h2>
            </div>
            <button
              v-if="editingId"
              type="button"
              class="text-xs font-bold uppercase tracking-wider text-rose-500 hover:underline"
              @click="resetForm"
            >
              Cancel Edit
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Property / Estate Name</label>
              <input
                v-model="createForm.name"
                type="text"
                placeholder="e.g. Royal Banyan Forest Villa"
                class="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-950 dark:text-paper"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Location &amp; Region</label>
              <input
                v-model="createForm.location"
                type="text"
                placeholder="e.g. Ubud, Bali, Indonesia"
                class="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-950 dark:text-paper"
              />
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Nightly Rate ($ USD)</label>
                <input
                  v-model.number="createForm.pricePerNight"
                  type="number"
                  min="0"
                  class="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-950 dark:text-paper font-mono"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Star Grade (1 - 5)</label>
                <input
                  v-model.number="createForm.rating"
                  type="number"
                  min="1"
                  max="5"
                  class="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-950 dark:text-paper font-mono"
                />
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Editorial Photo URL</label>
              <input
                v-model="createForm.imageUrl"
                type="text"
                placeholder="https://images.unsplash.com/..."
                class="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-950 dark:text-paper"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Distinction Badge Tag</label>
              <input
                v-model="createForm.badge"
                type="text"
                placeholder="e.g. Cliffside Panorama, Michelin Starred"
                class="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-950 dark:text-paper"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Editorial Synopsis</label>
              <textarea
                v-model="createForm.description"
                rows="3"
                placeholder="Describe the architectural highlights, privacy, and dining experiences..."
                class="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-950 dark:text-paper"
              ></textarea>
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Amenities (comma separated)</label>
              <input
                :value="createForm.amenities?.join(', ') || ''"
                type="text"
                placeholder="Private Pool, Helipad, Butler 24/7, Onsen"
                class="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-950 dark:text-paper"
                @input="createForm.amenities = ($event.target as HTMLInputElement).value.split(',').map((item) => item.trim()).filter(Boolean)"
              />
            </div>

            <button
              type="button"
              class="w-full rounded-full bg-gradient-to-r from-gold via-gold-light to-gold py-4 text-xs font-bold uppercase tracking-widest text-ink shadow-xl transition-all hover:scale-[1.02]"
              @click="submitHotel"
            >
              {{ editingId ? 'Save & Update Property' : 'Commit Property to Ledger' }}
            </button>
          </div>
        </div>

        <!-- Bookings & Hotel List -->
        <div class="space-y-8">
          <!-- Recent Bookings Table -->
          <div class="luxury-card rounded-[2.5rem] border border-gold/30 bg-paper p-8 shadow-xl dark:bg-stone-900/80">
            <div class="mb-5 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">✦ Live Activity ✦</span>
                <h2 class="font-display text-2xl font-bold text-ink dark:text-paper mt-0.5">Recent VIP Bookings</h2>
              </div>
              <span class="text-xs text-gold font-bold font-mono">{{ bookings.length }} confirmed</span>
            </div>

            <div v-if="bookings.length === 0" class="rounded-2xl border border-dashed border-gold/30 p-8 text-center text-xs text-stone-500">
              No reservations recorded yet.
            </div>

            <div v-else class="overflow-x-auto rounded-2xl border border-stone-200 dark:border-white/10">
              <table class="min-w-full divide-y divide-stone-200 text-left text-xs dark:divide-white/10">
                <thead class="bg-stone-100 dark:bg-stone-950">
                  <tr>
                    <th class="px-4 py-3.5 font-bold uppercase tracking-wider text-gold">Guest Identity</th>
                    <th class="px-4 py-3.5 font-bold uppercase tracking-wider text-gold">Sanctuary</th>
                    <th class="px-4 py-3.5 font-bold uppercase tracking-wider text-gold">Itinerary</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-100 bg-paper dark:divide-white/5 dark:bg-stone-900">
                  <tr v-for="b in recentBookings" :key="b.id ?? b.email + b.checkIn">
                    <td class="px-4 py-3.5">
                      <p class="font-bold text-ink dark:text-paper">{{ b.guestName }}</p>
                      <p class="text-[11px] text-stone-500 font-mono">{{ b.email }}</p>
                    </td>
                    <td class="px-4 py-3.5 font-medium text-ink dark:text-paper">{{ b.hotelName }}</td>
                    <td class="px-4 py-3.5 text-stone-500 dark:text-stone-400 font-mono text-[11px]">
                      {{ b.checkIn }} &rarr; {{ b.checkOut }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Active Property Ledger -->
          <div class="luxury-card rounded-[2.5rem] border border-gold/30 bg-paper p-8 shadow-xl dark:bg-stone-900/80">
            <h3 class="font-display text-xl font-bold text-ink dark:text-paper mb-4">Curated Properties Ledger</h3>
            <div class="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              <article
                v-for="h in hotels"
                :key="h.id"
                class="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-50 p-4 transition-all hover:border-gold dark:border-white/10 dark:bg-stone-950"
              >
                <div class="flex items-center gap-3.5">
                  <img :src="h.imageUrl" :alt="h.name" class="h-12 w-14 rounded-xl object-cover ring-1 ring-gold/30" />
                  <div>
                    <h4 class="font-display text-sm font-bold text-ink dark:text-paper">{{ h.name }}</h4>
                    <p class="text-xs text-stone-500 dark:text-stone-400">{{ h.location }} • <span class="text-gold font-bold font-mono">${{ h.pricePerNight }}/nt</span></p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="rounded-full border border-gold/40 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold hover:bg-gold hover:text-ink transition-colors"
                    @click="editHotel(h)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="rounded-full border border-rose-500/30 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                    @click="deleteHotel(h.id)"
                  >
                    Delete
                  </button>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
