import { Vendor, VendorInput, VendorWithStats } from '@/types/vendor';
import { apiDelete, apiGet, apiPost, apiPut } from './client';

export async function fetchVendors(): Promise<VendorWithStats[]> {
  return apiGet<VendorWithStats[]>('/api/vendors');
}

export async function createVendor(payload: VendorInput): Promise<Vendor> {
  return apiPost<Vendor, VendorInput>('/api/vendors', payload);
}

export async function updateVendor(id: string, payload: VendorInput): Promise<Vendor> {
  return apiPut<Vendor, VendorInput>(`/api/vendors/${id}`, payload);
}

export async function deleteVendor(id: string): Promise<void> {
  return apiDelete(`/api/vendors/${id}`);
}
