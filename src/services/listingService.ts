import { apiRequest } from './apiClient';
import { ApiListing, ListingCategory } from './types';

// GET /api/listings?page=1&category=...&q=...&minPrice=...&maxPrice=...&location=...&sort=...
export type GetListingsParams = {
  page?: number;
  category?: ListingCategory | 'all';
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc';
};

export function getListings(params: GetListingsParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.category && params.category !== 'all') query.set('category', params.category);
  if (params.q) query.set('q', params.q);
  if (params.minPrice !== undefined) query.set('minPrice', String(params.minPrice));
  if (params.maxPrice !== undefined) query.set('maxPrice', String(params.maxPrice));
  if (params.location) query.set('location', params.location);
  if (params.sort) query.set('sort', params.sort);

  const qs = query.toString();
  return apiRequest<{
    listings: ApiListing[];
    page: number;
    hasMore: boolean;
    total: number;
  }>(`/listings${qs ? `?${qs}` : ''}`);
}

export function getMyListings(status?: 'active' | 'sold' | 'archived' | 'all') {
  const qs = status && status !== 'all' ? `?status=${status}` : '';
  return apiRequest<{ listings: ApiListing[] }>(`/listings/mine${qs}`);
}

export function getFavorites() {
  return apiRequest<{ listings: ApiListing[] }>('/listings/favorites');
}

export function getListing(id: string) {
  return apiRequest<{ listing: ApiListing }>(`/listings/${id}`);
}

export type CreateListingInput = {
  title: string;
  description: string;
  price: number;
  currency?: 'NGN' | 'USD' | 'EUR' | 'GBP';
  negotiable?: boolean;
  category?: ListingCategory;
  condition?: 'new' | 'used' | 'refurbished' | 'not_applicable';
  images?: string[];
  location?: string;
};

export function createListing(input: CreateListingInput) {
  return apiRequest<{ listing: ApiListing }>('/listings', {
    method: 'POST',
    body: input,
  });
}

export type UpdateListingInput = Partial<CreateListingInput> & {
  status?: 'active' | 'sold' | 'archived';
};

export function updateListing(id: string, input: UpdateListingInput) {
  return apiRequest<{ listing: ApiListing }>(`/listings/${id}`, {
    method: 'PATCH',
    body: input,
  });
}

export function deleteListing(id: string) {
  return apiRequest<{ message: string }>(`/listings/${id}`, {
    method: 'DELETE',
  });
}

export function toggleFavorite(id: string) {
  return apiRequest<{ favorited: boolean; favoriteCount: number }>(
    `/listings/${id}/favorite`,
    { method: 'POST' }
  );
}