import { BudgetCategoryResponse } from '@/types/budget';

interface EditBudgetedCategoryFormProps {
  budgetedCategory: BudgetCategoryResponse;
}

export function EditBudgetedCategoryForm({ budgetedCategory }: EditBudgetedCategoryFormProps) {
  return <>{budgetedCategory.id}</>;
}
