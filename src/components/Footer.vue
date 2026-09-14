<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  showAdminButton?: boolean;
}>();

const emit = defineEmits<{
  'open-admin': [];
}>();

const email = ref('');
const subscribed = ref(false);

const columns = [
  {
    title: 'The Collection',
    links: [
      { label: 'Rainforest Villas', href: '#best-list' },
      { label: 'Cliffside Palazzos', href: '#best-list' },
      { label: 'Alpine Chalets', href: '#best-list' },
      { label: 'Zen Heritage Estates', href: '#best-list' },
    ],
  },
  {
    title: 'Privilege & Concierge',
    links: [
      { label: 'VIP Member Perks', href: '#distinction' },
      { label: 'Private Jet Coordination', href: '#distinction' },
      { label: 'Bespoke Itineraries', href: '#distinction' },
      { label: 'Verified Guest Journals', href: '#testimonials' },
    ],
  },
  {
    title: 'Legal & Discretion',
    links: [
      { label: 'Privacy & Discretion Protocol', href: '#' },
      { label: 'Terms of Haute Hospitality', href: '#' },
      { label: 'Cookie Preferences', href: '#' },
      { label: 'Sustainability Manifesto', href: '#' },
    ],
  },
];

function scrollTo(href: string) {
  if (href === '#') return;
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
}

function handleSubscribe() {
  subscribed.value = true;
  email.value = '';
  setTimeout(() => (subscribed.value = false), 3500);
}
</script>

<template>
  <footer class="bg-ink pb-12 pt-20 border-t border-gold/20 text-paper">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid grid-cols-1 gap-12 border-b border-white/10 pb-16 sm:grid-cols-2 lg:grid-cols-4">
        <!-- Columns 1-3 -->
        <div v-for="col in columns" :key="col.title">
          <h5 class="text-xs font-bold uppercase tracking-[0.25em] text-gold">{{ col.title }}</h5>
          <ul class="mt-5 space-y-3">
            <li v-for="link in col.links" :key="link.label">
              <a
                :href="link.href"
                class="text-xs font-medium text-stone-400 transition-colors hover:text-gold"
                @click.prevent="scrollTo(link.href)"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Column 4: Private Dossier Newsletter -->
        <div class="rounded-3xl border border-gold/30 bg-stone-900/90 p-7 lg:col-span-1 shadow-2xl">
          <span class="text-[9px] font-bold uppercase tracking-[0.3em] text-gold">✦ The Private Dossier ✦</span>
          <p class="font-display text-xl font-bold text-paper mt-1">Exclusive Releases &amp; Private Invitations</p>
          <p class="mt-1.5 text-xs text-stone-400 font-light">Curated monthly journal featuring unlisted boutique estates and member privileges.</p>
          
          <form class="mt-5 flex flex-col gap-2.5" @submit.prevent="handleSubscribe">
            <input
              v-model="email"
              type="email"
              required
              placeholder="Enter your confidential email"
              class="w-full rounded-full border border-white/15 bg-black/50 px-4 py-3 text-xs text-paper outline-none placeholder:text-stone-500 focus:border-gold"
            />
            <button
              type="submit"
              class="w-full rounded-full bg-gradient-to-r from-gold via-gold-light to-gold py-3 text-xs font-bold uppercase tracking-widest text-ink shadow-lg transition-all hover:scale-[1.02]"
            >
              Request Dossier
            </button>
          </form>
          <p v-if="subscribed" class="mt-2.5 text-xs font-semibold text-gold text-center">✓ You have been placed on the private ledger.</p>
        </div>
      </div>

      <!-- Concierge Global Desks -->
      <div class="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-8 text-xs text-stone-400">
        <div class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-gold animate-pulse"></span>
          <span class="text-stone-300 font-medium">Global Concierge Desks:</span>
          <span class="text-gold">London • Paris • Zurich • Tokyo • Singapore • New York</span>
        </div>
        <p class="text-[11px] text-stone-400">24/7 Priority Assistance: <span class="font-mono text-paper font-semibold">+1 (800) FIND-STAYS</span></p>
      </div>

      <!-- Bottom Bar -->
      <div class="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div class="flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-gold text-xs font-bold text-ink">
            FS
          </div>
          <p class="font-display text-base font-bold text-paper tracking-wider">FINDSTAYS <span class="text-xs font-light text-stone-400">Haute Hospitality</span></p>
        </div>

        <div class="flex items-center gap-4">
          <p class="text-xs text-stone-500">© 2026 FindStays International. All rights reserved.</p>
          <button
            v-if="props.showAdminButton !== false"
            type="button"
            class="rounded-full border border-gold/40 px-3.5 py-1 text-[9px] font-bold uppercase tracking-[0.25em] text-gold transition-colors hover:bg-gold hover:text-ink"
            @click="emit('open-admin')"
          >
            Management
          </button>
        </div>
      </div>
    </div>
  </footer>
</template>
