import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Anchor, Box, Button, Center, Group, Paper, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (val) =>
        /^\S+@\S+$/.test(val) ? null : t('auth.forgotPassword.validation.invalidEmail'),
    },
  });

  const handleSubmit = () => {
    // TODO: Implement reset logic
  };

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <Title order={2} ta="center" mt="md" mb={50}>
        {t('auth.forgotPassword.title')}
      </Title>
      <Text c="dimmed" fz="sm" ta="center">
        {t('auth.forgotPassword.subtitle')}
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label={t('auth.forgotPassword.emailLabel')}
          placeholder={t('auth.forgotPassword.emailPlaceholder')}
          required
          mt="md"
          {...form.getInputProps('email')}
        />
        <Button fullWidth mt="xl" type="submit">
          {t('auth.forgotPassword.resetPasswordButton')}
        </Button>
      </form>

      <Group justify="center" mt="lg">
        <Anchor component={Link} to="/auth/login" size="sm" c="dimmed">
          <Center inline>
            <span style={{ fontSize: 12, marginRight: 5 }}>⬅️</span>
            <Box ml={5}>{t('auth.forgotPassword.backToLogin')}</Box>
          </Center>
        </Anchor>
      </Group>
    </Paper>
  );
}
