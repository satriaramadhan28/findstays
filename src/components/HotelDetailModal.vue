<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Hotel, RoomOption } from '../types/hotel';

const props = defineProps<{
  hotel: Hotel | null;
  show: boolean;
  user: { name: string; email: string } | null;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: string;
}>();

const emit = defineEmits<{
  close: [];
  'request-auth': [];
  'booking-confirmed': [bookingData: any];
}>();

// Active Gallery Image
const activeImage = ref('');

// Step: 1 = Details/Dates, 2 = Guest Info, 3 = Payment, 4 = Confirmation Voucher
const currentStep = ref(1);

// Dates & Booking State
const checkInDate = ref('');
const checkOutDate = ref('');
const selectedRoom = ref<RoomOption | null>(null);

// Form
const guestForm = ref({
  fullName: '',
  email: '',
  phone: '',
  notes: '',
});

// Payment
const paymentMethod = ref<'card' | 'transfer' | 'qris'>('card');
const cardData = ref({
  number: '4532 •••• •••• 8920',
  name: '',
  expiry: '12/28',
  cvv: '•••',
});

// Generated voucher after booking
const confirmedVoucher = ref<{
  bookingCode: string;
  hotelName: string;
  location: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  guestName: string;
  email: string;
  createdAt: string;
} | null>(null);

// Initialize modal state on open
watch(
  () => props.hotel,
  (newHotel) => {
    if (newHotel) {
      activeImage.value = newHotel.imageUrl;
      selectedRoom.value = newHotel.rooms?.[0] ?? null;
      currentStep.value = 1;
      confirmedVoucher.value = null;

      if (props.initialCheckIn) {
        checkInDate.value = props.initialCheckIn;
      } else {
        const today = new Date();
        checkInDate.value = today.toISOString().split('T')[0];
      }

      if (props.initialCheckOut) {
        checkOutDate.value = props.initialCheckOut;
      } else {
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 2);
        checkOutDate.value = nextDay.toISOString().split('T')[0];
      }

      if (props.user) {
        guestForm.value.fullName = props.user.name;
        guestForm.value.email = props.user.email;
        cardData.value.name = props.user.name.toUpperCase();
      }
    }
  },
  { immediate: true },
);

// Night calculation
const totalNights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 1;
  const start = new Date(checkInDate.value).getTime();
  const end = new Date(checkOutDate.value).getTime();
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
});

const currentNightlyRate = computed(() => {
  if (selectedRoom.value) return selectedRoom.value.pricePerNight;
  return props.hotel?.pricePerNight ?? 150;
});

const subtotal = computed(() => currentNightlyRate.value * totalNights.value);
const serviceFee = computed(() => Math.round(subtotal.value * 0.05) + 15);
const discount = computed(() => (totalNights.value >= 3 ? Math.round(subtotal.value * 0.1) : 0));
const grandTotal = computed(() => subtotal.value + serviceFee.value - discount.value);

function goToStep2() {
  if (!props.user) {
    emit('request-auth');
    return;
  }
  if (!guestForm.value.fullName && props.user) {
    guestForm.value.fullName = props.user.name;
  }
  if (!guestForm.value.email && props.user) {
    guestForm.value.email = props.user.email;
  }
  currentStep.value = 2;
}

function goToStep3() {
  if (!guestForm.value.fullName.trim() || !guestForm.value.email.trim()) {
    alert('Please fill in your full name and email address.');
    return;
  }
  currentStep.value = 3;
}

const isProcessing = ref(false);

