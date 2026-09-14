<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import HeroSearch from './components/HeroSearch.vue';
import FeaturedHotelCard from './components/FeaturedHotelCard.vue';
import HotelCard from './components/HotelCard.vue';
import Testimonials from './components/Testimonials.vue';
import Footer from './components/Footer.vue';
import AdminDashboard from './components/AdminDashboard.vue';
import HotelDetailModal from './components/HotelDetailModal.vue';
import WishlistDrawer from './components/WishlistDrawer.vue';
import ToastNotification from './components/ToastNotification.vue';
import router from './router';
import type { Hotel } from './types/hotel';
import { featuredHotels, bestListHotels, testimonials } from './data/hotels';
import {
  fetchHotelsFromApi,
  fetchBookingsFromApi,
  saveBookingToApi,
  type BookingRecord,
} from './services/hotelApi';

// Admin Auth
const adminCredentials = {
  email: 'admin@findstays.com',
  password: 'admin123',
};

// State
const query = ref('');
const visibleCount = ref(6);
const selectedHotel = ref<Hotel | null>(null);
const isHotelModalOpen = ref(false);
const isWishlistOpen = ref(false);

const apiHotels = ref<Hotel[]>([]);
const adminHotels = ref<Hotel[]>([]);
const isLoading = ref(false);

// Filter states
const selectedCategory = ref<string>('all');
const maxPrice = ref<number>(700);
const minRating = ref<number>(0);

// View & Auth Modals
const currentView = ref<'home' | 'admin'>('home');
const isAuthModalOpen = ref(false);
const isAdminLoginModalOpen = ref(false);
const authMode = ref<'login' | 'register'>('login');
const currentUser = ref<{ name: string; email: string; role?: 'admin' | 'user' } | null>(null);

const adminLoginForm = ref({
  email: adminCredentials.email,
  password: adminCredentials.password,
});

const authForm = ref({
  name: '',
  email: '',
  password: '',
});

// Bookings & Search Filters
const bookings = ref<BookingRecord[]>([]);
const searchFilters = ref({
  location: '',
  person: '2 Guests, 1 Suite',
  checkIn: '',
  checkOut: '',
});

// Toast notification state
const toast = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'info' | 'error',
});
let toastTimeout: any = null;

function showToast(message: string, type: 'success' | 'info' | 'error' = 'success') {
  if (toastTimeout) clearTimeout(toastTimeout);
  toast.value = { show: true, message, type };
  toastTimeout = setTimeout(() => {
    toast.value.show = false;
  }, 3500);
}

// Curated Luxury Categories
const categoryTabs = [
  { id: 'all', label: 'All Sanctuaries', icon: '✦' },
  { id: 'villa', label: 'Villas & Rainforest', icon: '🌴' },
  { id: 'city', label: 'Metropolitan Luxury', icon: '🏙️' },
  { id: 'beach', label: 'Coastal Palazzos', icon: '🌊' },
  { id: 'mountain', label: 'Alpine Chalets', icon: '⛰️' },
  { id: 'eco', label: 'Eco Zen Havens', icon: '🌿' },
];

const sourceHotels = computed(() => {
  if (adminHotels.value.length) return adminHotels.value;
  if (apiHotels.value.length) return apiHotels.value;
  return bestListHotels;
});

const isAdminUser = computed(() => currentUser.value?.role === 'admin' || currentUser.value?.email.toLowerCase() === adminCredentials.email);

function syncViewFromRoute() {
  if (router.currentRoute.value.path === '/admin') {
    if (isAdminUser.value) {
      currentView.value = 'admin';
    } else {
      currentView.value = 'home';
      isAdminLoginModalOpen.value = true;
    }
    return;
  }
  currentView.value = 'home';
}

