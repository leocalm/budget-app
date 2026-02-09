import { Overlay, OverlayRequest } from '@/types/overlay';
import { apiDelete, apiGet, apiPost, apiPut } from './client';

export async function fetchOverlays(): Promise<Overlay[]> {
  return apiGet<Overlay[]>('/api/overlays');
}

export async function createOverlay(payload: OverlayRequest): Promise<Overlay> {
  return apiPost<Overlay, OverlayRequest>('/api/overlays', payload);
}

export async function updateOverlay(id: string, payload: OverlayRequest): Promise<Overlay> {
  return apiPut<Overlay, OverlayRequest>(`/api/overlays/${id}`, payload);
}

export async function deleteOverlay(id: string): Promise<void> {
  return apiDelete(`/api/overlays/${id}`);
}
