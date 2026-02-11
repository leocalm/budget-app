import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSettings, updateSettings } from '@/api/settings';
import { SettingsRequest } from '@/types/settings';
import { queryKeys } from './queryKeys';

export const useSettings = () => {
  return useQuery({
    queryKey: queryKeys.settings(),
    queryFn: fetchSettings,
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SettingsRequest) => updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings() });
    },
  });
};
