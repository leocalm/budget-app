import { Overlay, OverlayRequest, OverlayTransaction } from '@/types/overlay';
import { apiDelete, apiGet, apiPost, apiPut } from './client';

export async function fetchOverlays(): Promise<Overlay[]> {
  return apiGet<Overlay[]>('/api/overlays');
}

export async function createOverlay(payload: OverlayRequest): Promise<Overlay> {
  return apiPost<Overlay, OverlayRequest>('/api/overlays', payload);
}

export async function fetchOverlay(id: string): Promise<Overlay> {
  return apiGet<Overlay>(`/api/overlays/${id}`);
}

export async function fetchOverlayTransactions(overlayId: string): Promise<OverlayTransaction[]> {
  return apiGet<OverlayTransaction[]>(`/api/overlays/${overlayId}/transactions`);
}

export async function updateOverlay(id: string, payload: OverlayRequest): Promise<Overlay> {
  return apiPut<Overlay, OverlayRequest>(`/api/overlays/${id}`, payload);
}

export async function deleteOverlay(id: string): Promise<void> {
  return apiDelete(`/api/overlays/${id}`);
}

export async function includeOverlayTransaction(
  overlayId: string,
  transactionId: string
): Promise<void> {
  return apiPost<void, Record<string, never>>(
    `/api/overlays/${overlayId}/transactions/${transactionId}/include`,
    {}
  );
}

export async function excludeOverlayTransaction(
  overlayId: string,
  transactionId: string
): Promise<void> {
  return apiDelete(`/api/overlays/${overlayId}/transactions/${transactionId}/exclude`);
}