// Advanced Filtering logic
const filteredHotels = computed(() => {
  const q = query.value.trim().toLowerCase();
  const locationQuery = searchFilters.value.location.trim().toLowerCase();

  return sourceHotels.value.filter((hotel) => {
    const matchesText =
      !q ||
      hotel.name.toLowerCase().includes(q) ||
      hotel.location.toLowerCase().includes(q) ||
      (hotel.country && hotel.country.toLowerCase().includes(q)) ||
      (hotel.description && hotel.description.toLowerCase().includes(q));

    const matchesLocation =
      !locationQuery ||
      hotel.location.toLowerCase().includes(locationQuery) ||
      hotel.name.toLowerCase().includes(locationQuery) ||
      (hotel.country && hotel.country.toLowerCase().includes(locationQuery));

    const matchesCategory =
      selectedCategory.value === 'all' ||
      hotel.category === selectedCategory.value ||
      (hotel.categoryLabel && hotel.categoryLabel.toLowerCase().includes(selectedCategory.value));

    const matchesPrice = !hotel.pricePerNight || hotel.pricePerNight <= maxPrice.value;
    const matchesRating = minRating.value === 0 || hotel.rating >= minRating.value;

    return matchesText && matchesLocation && matchesCategory && matchesPrice && matchesRating;
  });
});

function resetFilters() {
  query.value = '';
  selectedCategory.value = 'all';
  maxPrice.value = 700;
  minRating.value = 0;
  searchFilters.value.location = '';
  showToast('Filters have been cleared.', 'info');
}

function openHotelDetail(hotel: Hotel) {
  selectedHotel.value = hotel;
  isHotelModalOpen.value = true;
}

function handleFavoriteToggle(hotel: Hotel, isAdded: boolean) {
  if (isAdded) {
    showToast(`Added ${hotel.name} to your private dossier!`, 'success');
  } else {
    showToast(`Removed ${hotel.name} from saved dossier.`, 'info');
  }
}

async function handleBookingConfirmed(voucherData: any) {
  const newBooking: BookingRecord = {
    id: voucherData.bookingCode,
    hotelName: voucherData.hotelName,
    location: voucherData.location,
    pricePerNight: voucherData.pricePerNight,
    guestName: voucherData.guestName,
    email: voucherData.email,
    phone: voucherData.phone,
    checkIn: voucherData.checkIn,
    checkOut: voucherData.checkOut,
    paymentMethod: voucherData.paymentMethod,
    createdAt: voucherData.createdAt,
  };

  try {
    const response = await saveBookingToApi(newBooking);
    const savedBooking = response?.data ?? newBooking;
    bookings.value = [savedBooking, ...bookings.value];
    localStorage.setItem('findstays-bookings', JSON.stringify(bookings.value));
  } catch {
    bookings.value = [newBooking, ...bookings.value];
    localStorage.setItem('findstays-bookings', JSON.stringify(bookings.value));
  }

  showToast(`Privilege Pass confirmed for ${voucherData.hotelName}!`, 'success');
}

function cancelBooking(bookingId?: string) {
  if (!bookingId) return;
  if (confirm('Are you sure you wish to release this reservation?')) {
    bookings.value = bookings.value.filter((b) => b.id !== bookingId);
    localStorage.setItem('findstays-bookings', JSON.stringify(bookings.value));
    showToast('Reservation has been released.', 'info');
  }
}

function handleHeroSearch(params: {
  location: string;
  person: string;
  checkIn: string;
  checkOut: string;
}) {
  searchFilters.value = {
    location: params.location,
    person: params.person,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
  };
  visibleCount.value = 6;
  document.getElementById('best-list')?.scrollIntoView({ behavior: 'smooth' });
  if (params.location) {
    showToast(`Searching secluded sanctuaries in ${params.location}...`, 'info');
  }
}

function scrollToBookings() {
  document.getElementById('my-bookings')?.scrollIntoView({ behavior: 'smooth' });
}

// User auth handlers
function openAuthModal(mode: 'login' | 'register') {
  authMode.value = mode;
  isAuthModalOpen.value = true;
}

function closeAuthModal() {
  isAuthModalOpen.value = false;
  authForm.value = { name: '', email: '', password: '' };
}

function submitAuth() {
  const email = authForm.value.email.trim();
  const password = authForm.value.password.trim();

  if (!email || !password) {
    showToast('Please provide your credentials.', 'error');
    return;
  }

  if (authMode.value === 'register' && !authForm.value.name.trim()) {
    showToast('Please provide your full name.', 'error');
    return;
  }

  if (authMode.value === 'register') {
    currentUser.value = {
      name: authForm.value.name.trim(),
      email,
      role: email.toLowerCase() === adminCredentials.email ? 'admin' : 'user',
    };
    showToast(`Welcome to FindStays Privilege, ${authForm.value.name.trim()}!`, 'success');
  } else {
    currentUser.value = {
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      role: email.toLowerCase() === adminCredentials.email ? 'admin' : 'user',
    };
    showToast('Welcome back. Signed in successfully.', 'success');
  }

  localStorage.setItem('findstays-user', JSON.stringify(currentUser.value));
  closeAuthModal();
}