function processPayment() {
  isProcessing.value = true;
  setTimeout(() => {
    isProcessing.value = false;
    const randomCode = `FS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const voucherData = {
      bookingCode: randomCode,
      hotelName: props.hotel?.name || 'Boutique Stay',
      location: props.hotel?.location || '',
      roomName: selectedRoom.value?.name || 'Deluxe King Sanctuary',
      checkIn: checkInDate.value,
      checkOut: checkOutDate.value,
      nights: totalNights.value,
      totalPrice: grandTotal.value,
      pricePerNight: currentNightlyRate.value,
      guestName: guestForm.value.fullName,
      email: guestForm.value.email,
      phone: guestForm.value.phone,
      paymentMethod: paymentMethod.value.toUpperCase(),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    confirmedVoucher.value = voucherData;
    currentStep.value = 4;
    emit('booking-confirmed', voucherData);
  }, 1200);
}

function printVoucher() {
  window.print();
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show && hotel"
      class="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-3 backdrop-blur-xl sm:p-6 overflow-y-auto"
      @click.self="emit('close')"
    >
      <div class="relative my-auto w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-gold/30 bg-paper shadow-2xl transition-all dark:bg-stone-950 max-h-[94vh] flex flex-col">
        <!-- Close Button -->
        <button
          type="button"
          class="absolute right-5 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 bg-ink/75 text-gold shadow-lg backdrop-blur-md transition-transform hover:scale-110 active:scale-95"
          aria-label="Close dialog"
          @click="emit('close')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <!-- Stepper Indicator Header -->
        <div class="border-b border-gold/20 bg-stone-100/80 px-8 py-4 dark:bg-stone-900/80 shrink-0">
          <div class="flex items-center justify-between max-w-lg mx-auto">
            <div class="flex items-center gap-2.5">
              <span
                class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-1 ring-gold/40"
                :class="currentStep >= 1 ? 'bg-gold text-ink font-bold' : 'bg-stone-300 text-stone-600 dark:bg-stone-800'"
              >
                1
              </span>
              <span class="text-xs font-bold uppercase tracking-wider" :class="currentStep >= 1 ? 'text-ink dark:text-gold' : 'text-stone-400'">Estate Overview</span>
            </div>
            <div class="h-[1px] w-8 sm:w-12 bg-gold/30"></div>

            <div class="flex items-center gap-2.5">
              <span
                class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-1 ring-gold/40"
                :class="currentStep >= 2 ? 'bg-gold text-ink font-bold' : 'bg-stone-300 text-stone-600 dark:bg-stone-800'"
              >
                2
              </span>
              <span class="text-xs font-bold uppercase tracking-wider" :class="currentStep >= 2 ? 'text-ink dark:text-gold' : 'text-stone-400'">Guest Identity</span>
            </div>
            <div class="h-[1px] w-8 sm:w-12 bg-gold/30"></div>

            <div class="flex items-center gap-2.5">
              <span
                class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-1 ring-gold/40"
                :class="currentStep >= 3 ? 'bg-gold text-ink font-bold' : 'bg-stone-300 text-stone-600 dark:bg-stone-800'"
              >
                3
              </span>
              <span class="text-xs font-bold uppercase tracking-wider" :class="currentStep >= 3 ? 'text-ink dark:text-gold' : 'text-stone-400'">Privilege Pass</span>
            </div>
          </div>
        </div>

        <!-- Scrollable Modal Body -->
        <div class="overflow-y-auto p-6 sm:p-10">
          <!-- STEP 1: Hotel Overview & Date Selection -->
          <div v-if="currentStep === 1" class="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <!-- Left Column: Gallery & Info (7 cols) -->
            <div class="lg:col-span-7 flex flex-col gap-6">
              <!-- Main Image Preview -->
              <div class="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-stone-900 border border-gold/30 shadow-lg">
                <img :src="activeImage || hotel.imageUrl" :alt="hotel.name" class="h-full w-full object-cover transition-all duration-500" />
                <span v-if="hotel.badge" class="absolute top-4 left-4 rounded-full border border-gold/50 bg-ink/80 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold shadow-lg backdrop-blur-md">
                  ✦ {{ hotel.badge }}
                </span>
              </div>

              <!-- Thumbnails row -->
              <div v-if="hotel.gallery && hotel.gallery.length > 1" class="flex gap-3 overflow-x-auto pb-1">
                <button
                  v-for="(img, idx) in hotel.gallery"
                  :key="idx"
                  type="button"
                  class="h-16 w-24 shrink-0 overflow-hidden rounded-2xl border-2 transition-all"
                  :class="activeImage === img ? 'border-gold scale-95 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'"
                  @click="activeImage = img"
                >
                  <img :src="img" :alt="`${hotel.name} view ${idx+1}`" class="h-full w-full object-cover" />
                </button>
              </div>

              <!-- Title & Location -->
              <div>
                <h2 class="font-display text-2xl font-bold text-ink sm:text-3xl dark:text-paper leading-tight">{{ hotel.name }}</h2>
                <p class="mt-2 flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gold shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  <span class="font-medium">{{ hotel.location }}</span>
                </p>

                <div class="mt-3 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                  <div class="flex items-center gap-0.5 text-gold">
                    <svg v-for="n in hotel.rating" :key="n" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.363 1.118l1.287 3.957c.3.922-.755 1.688-1.539 1.118l-3.366-2.446a1 1 0 00-1.176 0l-3.366 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.363-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.285-3.958z" />
                    </svg>
                  </div>
                  <span class="font-bold text-ink dark:text-paper">{{ hotel.rating }}.0</span>
                  <span>·</span>
                  <span>({{ hotel.reviewsCount }} guest appraisals)</span>
                </div>
              </div>

              <!-- Description -->
              <p class="text-sm leading-relaxed text-stone-600 dark:text-stone-300 font-light">
                {{ hotel.description }}
              </p>

              <!-- Amenities -->
              <div>
                <h4 class="text-xs font-bold uppercase tracking-[0.2em] text-gold">Bespoke Amenities</h4>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="amenity in hotel.amenities"
                    :key="amenity"
                    class="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-stone-100/80 px-3.5 py-1 text-xs font-semibold text-stone-800 dark:border-gold/20 dark:bg-stone-900 dark:text-gold-light"
                  >
                    <span class="text-gold">✦</span>
                    {{ amenity }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right Column: Booking Calculator Box (5 cols) -->
            <div class="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-gold/30 bg-stone-50/90 p-7 shadow-xl dark:bg-stone-900/80">
              <div>
                <!-- Room Options -->
                <div v-if="hotel.rooms && hotel.rooms.length > 0" class="mb-5">
                  <label class="block text-[10px] font-bold uppercase tracking-[0.2em] text-gold mb-2.5">Select Suite Category</label>
                  <div class="space-y-2.5">
                    <div
                      v-for="room in hotel.rooms"
                      :key="room.id"
                      class="cursor-pointer rounded-2xl border p-3.5 transition-all"
                      :class="selectedRoom?.id === room.id ? 'border-gold bg-gold/10 ring-1 ring-gold shadow-md' : 'border-stone-200 bg-paper dark:border-white/10 dark:bg-stone-950'"
                      @click="selectedRoom = room"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-ink dark:text-paper">{{ room.name }}</span>
                        <span class="text-xs font-bold text-gold font-mono">${{ room.pricePerNight }}<span class="text-[10px] text-stone-400 font-normal">/nt</span></span>
                      </div>
                      <p class="mt-1 text-[11px] text-stone-500 dark:text-stone-400">{{ room.bedType }} • {{ room.capacity }}</p>
                    </div>
                  </div>
                </div>

                <!-- Date Inputs -->
                <div class="grid grid-cols-2 gap-3 rounded-2xl bg-paper p-3.5 border border-stone-200 dark:border-white/10 dark:bg-stone-950">
                  <div>
                    <label class="block text-[10px] font-bold uppercase tracking-wider text-gold">Check-in</label>
                    <input
                      v-model="checkInDate"
                      type="date"
                      class="mt-1 w-full bg-transparent text-xs font-semibold text-ink outline-none dark:text-paper [color-scheme:dark]"
                    />
                  </div>
                  <div class="border-l border-stone-200 pl-3 dark:border-white/10">
                    <label class="block text-[10px] font-bold uppercase tracking-wider text-gold">Check-out</label>
                    <input
                      v-model="checkOutDate"
                      type="date"
                      class="mt-1 w-full bg-transparent text-xs font-semibold text-ink outline-none dark:text-paper [color-scheme:dark]"
                    />
                  </div>
                </div>

                <!-- Price Breakdown Calculation -->
                <div class="mt-6 space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
                  <div class="flex items-center justify-between">
                    <span>${{ currentNightlyRate }} &times; {{ totalNights }} night{{ totalNights > 1 ? 's' : '' }}</span>
                    <span class="font-bold text-ink dark:text-paper">${{ subtotal }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Bespoke Concierge &amp; Service</span>
                    <span class="font-medium">${{ serviceFee }}</span>
                  </div>
                  <div v-if="discount > 0" class="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Extended Stay Privilege (10%)</span>
                    <span>-${{ discount }}</span>
                  </div>

                  <div class="border-t border-stone-200/80 pt-4 dark:border-white/10 flex items-baseline justify-between text-sm">
                    <span class="font-bold text-ink dark:text-paper uppercase tracking-wider text-xs">Total Consideration</span>
                    <span class="font-display text-2xl font-bold text-gold font-mono">${{ grandTotal }}</span>
                  </div>
                </div>
              </div>

              <!-- Action Button -->
              <div class="mt-7">
                <button
                  type="button"
                  class="w-full rounded-2xl bg-gradient-to-r from-gold via-gold-light to-gold py-4 text-center text-xs font-bold uppercase tracking-widest text-ink shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                  @click="goToStep2"
                >
                  {{ props.user ? 'Continue to Guest Details &rarr;' : 'Sign in to Reserve Sanctuary' }}
                </button>
                <p class="mt-2.5 text-center text-[11px] text-stone-500 dark:text-stone-400">
                  ✦ Guaranteed VIP Perks &amp; Discretionary Cancellation
                </p>
              </div>
            </div>
          </div>

          <!-- STEP 2: Guest Details -->
          <div v-else-if="currentStep === 2" class="max-w-xl mx-auto">
            <div class="mb-6 text-center">
              <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">✦ Step 02 ✦</span>
              <h3 class="font-display text-2xl font-bold text-ink dark:text-paper mt-1">Guest Identity &amp; Preferences</h3>
              <p class="text-xs text-stone-500 mt-1">Please provide the primary traveler's credentials for {{ hotel.name }}</p>
            </div>

            <div class="space-y-4 rounded-3xl border border-gold/30 bg-stone-50/90 p-7 dark:bg-stone-900/80">
              <div>
                <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Full Name (As on Passport / ID)</label>
                <input
                  v-model="guestForm.fullName"
                  type="text"
                  placeholder="e.g. Lord / Lady / Dr. Johnathan Doe"
                  class="mt-1.5 w-full rounded-xl border border-stone-200 bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-950 dark:text-paper"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Confidential Email Address</label>
                <input
                  v-model="guestForm.email"
                  type="email"
                  placeholder="concierge@example.com"
                  class="mt-1.5 w-full rounded-xl border border-stone-200 bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-950 dark:text-paper"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Private Mobile / WhatsApp</label>
                <input
                  v-model="guestForm.phone"
                  type="tel"
                  placeholder="+62 812-3456-7890"
                  class="mt-1.5 w-full rounded-xl border border-stone-200 bg-paper px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-950 dark:text-paper"
                />
              </div>

              <div>
                <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Bespoke Concierge Notes &amp; Dietary Requests</label>
                <textarea
                  v-model="guestForm.notes"
                  rows="2"
                  placeholder="Private helicopter transfer, champagne preference, high-floor suite..."
                  class="mt-1.5 w-full rounded-xl border border-stone-200 bg-paper px-4 py-2 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-950 dark:text-paper"
                ></textarea>
              </div>
            </div>

            <!-- Buttons -->
            <div class="mt-7 flex items-center justify-between gap-4">
              <button
                type="button"
                class="rounded-full border border-stone-300 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-700 dark:border-white/20 dark:text-stone-200"
                @click="currentStep = 1"
              >
                &larr; Overview
              </button>
              <button
                type="button"
                class="rounded-full bg-gold px-8 py-3 text-xs font-bold uppercase tracking-widest text-ink shadow-lg transition-all hover:bg-gold-light"
                @click="goToStep3"
              >
                Proceed to Payment &rarr;
              </button>
            </div>
          </div>

          <!-- STEP 3: Payment Method -->
          <div v-else-if="currentStep === 3" class="max-w-xl mx-auto">
            <div class="mb-6 text-center">
              <span class="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">✦ Step 03 ✦</span>
              <h3 class="font-display text-2xl font-bold text-ink dark:text-paper mt-1">Encrypted Payment</h3>
              <p class="text-xs text-stone-500 mt-1">Total Consideration: <span class="font-bold text-gold font-mono">${{ grandTotal }}</span></p>
            </div>

            <!-- Payment Method Tabs -->
            <div class="grid grid-cols-3 gap-3 mb-6">
              <button
                type="button"
                class="flex flex-col items-center gap-1.5 rounded-2xl border p-3.5 text-xs font-bold transition-all"
                :class="paymentMethod === 'card' ? 'border-gold bg-gold/15 text-gold ring-1 ring-gold shadow-md' : 'border-stone-200 bg-paper text-stone-600 dark:border-white/10 dark:bg-stone-900 dark:text-stone-300'"
                @click="paymentMethod = 'card'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
                </svg>
                <span>Black Card</span>
              </button>

              <button
                type="button"
                class="flex flex-col items-center gap-1.5 rounded-2xl border p-3.5 text-xs font-bold transition-all"
                :class="paymentMethod === 'transfer' ? 'border-gold bg-gold/15 text-gold ring-1 ring-gold shadow-md' : 'border-stone-200 bg-paper text-stone-600 dark:border-white/10 dark:bg-stone-900 dark:text-stone-300'"
                @click="paymentMethod = 'transfer'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/>
                </svg>
                <span>Wire / Virtual</span>
              </button>

              <button
                type="button"
                class="flex flex-col items-center gap-1.5 rounded-2xl border p-3.5 text-xs font-bold transition-all"
                :class="paymentMethod === 'qris' ? 'border-gold bg-gold/15 text-gold ring-1 ring-gold shadow-md' : 'border-stone-200 bg-paper text-stone-600 dark:border-white/10 dark:bg-stone-900 dark:text-stone-300'"
                @click="paymentMethod = 'qris'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 22v-1"/>
                </svg>
                <span>QRIS Instant</span>
              </button>
            </div>

            <!-- Card Form Mockup -->
            <div v-if="paymentMethod === 'card'" class="rounded-3xl border border-gold/30 bg-stone-50/90 p-7 space-y-4 dark:bg-stone-900/80">
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-wider text-gold">Card Number</label>
                <input v-model="cardData.number" type="text" class="mt-1 w-full rounded-xl border border-stone-200 bg-paper px-4 py-2.5 text-sm text-ink outline-none dark:border-white/10 dark:bg-stone-950 dark:text-paper font-mono" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-gold">Expiry</label>
                  <input v-model="cardData.expiry" type="text" placeholder="MM/YY" class="mt-1 w-full rounded-xl border border-stone-200 bg-paper px-4 py-2.5 text-sm text-ink outline-none dark:border-white/10 dark:bg-stone-950 dark:text-paper" />
                </div>
                <div>
                  <label class="block text-[10px] font-bold uppercase tracking-wider text-gold">CVC / CVV</label>
                  <input v-model="cardData.cvv" type="password" placeholder="123" class="mt-1 w-full rounded-xl border border-stone-200 bg-paper px-4 py-2.5 text-sm text-ink outline-none dark:border-white/10 dark:bg-stone-950 dark:text-paper" />
                </div>
              </div>
            </div>

            <!-- Virtual Account Info -->
            <div v-else-if="paymentMethod === 'transfer'" class="rounded-3xl border border-gold/30 bg-stone-50/90 p-7 text-center space-y-3 dark:bg-stone-900/80">
              <p class="text-xs text-stone-500">Private Banking Virtual Account</p>
              <p class="font-display text-2xl font-bold tracking-widest text-gold font-mono">8801 9283 4019 22</p>
              <p class="text-[11px] text-stone-400">Automatic priority clearance enabled.</p>
            </div>

            <!-- QRIS QR Preview -->
            <div v-else class="rounded-3xl border border-gold/30 bg-stone-50/90 p-7 text-center space-y-3 dark:bg-stone-900/80">
              <div class="mx-auto flex h-36 w-36 items-center justify-center rounded-2xl bg-white p-2 shadow-inner ring-2 ring-gold">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-28 w-28 text-ink" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect width="6" height="6" x="2" y="2" rx="1"/><rect width="6" height="6" x="16" y="2" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><path d="M22 16h-3a2 2 0 0 0-2 2v3"/><path d="M22 22v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M2 12h.01"/><path d="M12 2h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M22 12v.01"/><path d="M12 22v-1"/>
                </svg>
              </div>
              <p class="text-xs font-semibold text-ink dark:text-paper">Scan with any Digital Banking or E-Wallet App</p>
            </div>

            <!-- Actions -->
            <div class="mt-7 flex items-center justify-between gap-4">
              <button
                type="button"
                class="rounded-full border border-stone-300 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-700 dark:border-white/20 dark:text-stone-200"
                @click="currentStep = 2"
              >
                &larr; Back
              </button>
              <button
                type="button"
                class="flex items-center gap-2 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-ink shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                :disabled="isProcessing"
                @click="processPayment"
              >
                <span v-if="isProcessing" class="h-4 w-4 animate-spin rounded-full border-2 border-ink border-t-transparent"></span>
                <span>{{ isProcessing ? 'Authorizing Stay...' : `Authorize & Reserve $${grandTotal}` }}</span>
              </button>
            </div>
          </div>

          <!-- STEP 4: Digital Booking Voucher Pass (Gold Stamped Pass) -->
          <div v-else-if="currentStep === 4 && confirmedVoucher" class="max-w-xl mx-auto">
            <div class="mb-5 text-center">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/20 text-gold mb-2 ring-1 ring-gold">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M20 6 9 17l-5-5"/>
                </svg>
              </div>
              <h3 class="font-display text-2xl font-bold text-ink dark:text-paper">Sanctuary Reserved</h3>
              <p class="text-xs text-stone-500">Your bespoke voucher has been dispatched to {{ confirmedVoucher.email }}</p>
            </div>

            <!-- VIP Digital Gold Pass -->
            <div class="overflow-hidden rounded-3xl border-2 border-gold/60 bg-paper shadow-2xl dark:bg-stone-950">
              <!-- Top Gold Ticket Header -->
              <div class="bg-gradient-to-r from-stone-900 via-ink to-stone-900 p-6 text-paper flex items-center justify-between border-b border-gold/40">
                <div>
                  <p class="text-[9px] uppercase tracking-[0.3em] text-gold font-bold">✦ Official Privilege Pass ✦</p>
                  <h4 class="font-display text-xl font-bold text-paper mt-0.5">{{ confirmedVoucher.hotelName }}</h4>
                  <p class="text-xs text-stone-300 font-light">{{ confirmedVoucher.location }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[9px] uppercase tracking-wider text-gold font-bold">Reference Code</p>
                  <p class="font-mono text-base font-bold tracking-wider text-paper">{{ confirmedVoucher.bookingCode }}</p>
                </div>
              </div>

              <!-- Ticket Body -->
              <div class="p-7 space-y-4">
                <div class="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span class="text-gold uppercase text-[10px] font-bold tracking-wider">Primary Guest</span>
                    <p class="font-bold text-ink dark:text-paper text-sm mt-0.5">{{ confirmedVoucher.guestName }}</p>
                  </div>
                  <div>
                    <span class="text-gold uppercase text-[10px] font-bold tracking-wider">Suite Tier</span>
                    <p class="font-bold text-ink dark:text-paper text-sm mt-0.5">{{ confirmedVoucher.roomName }}</p>
                  </div>
                  <div>
                    <span class="text-gold uppercase text-[10px] font-bold tracking-wider">Itinerary Duration</span>
                    <p class="font-semibold text-ink dark:text-paper mt-0.5">{{ confirmedVoucher.checkIn }} &rarr; {{ confirmedVoucher.checkOut }} ({{ confirmedVoucher.nights }} nights)</p>
                  </div>
                  <div>
                    <span class="text-gold uppercase text-[10px] font-bold tracking-wider">Settled Amount</span>
                    <p class="font-bold text-gold text-base mt-0.5 font-mono">${{ confirmedVoucher.totalPrice }}</p>
                  </div>
                </div>

                <!-- Perforated Line -->
                <div class="relative my-4 flex items-center justify-between border-t border-dashed border-gold/30"></div>

                <!-- Instructions -->
                <div class="flex items-center justify-between gap-4">
                  <div class="text-xs text-stone-500 dark:text-stone-400">
                    <p class="font-bold text-ink dark:text-paper">Concierge Check-in Guaranteed</p>
                    <p class="mt-0.5 text-[11px]">Private suite key &amp; welcome amenities arranged upon arrival.</p>
                  </div>
                  <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gold/10 ring-1 ring-gold/40">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect width="6" height="6" x="2" y="2" rx="1"/><rect width="6" height="6" x="16" y="2" rx="1"/><rect width="6" height="6" x="2" y="16" rx="1"/><path d="M22 16h-3a2 2 0 0 0-2 2v3"/><path d="M22 22v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M2 12h.01"/><path d="M12 2h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M22 12v.01"/><path d="M12 21v-1"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-7 flex gap-3">
              <button
                type="button"
                class="w-1/2 rounded-full border border-gold/40 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-stone-700 transition-all hover:border-gold hover:text-gold dark:text-gold"
                @click="printVoucher"
              >
                Print / Save Pass
              </button>
              <button
                type="button"
                class="w-1/2 rounded-full bg-ink py-3.5 text-center text-xs font-bold uppercase tracking-wider text-gold shadow-lg ring-1 ring-gold/40 transition-all hover:bg-stone-900"
                @click="emit('close')"
              >
                Return to Stays
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
