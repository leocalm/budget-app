import {
  Anchor,
  Box,
  Button,
  Center,
  Group,
  Paper,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link } from 'react-router-dom';

export function ForgotPasswordPage() {
  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    console.log(values);
    // TODO: Implement reset logic
  };

  return (
    <Paper withBorder shadow="md" p={30} mt={30} radius="md">
      <Title order={2} ta="center" mt="md" mb={50}>
        Forgot your password?
      </Title>
      <Text c="dimmed" fz="sm" ta="center">
        Enter your email to get a reset link
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput
          label="Email"
          placeholder="you@example.com"
          required
          mt="md"
          {...form.getInputProps('email')}
        />
        <Button fullWidth mt="xl" type="submit">
          Reset password
        </Button>
      </form>

      <Group justify="center" mt="lg">
        <Anchor component={Link} to="/auth/login" size="sm" c="dimmed">
          <Center inline>
            <span style={{ fontSize: 12, marginRight: 5 }}>⬅️</span>
            <Box ml={5}>Back to the login page</Box>
          </Center>
        </Anchor>
      </Group>
    </Paper>
  );
}