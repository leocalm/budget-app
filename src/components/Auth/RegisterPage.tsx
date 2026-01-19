import {
  Anchor,
  Button,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';

export function RegisterPage() {
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (val) => (val.length < 2 ? 'Name must have at least 2 letters' : null),
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
      confirmPassword: (val, values) =>
        val !== values.password ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log(values);
    // TODO: Implement registration logic
    navigate('/dashboard');
  };

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <Title order={2} ta="center" mt="md" mb={50}>
        Create an account
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Full Name"
          placeholder="John Doe"
          required
          {...form.getInputProps('name')}
        />
        <TextInput
          label="Email"
          placeholder="you@example.com"
          required
          mt="md"
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
          {...form.getInputProps('password')}
        />
        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          required
          mt="md"
          {...form.getInputProps('confirmPassword')}
        />
        <Button fullWidth mt="xl" type="submit">
          Register
        </Button>
      </form>

      <Text c="dimmed" size="sm" ta="center" mt={20}>
        Already have an account?{' '}
        <Anchor component={Link} to="/auth/login" size="sm">
          Login
        </Anchor>
      </Text>
    </Paper>
  );
}