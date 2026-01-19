export const CATEGORY_TYPES = ["Incoming", "Outgoing", "Transfer"] as const;
export type CategoryType = typeof CATEGORY_TYPES[number];

export interface CategoryResponse {
  id: string;
  name: string;
  color: string;
  icon: string;
  parentId: string | null;
  categoryType: CategoryType;
}

export interface CategoryRequest {
  name: string;
  color: string;
  icon: string;
  parentId: string | null;
  categoryType: CategoryType;
}
