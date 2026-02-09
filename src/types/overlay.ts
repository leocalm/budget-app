export const OVERLAY_INCLUSION_MODES = ['manual', 'rules', 'all'] as const;

export type OverlayInclusionMode = (typeof OVERLAY_INCLUSION_MODES)[number];

export interface OverlayRules {
  categoryIds: string[];
  vendorIds: string[];
  accountIds: string[];
}

export interface OverlayCategoryCap {
  categoryId: string;
  capAmount: number;
}

export interface Overlay {
  id: string;
  name: string;
  icon?: string | null;
  startDate: string;
  endDate: string;
  inclusionMode: OverlayInclusionMode;
  totalCapAmount?: number | null;
  spentAmount?: number;
  transactionCount?: number;
  categoryCaps?: OverlayCategoryCap[];
  rules?: OverlayRules | null;
}

export interface OverlayRequest {
  name: string;
  icon?: string;
  startDate: string;
  endDate: string;
  inclusionMode: OverlayInclusionMode;
  totalCapAmount?: number | null;
  categoryCaps?: OverlayCategoryCap[];
  rules?: OverlayRules | null;
}
