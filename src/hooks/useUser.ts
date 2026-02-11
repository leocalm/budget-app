import { useMutation } from '@tanstack/react-query';
import { updateUser, UpdateUserRequest } from '@/api/auth';
import { useAuth } from '@/context/AuthContext';

export const useUpdateUser = () => {
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) => updateUser(id, data),
    onSuccess: () => {
      refreshUser(); // Refresh auth context with updated user data
    },
  });
};