function logoutUser() {
  currentUser.value = null;
  localStorage.removeItem('findstays-user');
  showToast('You have been signed out.', 'info');
}

// Admin modal
function openAdminView() {
  router.push('/admin');
  if (isAdminUser.value) {
    currentView.value = 'admin';
    return;
  }
  currentView.value = 'home';
  isAdminLoginModalOpen.value = true;
}

function closeAdminLoginModal() {
  isAdminLoginModalOpen.value = false;
  adminLoginForm.value = {
    email: adminCredentials.email,
    password: adminCredentials.password,
  };
}

function submitAdminLogin() {
  const email = adminLoginForm.value.email.trim().toLowerCase();
  const password = adminLoginForm.value.password.trim();

  if (email !== adminCredentials.email || password !== adminCredentials.password) {
    showToast('Invalid admin credentials.', 'error');
    return;
  }

  currentUser.value = { name: 'Admin Manager', email, role: 'admin' };
  localStorage.setItem('findstays-user', JSON.stringify(currentUser.value));
  closeAdminLoginModal();
  currentView.value = 'admin';
  router.push('/admin');
  showToast('Welcome to FindStays Admin Dashboard.', 'success');
}

function closeAdminView() {
  currentView.value = 'home';
  router.push('/');
}

// Data loaders
async function loadHotels() {
  isLoading.value = true;
  try {
    const hotels = await fetchHotelsFromApi();
    if (hotels.length) apiHotels.value = hotels;
  } catch (e) {
    apiHotels.value = [];
  } finally {
    isLoading.value = false;
  }
}

async function loadBookings() {
  try {
    bookings.value = await fetchBookingsFromApi();
    localStorage.setItem('findstays-bookings', JSON.stringify(bookings.value));
  } catch {
    const saved = localStorage.getItem('findstays-bookings');
    bookings.value = saved ? JSON.parse(saved) : [];
  }
}

function loadUser() {
  const saved = localStorage.getItem('findstays-user');
  if (saved) {
    try {
      currentUser.value = JSON.parse(saved);
    } catch {
      currentUser.value = null;
    }
  }
}

onMounted(() => {
  loadUser();
  syncViewFromRoute();
  loadHotels();
  loadBookings();
  router.afterEach(syncViewFromRoute);
});
</script>

