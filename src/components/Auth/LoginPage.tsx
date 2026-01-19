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
import { Link, useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      keepLogged: false,
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
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
        Welcome back!
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Email"
          placeholder="you@example.com"
          required
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
          {...form.getInputProps('password')}
        />
        <Group justify="space-between" mt="lg">
          <Checkbox label="Remember me" {...form.getInputProps('keepLogged', { type: 'checkbox' })} />
          <Anchor component={Link} to="/auth/forgot-password" size="sm">
            Forgot password?
          </Anchor>
        </Group>
        <Button fullWidth mt="xl" type="submit">
          Sign in
        </Button>
      </form>

      <Text c="dimmed" size="sm" ta="center" mt={20}>
        Do not have an account yet?{' '}
        <Anchor component={Link} to="/auth/register" size="sm">
          Create account
        </Anchor>
      </Text>
    </Paper>
  );
}