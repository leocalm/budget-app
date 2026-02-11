import { useEffect, useRef, useState } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import {
  Alert,
  Avatar,
  Button,
  Container,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@/context/AuthContext';
import { useCurrencies } from '@/hooks/useCurrencies';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { useUpdateUser } from '@/hooks/useUser';
import { LANGUAGE_DISPLAY_NAMES, SettingsRequest, Theme } from '@/types/settings';

export function SettingsPage() {
  const { setColorScheme } = useMantineColorScheme();
  const { user, refreshUser } = useAuth();
  const settingsQuery = useSettings();
  const currenciesQuery = useCurrencies();
  const updateSettingsMutation = useUpdateSettings();
  const updateUserMutation = useUpdateUser();

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [theme, setTheme] = useState<Theme>('auto');
  const [language, setLanguage] = useState('en');
  const [currencyId, setCurrencyId] = useState<string | null>(null);

  const hasInitializedSettings = useRef(false);
  const hasInitializedProfile = useRef(false);

  // Sync form when data loads (only on initial load)
  useEffect(() => {
    if (settingsQuery.data && !hasInitializedSettings.current) {
      setTheme(settingsQuery.data.theme);
      setLanguage(settingsQuery.data.language);
      setCurrencyId(settingsQuery.data.defaultCurrencyId);
      setColorScheme(settingsQuery.data.theme);
      hasInitializedSettings.current = true;
    }
  }, [settingsQuery.data, setColorScheme]);

  // Reset initialization when settings are saved
  useEffect(() => {
    if (updateSettingsMutation.isSuccess) {
      hasInitializedSettings.current = false;
    }
  }, [updateSettingsMutation.isSuccess]);

  useEffect(() => {
    if (user && !hasInitializedProfile.current) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      hasInitializedProfile.current = true;
    }
  }, [user]);

  // Reset profile initialization when profile is saved
  useEffect(() => {
    if (updateUserMutation.isSuccess) {
      hasInitializedProfile.current = false;
    }
  }, [updateUserMutation.isSuccess]);

  const handleSaveProfile = async () => {
    if (!user) {
      return;
    }
    try {
      await updateUserMutation.mutateAsync({
        id: user.id,
        data: { name: profileName, email: profileEmail },
      });
      await refreshUser();
      notifications.show({
        title: 'Success',
        message: 'Profile updated successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update profile. Please try again.',
        color: 'red',
      });
    }
  };

  const handleSavePreferences = async () => {
    const settingsData: SettingsRequest = {
      theme,
      language: language as 'en' | 'es' | 'pt' | 'fr' | 'de',
      defaultCurrencyId: currencyId,
    };
    try {
      await updateSettingsMutation.mutateAsync(settingsData);
      notifications.show({
        title: 'Success',
        message: 'Preferences saved successfully',
        color: 'green',
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save preferences. Please try again.',
        color: 'red',
      });
    }
  };

  const isLoading = settingsQuery.isLoading || currenciesQuery.isLoading;
  const isError = settingsQuery.isError || currenciesQuery.isError;

  if (isLoading) {
    return (
      <Container size="lg" py="xl">
        <Group justify="center">
          <Loader />
        </Group>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle />} title="Error" color="red">
          Failed to load settings. Please try again later.
        </Alert>
      </Container>
    );
  }

  const currencyOptions =
    currenciesQuery.data?.map((currency) => ({
      value: currency.id,
      label: `${currency.name} (${currency.symbol})`,
    })) || [];

  const currencySelectData =
    currencyOptions.length > 0
      ? currencyOptions
      : [{ value: 'none', label: 'No currencies available', disabled: true }];
  const isCurrencyDisabled = currencyOptions.length === 0;

  const languageOptions = Object.entries(LANGUAGE_DISPLAY_NAMES).map(([code, name]) => ({
    value: code,
    label: name,
  }));

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto (follow system)' },
  ];

  // Determine avatar initials
  const avatarInitials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'JD';

  return (
    <Container size="lg">
      <Stack gap="xl">
        <div>
          <Title order={2}>Settings</Title>
          <Text c="dimmed">Manage your preferences and account settings</Text>
        </div>

        {/* Profile Information */}
        <Paper withBorder radius="md" p="xl">
          <Stack gap="lg">
            <div>
              <Title order={4} mb="xs">
                Profile Information
              </Title>
              <Text c="dimmed" size="sm">
                Update your personal details
              </Text>
            </div>

            <Group align="flex-start">
              <Avatar size={80} radius={80} color="cyan">
                {avatarInitials}
              </Avatar>
              <Stack style={{ flex: 1 }}>
                <TextInput
                  label="Full Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.currentTarget.value)}
                  placeholder="Enter your full name"
                />
                <TextInput
                  label="Email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.currentTarget.value)}
                  placeholder="Enter your email"
                />
              </Stack>
            </Group>

            <Group justify="flex-end">
              <Button
                leftSection={<span>💾</span>}
                onClick={handleSaveProfile}
                loading={updateUserMutation.isPending}
                disabled={!profileName.trim() || !profileEmail.trim()}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Appearance */}
        <Paper withBorder radius="md" p="xl">
          <Stack gap="lg">
            <div>
              <Title order={4} mb="xs">
                Appearance
              </Title>
              <Text c="dimmed" size="sm">
                Customize how the application looks
              </Text>
            </div>

            <Group justify="space-between">
              <div>
                <Text fw={500}>Theme Mode</Text>
                <Text c="dimmed" size="sm">
                  Choose your preferred theme
                </Text>
              </div>
              <Select
                data={themeOptions}
                value={theme}
                onChange={(value) => {
                  const newTheme = value as Theme;
                  setTheme(newTheme);
                  setColorScheme(newTheme);
                }}
                w={250}
              />
            </Group>
          </Stack>
        </Paper>

        {/* Preferences */}
        <Paper withBorder radius="md" p="xl">
          <Stack gap="lg">
            <div>
              <Title order={4} mb="xs">
                Preferences
              </Title>
              <Text c="dimmed" size="sm">
                Regional and application settings
              </Text>
            </div>

            <Select
              label="Currency"
              description="Select your preferred currency for display"
              data={currencySelectData}
              disabled={isCurrencyDisabled}
              value={currencyId}
              onChange={(value) => {
                setCurrencyId(value);
              }}
              placeholder="Select currency"
              clearable
              w={300}
            />

            <Select
              label="Language"
              description="Select your preferred language"
              data={languageOptions}
              value={language}
              onChange={(value) => {
                setLanguage(value || 'en');
              }}
              w={300}
            />

            <Group justify="flex-end">
              <Button
                leftSection={<span>💾</span>}
                onClick={handleSavePreferences}
                loading={updateSettingsMutation.isPending}
              >
                Save Preferences
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