<template>
  <div class="min-h-screen bg-paper text-ink transition-colors duration-500 dark:bg-ink dark:text-paper font-sans selection:bg-gold selection:text-ink">
    <!-- Navbar -->
    <Navbar
      v-if="currentView === 'home'"
      :user="currentUser"
      :bookings-count="bookings.length"
      @open-auth="openAuthModal"
      @open-wishlist="isWishlistOpen = true"
      @open-bookings="scrollToBookings"
      @logout="logoutUser"
    />

    <!-- Admin Panel -->
    <AdminDashboard
      v-else
      :bookings="bookings"
      :hotels="sourceHotels"
      :user="currentUser"
      @close="closeAdminView"
    />

    <!-- Main Content -->
    <main v-if="currentView === 'home'">
      <!-- Hero Section with Luxury Search -->
      <HeroSearch id="hero" @search="handleHeroSearch" />

      <!-- Section: Featured Hotels 2026 -->
      <section id="featured" class="mx-auto max-w-7xl px-6 py-24">
        <div class="mb-14 text-center">
          <div class="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
            <span>✦ The Grand Anthology ✦</span>
          </div>
          <h2 class="mt-4 font-display text-3xl font-bold md:text-5xl text-ink dark:text-paper">
            Distinguished Sanctuaries of 2026
          </h2>
          <p class="mx-auto mt-3 max-w-lg text-sm text-stone-600 dark:text-stone-400 font-light">
            Architectural masterpieces, private valleys, and alpine lodges selected for their extraordinary discretion.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          <FeaturedHotelCard
            :hotel="featuredHotels[0]"
            class="md:row-span-2"
            @select="openHotelDetail"
            @toggle-favorite="handleFavoriteToggle"
          />
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-1">
            <FeaturedHotelCard
              :hotel="featuredHotels[1]"
              size="small"
              @select="openHotelDetail"
              @toggle-favorite="handleFavoriteToggle"
            />
            <FeaturedHotelCard
              :hotel="featuredHotels[2]"
              size="small"
              @select="openHotelDetail"
              @toggle-favorite="handleFavoriteToggle"
            />
          </div>
        </div>
      </section>

      <!-- Section: The FindStays Distinction (Luxury Editorial Pillars) -->
      <section id="distinction" class="border-y border-gold/20 bg-stone-100/50 py-20 dark:bg-stone-950/60">
        <div class="mx-auto max-w-7xl px-6">
          <div class="text-center max-w-2xl mx-auto mb-16">
            <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">✦ Haute Hospitality Standards ✦</span>
            <h2 class="font-display text-3xl md:text-4xl font-bold mt-2 text-ink dark:text-paper">The FindStays Distinction</h2>
            <p class="text-xs text-stone-500 mt-2 font-light leading-relaxed">
              Every property in our private ledger undergoes stringent 120-point vetting for architectural integrity, privacy standards, and bespoke guest care.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="luxury-card rounded-3xl border border-gold/20 bg-paper p-8 shadow-sm dark:bg-stone-900">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold mb-6 ring-1 ring-gold/40">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                </svg>
              </div>
              <h3 class="font-display text-lg font-bold text-ink dark:text-paper">Private Transit &amp; Aviation</h3>
              <p class="mt-2 text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                Direct tarmac coordination, helicopter transfers, and chauffeur limousine reception directly to your private villa entrance.
              </p>
            </div>

            <div class="luxury-card rounded-3xl border border-gold/20 bg-paper p-8 shadow-sm dark:bg-stone-900">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold mb-6 ring-1 ring-gold/40">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/>
                </svg>
              </div>
              <h3 class="font-display text-lg font-bold text-ink dark:text-paper">Michelin In-Suite Dining</h3>
              <p class="mt-2 text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                Personal sommeliers, organic farm-to-table tasting courses, and private chef dinners arranged within your courtyard.
              </p>
            </div>

            <div class="luxury-card rounded-3xl border border-gold/20 bg-paper p-8 shadow-sm dark:bg-stone-900">
              <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold mb-6 ring-1 ring-gold/40">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <h3 class="font-display text-lg font-bold text-ink dark:text-paper">Dedicated 24/7 Butler</h3>
              <p class="mt-2 text-xs text-stone-500 dark:text-stone-400 font-light leading-relaxed">
                Clefs d’Or-trained concierge on call for bespoke yacht charters, private museum after-hours access, and itinerary curation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Explore Best List -->
      <section id="best-list" class="mx-auto max-w-7xl px-6 py-20 scroll-mt-20">
        <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              <span>✦ The Curated Ledger ✦</span>
            </div>
            <h2 class="mt-3 font-display text-3xl font-bold md:text-5xl text-ink dark:text-paper">
              The Private Stays Collection
            </h2>
            <p class="mt-2 max-w-lg text-sm text-stone-600 dark:text-stone-400 font-light">
              Filtered by architectural distinction, private amenities, and refined wellness.
            </p>
          </div>

          <!-- Search Input Box -->
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-3 rounded-full border border-gold/30 bg-paper px-5 py-3 shadow-md transition-all focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/30 dark:border-white/15 dark:bg-stone-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                v-model="query"
                type="text"
                placeholder="Search estates or destinations..."
                class="w-52 bg-transparent text-xs font-semibold outline-none placeholder:text-stone-400 placeholder:font-normal text-ink dark:text-paper sm:w-64"
              />
            </label>
          </div>
        </div>

        <!-- Filter Console: Category Tabs & Sliders -->
        <div class="mt-10 space-y-5 rounded-[2.5rem] border border-gold/30 bg-stone-50/80 p-6 dark:border-white/10 dark:bg-stone-900/70 shadow-lg">
          <!-- Category Tabs -->
          <div class="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              v-for="tab in categoryTabs"
              :key="tab.id"
              type="button"
              class="flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all"
              :class="
                selectedCategory === tab.id
                  ? 'bg-gradient-to-r from-gold via-gold-light to-gold text-ink shadow-md font-bold'
                  : 'bg-paper text-stone-600 hover:border-gold dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-white/10'
              "
              @click="selectedCategory = tab.id"
            >
              <span>{{ tab.icon }}</span>
              <span>{{ tab.label }}</span>
            </button>
          </div>

          <!-- Secondary Filters: Max Price & Star Rating & Reset -->
          <div class="flex flex-wrap items-center justify-between gap-5 border-t border-stone-200/80 pt-4 text-xs dark:border-white/5">
            <div class="flex flex-wrap items-center gap-6">
              <!-- Max Price Slider -->
              <div class="flex items-center gap-3">
                <span class="font-bold uppercase tracking-wider text-[11px] text-gold">Max Nightly:</span>
                <input
                  v-model.number="maxPrice"
                  type="range"
                  min="100"
                  max="700"
                  step="25"
                  class="accent-gold cursor-pointer w-28 sm:w-36"
                />
                <span class="font-bold text-ink dark:text-paper font-mono text-sm">${{ maxPrice }}</span>
              </div>

              <!-- Rating quick pills -->
              <div class="flex items-center gap-2">
                <span class="font-bold uppercase tracking-wider text-[11px] text-gold">Grade:</span>
                <button
                  type="button"
                  class="rounded-lg px-3 py-1 text-[11px] font-bold border transition-all"
                  :class="minRating === 0 ? 'bg-gold text-ink border-gold' : 'border-stone-300 dark:border-white/10 text-stone-600 dark:text-stone-300'"
                  @click="minRating = 0"
                >All Grades</button>
                <button
                  type="button"
                  class="rounded-lg px-3 py-1 text-[11px] font-bold border transition-all flex items-center gap-1"
                  :class="minRating === 5 ? 'bg-gold text-ink border-gold' : 'border-stone-300 dark:border-white/10 text-stone-600 dark:text-stone-300'"
                  @click="minRating = 5"
                >5.0 ★ Exceptional</button>
              </div>
            </div>

            <!-- Match Count & Reset -->
            <div class="flex items-center gap-4">
              <span class="text-stone-500 text-xs">Curating <strong>{{ filteredHotels.length }}</strong> sanctuaries</span>
              <button
                type="button"
                class="font-bold uppercase tracking-wider text-gold hover:underline text-[11px]"
                @click="resetFilters"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Hotels Grid -->
        <div v-if="filteredHotels.length === 0" class="my-20 flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-gold/30 p-16 text-center">
          <p class="font-display text-xl font-bold text-ink dark:text-paper">No boutique sanctuaries meet this exact criterion</p>
          <p class="mt-2 text-xs text-stone-500 font-light">Adjust your budget slider or destination keyword to view other private retreats.</p>
          <button
            type="button"
            class="mt-5 rounded-full bg-gold px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-ink shadow-lg"
            @click="resetFilters"
          >
            Reset All Filters
          </button>
        </div>

        <div v-else class="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <HotelCard
            v-for="hotel in filteredHotels.slice(0, visibleCount)"
            :key="hotel.id"
            :hotel="hotel"
            @click="openHotelDetail"
            @toggle-favorite="handleFavoriteToggle"
          />
        </div>

        <!-- Load More Button -->
        <div v-if="visibleCount < filteredHotels.length" class="mt-16 flex justify-center">
          <button
            type="button"
            class="rounded-full border border-gold/40 bg-paper px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-ink shadow-md transition-all hover:bg-gold hover:text-ink hover:shadow-xl dark:border-gold/40 dark:bg-stone-900 dark:text-gold"
            @click="visibleCount += 3"
          >
            Load Additional Sanctuaries ({{ filteredHotels.length - visibleCount }} remaining)
          </button>
        </div>
      </section>

      <!-- VIP Member Privileges Banner -->
      <section class="mx-auto max-w-7xl px-6 py-8">
        <div class="relative overflow-hidden rounded-[3rem] border border-gold/40 bg-gradient-to-r from-ink via-stone-900 to-ink p-10 md:p-14 text-paper shadow-2xl">
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div class="max-w-xl">
              <span class="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">✦ FindStays Black Tier ✦</span>
              <h3 class="font-display text-2xl md:text-4xl font-bold mt-2 text-paper">
                Elevate to Private Membership
              </h3>
              <p class="mt-3 text-xs md:text-sm text-stone-300 font-light leading-relaxed">
                Enjoy guaranteed 12:00 PM check-in, chilled vintage champagne upon arrival, complimentary spa credits, and automatic suite upgrades across all partnering luxury estates.
              </p>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-full bg-gradient-to-r from-gold via-gold-light to-gold px-8 py-4 text-xs font-bold uppercase tracking-widest text-ink shadow-xl transition-transform hover:scale-105"
              @click="openAuthModal('register')"
            >
              Request VIP Invitation
            </button>
          </div>
        </div>
      </section>

      <!-- Section: My Reservations / Bookings -->
      <section id="my-bookings" class="mx-auto max-w-7xl px-6 py-20 scroll-mt-20">
        <div class="flex items-end justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
              <span>✦ Active Itineraries ✦</span>
            </div>
            <h2 class="mt-3 font-display text-3xl font-bold md:text-5xl text-ink dark:text-paper">
              My Reserved Sanctuaries
            </h2>
            <p class="mt-2 text-sm text-stone-600 dark:text-stone-400 font-light">
              View your guaranteed booking reference codes, arrival details, and concierge e-passes.
            </p>
          </div>
        </div>

        <div v-if="bookings.length === 0" class="mt-10 rounded-[2.5rem] border border-dashed border-gold/30 bg-stone-50/50 p-16 text-center dark:bg-stone-900/40">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold ring-1 ring-gold/40">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
          </div>
          <p class="font-display text-xl font-bold text-ink dark:text-paper">No active reservations in your ledger</p>
          <p class="mt-1.5 text-xs text-stone-500 font-light">Select any boutique sanctuary above to authorize instant e-pass confirmation.</p>
        </div>

        <div v-else class="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="booking in bookings"
            :key="booking.id"
            class="luxury-card flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-gold/30 bg-paper shadow-xl dark:bg-stone-950"
          >
            <!-- Card Top Header -->
            <div class="border-b border-gold/20 bg-stone-900 p-6 text-paper">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <span class="font-mono text-[10px] font-bold text-gold uppercase tracking-widest">{{ booking.id || 'FS-CONFIRMED' }}</span>
                  <h4 class="font-display text-xl font-bold text-paper mt-0.5">{{ booking.hotelName }}</h4>
                  <p class="text-xs text-stone-300 font-light">{{ booking.location }}</p>
                </div>
                <span class="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Confirmed
                </span>
              </div>
            </div>

            <!-- Card Details -->
            <div class="p-6 space-y-3 text-xs text-stone-600 dark:text-stone-300 flex-1">
              <div class="flex items-center justify-between">
                <span class="text-gold font-bold uppercase text-[10px] tracking-wider">Primary Traveler:</span>
                <span class="font-bold text-ink dark:text-paper">{{ booking.guestName }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gold font-bold uppercase text-[10px] tracking-wider">Itinerary:</span>
                <span class="font-semibold text-ink dark:text-paper">{{ booking.checkIn }} &rarr; {{ booking.checkOut }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gold font-bold uppercase text-[10px] tracking-wider">Direct Email:</span>
                <span class="truncate max-w-[170px] font-medium">{{ booking.email }}</span>
              </div>
              <div v-if="booking.paymentMethod" class="flex items-center justify-between">
                <span class="text-gold font-bold uppercase text-[10px] tracking-wider">Method:</span>
                <span class="font-semibold">{{ booking.paymentMethod }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="border-t border-stone-200/80 p-5 flex items-center justify-between gap-3 dark:border-white/5">
              <button
                type="button"
                class="text-xs font-bold uppercase tracking-wider text-rose-500 hover:underline"
                @click="cancelBooking(booking.id)"
              >
                Release Stay
              </button>
              <button
                type="button"
                class="rounded-full bg-gold px-5 py-2 text-xs font-bold uppercase tracking-wider text-ink shadow-md hover:bg-gold-light"
                @click="showToast(`Pass ${booking.id || ''} verified with hotel concierge.`, 'info')"
              >
                View E-Pass
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- Section: Verified Testimonials -->
      <Testimonials id="testimonials" :testimonials="testimonials" />
    </main>

    <!-- Footer -->
    <Footer
      v-if="currentView === 'home'"
      id="footer"
      :show-admin-button="true"
      @open-admin="openAdminView"
    />

    <!-- Hotel Detail & Booking Modal -->
    <HotelDetailModal
      :show="isHotelModalOpen"
      :hotel="selectedHotel"
      :user="currentUser"
      :initial-check-in="searchFilters.checkIn"
      :initial-check-out="searchFilters.checkOut"
      :initial-guests="searchFilters.person"
      @close="isHotelModalOpen = false; selectedHotel = null"
      @request-auth="isHotelModalOpen = false; openAuthModal('login')"
      @booking-confirmed="handleBookingConfirmed"
    />

    <!-- Wishlist Drawer -->
    <WishlistDrawer
      :show="isWishlistOpen"
      :hotels="sourceHotels"
      @close="isWishlistOpen = false"
      @select="openHotelDetail"
    />

    <!-- Toast Notification -->
    <ToastNotification
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @close="toast.show = false"
    />

    <!-- Auth Modal (Sign in / Register) -->
    <Teleport to="body">
      <div
        v-if="isAuthModalOpen"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-xl"
        @click.self="closeAuthModal"
      >
        <div class="w-full max-w-md rounded-[2.5rem] border border-gold/40 bg-paper p-8 shadow-2xl dark:bg-stone-950">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">✦ FindStays Membership ✦</p>
              <h3 class="mt-1 font-display text-2xl font-bold text-ink dark:text-paper">
                {{ authMode === 'login' ? 'Private Portal Sign In' : 'Join Privilege Membership' }}
              </h3>
            </div>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-stone-500 hover:text-gold dark:text-stone-300"
              @click="closeAuthModal"
            >
              ✕
            </button>
          </div>

          <form class="mt-7 space-y-4" @submit.prevent="submitAuth">
            <div v-if="authMode === 'register'">
              <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Full Name (As on Passport)</label>
              <input
                v-model="authForm.name"
                type="text"
                class="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-900 dark:text-paper"
                placeholder="e.g. Satria Ramadhan"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Confidential Email</label>
              <input
                v-model="authForm.email"
                type="email"
                class="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-900 dark:text-paper"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Security Password</label>
              <input
                v-model="authForm.password"
                type="password"
                class="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-900 dark:text-paper"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              class="w-full rounded-full bg-gradient-to-r from-gold via-gold-light to-gold py-3.5 text-xs font-bold uppercase tracking-widest text-ink shadow-xl transition-all hover:scale-[1.02]"
            >
              {{ authMode === 'login' ? 'Authorize & Access' : 'Register Privilege Account' }}
            </button>
          </form>

          <div class="mt-6 text-center text-xs text-stone-500 dark:text-stone-400">
            {{ authMode === 'login' ? "Not yet registered?" : 'Already a registered member?' }}
            <button
              type="button"
              class="ml-1 font-bold text-gold hover:underline"
              @click="authMode = authMode === 'login' ? 'register' : 'login'"
            >
              {{ authMode === 'login' ? 'Apply for access' : 'Sign in here' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Admin Login Modal -->
    <Teleport to="body">
      <div
        v-if="isAdminLoginModalOpen"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-xl"
        @click.self="closeAdminLoginModal"
      >
        <div class="w-full max-w-md rounded-[2.5rem] border border-gold/40 bg-paper p-8 shadow-2xl dark:bg-stone-950">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">✦ Internal Portal ✦</p>
              <h3 class="mt-1 font-display text-2xl font-bold text-ink dark:text-paper">Admin Management</h3>
            </div>
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 text-stone-500 hover:text-gold dark:text-stone-300"
              @click="closeAdminLoginModal"
            >
              ✕
            </button>
          </div>

          <form class="mt-7 space-y-4" @submit.prevent="submitAdminLogin">
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Admin Email</label>
              <input
                v-model="adminLoginForm.email"
                type="email"
                class="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-900 dark:text-paper"
              />
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-gold">Password</label>
              <input
                v-model="adminLoginForm.password"
                type="password"
                class="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-stone-900 dark:text-paper"
              />
            </div>

            <button
              type="submit"
              class="w-full rounded-full bg-ink py-3.5 text-xs font-bold uppercase tracking-widest text-gold ring-1 ring-gold/40 transition-all hover:bg-stone-900"
            >
              Authorize Management
            </button>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
