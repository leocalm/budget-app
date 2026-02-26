import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changePassword,
  deleteAccount,
  fetchPeriodModel,
  fetchPreferences,
  fetchProfile,
  fetchSessions,
  fetchSettings,
  resetStructure,
  revokeSession,
  updatePeriodModel,
  updatePreferences,
  updateProfile,
  updateSettings,
} from '@/api/settings';
import {
  ChangePasswordRequest,
  PeriodModelRequest,
  PreferencesRequest,
  ProfileRequest,
  SettingsRequest,
} from '@/types/settings';
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.settings() });
    },
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.settingsProfile(),
    queryFn: fetchProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileRequest) => updateProfile(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.settingsProfile() });
    },
  });
};

export const usePreferences = () => {
  return useQuery({
    queryKey: queryKeys.settingsPreferences(),
    queryFn: fetchPreferences,
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PreferencesRequest) => updatePreferences(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.settingsPreferences() });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => changePassword(data),
  });
};

export const useSessions = () => {
  return useQuery({
    queryKey: queryKeys.settingsSessions(),
    queryFn: fetchSessions,
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.settingsSessions() });
    },
  });
};

export const usePeriodModel = () => {
  return useQuery({
    queryKey: queryKeys.settingsPeriodModel(),
    queryFn: fetchPeriodModel,
  });
};

export const useUpdatePeriodModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PeriodModelRequest) => updatePeriodModel(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.settingsPeriodModel() });
    },
  });
};

export const useResetStructure = () => {
  return useMutation({
    mutationFn: resetStructure,
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: deleteAccount,
  });
};
