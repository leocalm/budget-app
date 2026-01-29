import { Vendor, VendorRequest, VendorWithStats } from '@/types/vendor';
import { apiDelete, apiGet, apiPost, apiPut } from './client';

export async function fetchVendors(): Promise<VendorWithStats[]> {
  return apiGet<VendorWithStats[]>('/api/vendors');
}

export async function createVendor(payload: VendorRequest): Promise<Vendor> {
  return apiPost<Vendor, VendorRequest>('/api/vendors', payload);
}

export async function updateVendor(id: string, payload: VendorRequest): Promise<Vendor> {
  return apiPut<Vendor, VendorRequest>(`/api/vendors/${id}`, payload);
}

export async function deleteVendor(id: string): Promise<void> {
  return apiDelete(`/api/vendors/${id}`);
}
