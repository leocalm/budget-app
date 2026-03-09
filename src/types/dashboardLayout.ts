export type CardSize = 'half' | 'full';

export interface DashboardCardConfig {
  id: string;
  cardType: string;
  entityId: string | null;
  size: CardSize;
  position: number;
  enabled: boolean;
}

export interface CreateDashboardCardRequest {
  cardType: string;
  entityId?: string | null;
  position: number;
  enabled?: boolean;
}

export interface UpdateDashboardCardRequest {
  position?: number;
  enabled?: boolean;
  entityId?: string;
}

export interface ReorderEntry {
  id: string;
  position: number;
}

export interface ReorderRequest {
  order: ReorderEntry[];
}

export interface AvailableGlobalCard {
  cardType: string;
  defaultSize: CardSize;
  alreadyAdded: boolean;
}

export interface AvailableEntity {
  id: string;
  name: string;
  alreadyAdded: boolean;
}

export interface AvailableEntityCardType {
  cardType: string;
  defaultSize: CardSize;
  availableEntities: AvailableEntity[];
}

export interface AvailableCardsResponse {
  globalCards: AvailableGlobalCard[];
  entityCards: AvailableEntityCardType[];
}
