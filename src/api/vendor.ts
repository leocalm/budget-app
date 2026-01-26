import { Vendor, VendorRequest } from '@/types/vendor';
import { apiDelete, apiGet, apiPost } from './client';

export async function fetchVendors(): Promise<Vendor[]> {
  return apiGet<Vendor[]>('/api/vendors');
}

export async function createVendor(payload: VendorRequest): Promise<Vendor> {
  return apiPost<Vendor, VendorRequest>('/api/vendors', payload);
}

export async function deleteVendor(id: string): Promise<void> {
  return apiDelete(`/api/vendors/${id}`);
}
