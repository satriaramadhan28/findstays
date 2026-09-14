import type { Hotel } from '../types/hotel';

export interface BookingRecord {
  id?: string;
  hotelName: string;
  location: string;
  pricePerNight?: number;
  guestName: string;
  email: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  paymentMethod?: string;
  createdAt?: string;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

const fallbackHotels: Hotel[] = [
  {
    id: 'fallback-1',
    name: 'Emerald Valley Lodge',
    location: 'Surabaya, Indonesia',
    rating: 4,
    reviewsCount: 104,
    pricePerNight: 145,
    imageUrl: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
    badge: 'Popular',
    description: 'A comfortable hotel in Surabaya with warm hospitality and convenient access to city attractions.',
    amenities: ['Free Wi‑Fi', 'Breakfast', 'Parking', 'Air Conditioning'],
  },
  {
    id: 'fallback-2',
    name: 'Blue Saroza Drogba Comfort Hotel',
    location: 'Surabaya, Indonesia',
    rating: 4,
    reviewsCount: 104,
    pricePerNight: 120,
    imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    badge: 'Comfort',
    description: 'A stylish stay designed for restful nights, business travel, and quick access to local hotspots.',
    amenities: ['Free Wi‑Fi', 'Gym', 'Breakfast', 'Housekeeping'],
  },
  {
    id: 'fallback-3',
    name: 'Luxury Comfort Stays Hotel Indonesia',
    location: 'Malang, Indonesia',
    rating: 5,
    reviewsCount: 102,
    pricePerNight: 180,
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    badge: 'Premium',
    description: 'A premium experience for travelers seeking elegance, comfort, and a memorable vacation mood.',
    amenities: ['Pool', 'Free Wi‑Fi', 'Breakfast', 'Airport Transfer'],
  },
];

export async function fetchHotelsFromApi(): Promise<Hotel[]> {
  try {
    const response = await fetch('http://localhost:3001/api/hotels');

    if (!response.ok) {
      throw new Error(`Hotel API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const hotels = payload?.data ?? fallbackHotels;

    return Array.isArray(hotels) ? hotels.map(mapDatabaseHotel) : fallbackHotels;
  } catch (error) {
    console.warn('Using fallback hotel data because the backend is unavailable.', error);
    return fallbackHotels;
  }
}

export async function saveBookingToApi(payload: BookingRecord | Record<string, unknown>) {
  const response = await fetch('http://localhost:3001/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload?.message || 'Unable to save booking');
  }

  return response.json();
}

export async function fetchBookingsFromApi(): Promise<BookingRecord[]> {
  try {
    const response = await fetch('http://localhost:3001/api/bookings');

    if (!response.ok) {
      throw new Error(`Booking API request failed with status ${response.status}`);
    }

    const payload = await response.json();
    return Array.isArray(payload?.data) ? (payload.data as BookingRecord[]) : [];
  } catch (error) {
    console.warn('Using local booking fallback because the backend is unavailable.', error);
    const saved = localStorage.getItem('findstays-bookings');
    return saved ? (JSON.parse(saved) as BookingRecord[]) : [];
  }
}

export async function createHotelInDatabase(hotel: Hotel) {
  const response = await fetch('http://localhost:3001/api/hotels', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(hotel) });
  if (!response.ok) throw new Error('Unable to create hotel');
}

export async function updateHotelInDatabase(hotel: Hotel) {
  const response = await fetch(`http://localhost:3001/api/hotels/${hotel.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(hotel) });
  if (!response.ok) throw new Error('Unable to update hotel');
}

export async function deleteHotelFromDatabase(hotelId: string) {
  const response = await fetch(`http://localhost:3001/api/hotels/${hotelId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Unable to delete hotel');
}

function mapDatabaseHotel(hotel: Record<string, unknown>): Hotel {
  return {
    id: String(hotel.id),
    name: String(hotel.name),
    location: String(hotel.location),
    rating: Number(hotel.rating ?? 0),
    reviewsCount: Number(hotel.reviews_count ?? 0),
    pricePerNight: Number(hotel.price_per_night ?? 0),
    imageUrl: String(hotel.image_url ?? FALLBACK_IMAGE),
    badge: hotel.badge ? String(hotel.badge) : undefined,
    description: hotel.description ? String(hotel.description) : undefined,
    amenities: Array.isArray(hotel.amenities) ? hotel.amenities.map(String) : [],
  };
}

function mapDatabaseBooking(booking: Record<string, unknown>): BookingRecord {
  return {
    id: booking.id ? String(booking.id) : undefined,
    hotelName: String(booking.hotel_name),
    location: String(booking.location),
    pricePerNight: booking.price_per_night ? Number(booking.price_per_night) : undefined,
    guestName: String(booking.guest_name),
    email: String(booking.email),
    phone: booking.phone ? String(booking.phone) : undefined,
    checkIn: String(booking.check_in),
    checkOut: String(booking.check_out),
    paymentMethod: booking.payment_method ? String(booking.payment_method) : undefined,
    createdAt: booking.created_at ? String(booking.created_at) : undefined,
  };
}
