import type { Hotel } from '../types/hotel.ts';

export const featuredHotels: Hotel[] = [
  {
    id: '1',
    name: 'Oasis Sands Resort',
    location: 'Palm Jumeirah, Dubai',
    rating: 5,
    reviewsCount: 218,
    pricePerNight: 350,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    badge: 'Homestay'
  },
  {
    id: '2',
    name: 'Blue Saroza Drogba',
    location: 'Surabaya, Indonesia',
    rating: 5,
    reviewsCount: 104,
    pricePerNight: 120,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    badge: 'Comfort Hotel'
  },
  {
    id: '3',
    name: 'Luxury Comfort Stays',
    location: 'Malang, Indonesia',
    rating: 5,
    reviewsCount: 102,
    pricePerNight: 200,
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    badge: 'Hotel Indonesia'
  }
];