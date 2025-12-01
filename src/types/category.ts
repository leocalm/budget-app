export const CATEGORY_TYPES = ["Incoming", "Outgoing", "Transfer"] as const;
export type CategoryType = typeof CATEGORY_TYPES[number];

export interface CategoryResponse {
  id: string;
  name: string;
  color: string;
  icon: string;
  parent_id: string | null;
  category_type: CategoryType;
}

export interface CategoryRequest {
  name: string;
  color: string;
  icon: string;
  parent_id: string | null;
  category_type: CategoryType;
}
