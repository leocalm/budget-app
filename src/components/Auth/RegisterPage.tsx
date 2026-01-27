import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Anchor, Button, Paper, PasswordInput, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (val) => (val.length < 2 ? t('auth.register.validation.nameMinLength') : null),
      email: (val) => (/^\S+@\S+$/.test(val) ? null : t('auth.register.validation.invalidEmail')),
      password: (val) => (val.length <= 6 ? t('auth.register.validation.passwordMinLength') : null),
      confirmPassword: (val, values) =>
        val !== values.password ? t('auth.register.validation.passwordsDoNotMatch') : null,
    },
  });

  const handleSubmit = () => {
    // TODO: Implement registration logic
    navigate('/dashboard');
  };

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <Title order={2} ta="center" mt="md" mb={50}>
        {t('auth.register.createAccountTitle')}
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label={t('auth.register.fullNameLabel')}
          placeholder={t('auth.register.fullNamePlaceholder')}
          required
          {...form.getInputProps('name')}
        />
        <TextInput
          label={t('auth.register.emailLabel')}
          placeholder={t('auth.register.emailPlaceholder')}
          required
          mt="md"
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label={t('auth.register.passwordLabel')}
          placeholder={t('auth.register.passwordPlaceholder')}
          required
          mt="md"
          {...form.getInputProps('password')}
        />
        <PasswordInput
          label={t('auth.register.confirmPasswordLabel')}
          placeholder={t('auth.register.confirmPasswordPlaceholder')}
          required
          mt="md"
          {...form.getInputProps('confirmPassword')}
        />
        <Button fullWidth mt="xl" type="submit">
          {t('auth.register.registerButton')}
        </Button>
      </form>

      <Text c="dimmed" size="sm" ta="center" mt={20}>
        {t('auth.register.alreadyHaveAccount')}{' '}
        <Anchor component={Link} to="/auth/login" size="sm">
          {t('auth.register.login')}
        </Anchor>
      </Text>
    </Paper>
  );
}
