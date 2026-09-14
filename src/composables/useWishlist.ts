import { ref, computed } from 'vue';

const wishlist = ref<string[]>([]);

function initWishlist() {
  try {
    const saved = localStorage.getItem('findstays-wishlist');
    if (saved) {
      wishlist.value = JSON.parse(saved);
    }
  } catch {
    wishlist.value = [];
  }
}

// Initialise once on import
initWishlist();

export function useWishlist() {
  function isFavorite(hotelId: string): boolean {
    return wishlist.value.includes(hotelId);
  }

  function toggleFavorite(hotelId: string): boolean {
    const idx = wishlist.value.indexOf(hotelId);
    let added = false;
    if (idx >= 0) {
      wishlist.value.splice(idx, 1);
      added = false;
    } else {
      wishlist.value.push(hotelId);
      added = true;
    }
    try {
      localStorage.setItem('findstays-wishlist', JSON.stringify(wishlist.value));
    } catch (e) {
      console.error(e);
    }
    return added;
  }

  const favoriteCount = computed(() => wishlist.value.length);
  const favoriteIds = computed(() => wishlist.value);

  return {
    wishlist,
    favoriteCount,
    favoriteIds,
    isFavorite,
    toggleFavorite,
  };
}
