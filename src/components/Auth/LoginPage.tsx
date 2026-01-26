import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  Anchor,
  Button,
  Checkbox,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      keepLogged: false,
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : t('auth.login.validation.invalidEmail')),
      password: (val) => (val.length <= 6 ? t('auth.login.validation.passwordMinLength') : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log(values);
    // TODO: Implement login logic
    navigate('/dashboard');
  };

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <Title order={2} ta="center" mt="md" mb={50}>
        {t('auth.login.welcomeBack')}
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label={t('auth.login.emailLabel')}
          placeholder={t('auth.login.emailPlaceholder')}
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label={t('auth.login.passwordLabel')}
          placeholder={t('auth.login.passwordPlaceholder')}
          required
          mt="md"
          {...form.getInputProps('password')}
        />
        <Group justify="space-between" mt="lg">
          <Checkbox
            label={t('auth.login.rememberMe')}
            {...form.getInputProps('keepLogged', { type: 'checkbox' })}
          />
          <Anchor component={Link} to="/auth/forgot-password" size="sm">
            {t('auth.login.forgotPassword')}
          </Anchor>
        </Group>
        <Button fullWidth mt="xl" type="submit">
          {t('auth.login.signIn')}
        </Button>
      </form>

      <Text c="dimmed" size="sm" ta="center" mt={20}>
        {t('auth.login.noAccountYet')}{' '}
        <Anchor component={Link} to="/auth/register" size="sm">
          {t('auth.login.createAccount')}
        </Anchor>
      </Text>
    </Paper>
  );
}
