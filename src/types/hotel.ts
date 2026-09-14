export type HotelCategory =
  | 'villa'
  | 'resort'
  | 'city'
  | 'beach'
  | 'mountain'
  | 'eco';

export interface RoomOption {
  id: string;
  name: string;
  pricePerNight: number;
  capacity: string;
  bedType: string;
  sizeSqM: number;
  features: string[];
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  country?: string;
  category?: HotelCategory;
  categoryLabel?: string;
  rating: number;
  reviewsCount: number;
  pricePerNight: number;
  originalPrice?: number;
  imageUrl: string;
  gallery?: string[];
  badge?: string;
  description?: string;
  amenities?: string[];
  rooms?: RoomOption[];
  isFeatured?: boolean;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  country: string;
  hotelName: string;
  hotelLocation: string;
  rating: number;
  reviewsCount: number;
  avatarUrl: string;
  imageUrl: string;
  date?: string;
}
