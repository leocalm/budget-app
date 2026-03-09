import type {
  AvailableCardsResponse,
  CreateDashboardCardRequest,
  DashboardCardConfig,
  ReorderRequest,
  UpdateDashboardCardRequest,
} from '@/types/dashboardLayout';
import { apiDelete, apiGet, apiPost, apiPut } from './client';

export async function getDashboardLayout(): Promise<DashboardCardConfig[]> {
  return apiGet<DashboardCardConfig[]>('/api/dashboard-layout');
}

export async function createDashboardCard(
  request: CreateDashboardCardRequest
): Promise<DashboardCardConfig> {
  return apiPost<DashboardCardConfig>('/api/dashboard-layout', request);
}

export async function updateDashboardCard(
  cardId: string,
  request: UpdateDashboardCardRequest
): Promise<DashboardCardConfig> {
  return apiPut<DashboardCardConfig>(`/api/dashboard-layout/${cardId}`, request);
}

export async function reorderDashboardCards(
  request: ReorderRequest
): Promise<DashboardCardConfig[]> {
  return apiPut<DashboardCardConfig[]>('/api/dashboard-layout/reorder', request);
}

export async function deleteDashboardCard(cardId: string): Promise<void> {
  return apiDelete(`/api/dashboard-layout/${cardId}`);
}

export async function resetDashboardLayout(): Promise<DashboardCardConfig[]> {
  return apiPost<DashboardCardConfig[]>('/api/dashboard-layout/reset');
}

export async function getAvailableCards(): Promise<AvailableCardsResponse> {
  return apiGet<AvailableCardsResponse>('/api/dashboard-layout/available-cards');
}
