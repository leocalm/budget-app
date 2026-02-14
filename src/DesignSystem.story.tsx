import {
  ColorSwatch,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';

export default {
  title: 'Design System',
};

const ColorGroup = ({ title, colors }: { title: string; colors: readonly string[] }) => (
  <Stack gap="xs" mb="xl">
    <Title order={4}>{title}</Title>
    <Grid>
      {colors.map((color, index) => (
        <Grid.Col span={{ base: 6, sm: 3, md: 2 }} key={index}>
          <Stack gap={4} align="center">
            <ColorSwatch color={color} size={40} radius="md" />
            <Text size="xs" c="dimmed">
              {index}
            </Text>
            <Text size="xs" fw={500}>
              {color.toUpperCase()}
            </Text>
          </Stack>
        </Grid.Col>
      ))}
    </Grid>
  </Stack>
);

export const Palette = () => {
  const theme = useMantineTheme();

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">
        Design System - Palette
      </Title>

      <Stack gap="xl">
        <section>
          <Title order={2} mb="md">
            Brand Colors
          </Title>
          <ColorGroup title="Primary (Cyan)" colors={theme.colors.cyan} />
        </section>

        <section>
          <Title order={2} mb="md">
            Semantic Colors
          </Title>
          <ColorGroup title="Success (Green)" colors={theme.colors.green} />
          <ColorGroup title="Warning (Orange)" colors={theme.colors.orange} />
          <ColorGroup title="Danger (Pink)" colors={theme.colors.pink} />
          <ColorGroup title="Info (Violet)" colors={theme.colors.violet} />
        </section>

        <section>
          <Title order={2} mb="md">
            Neutral Colors
          </Title>
          <ColorGroup title="Dark (Backgrounds & Surfaces)" colors={theme.colors.dark} />
        </section>
      </Stack>
    </Container>
  );
};

export const Typography = () => {
  const theme = useMantineTheme();

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">
        Design System - Typography
      </Title>

      <Stack gap="xl">
        <section>
          <Title order={2} mb="md">
            Headings
          </Title>
          <Stack gap="md">
            <Title order={1}>Heading 1 - {theme.headings.fontWeight} Weight</Title>
            <Title order={2}>Heading 2 - {theme.headings.fontWeight} Weight</Title>
            <Title order={3}>Heading 3 - {theme.headings.fontWeight} Weight</Title>
            <Title order={4}>Heading 4 - {theme.headings.fontWeight} Weight</Title>
            <Title order={5}>Heading 5 - {theme.headings.fontWeight} Weight</Title>
            <Title order={6}>Heading 6 - {theme.headings.fontWeight} Weight</Title>
          </Stack>
        </section>

        <section>
          <Title order={2} mb="md">
            Body Text
          </Title>
          <Stack gap="md">
            <Text size="xl">Extra Large Text - The quick brown fox jumps over the lazy dog</Text>
            <Text size="lg">Large Text - The quick brown fox jumps over the lazy dog</Text>
            <Text size="md">
              Medium Text (Default) - The quick brown fox jumps over the lazy dog
            </Text>
            <Text size="sm">Small Text - The quick brown fox jumps over the lazy dog</Text>
            <Text size="xs">Extra Small Text - The quick brown fox jumps over the lazy dog</Text>
          </Stack>
        </section>

        <section>
          <Title order={2} mb="md">
            Monospace
          </Title>
          <Text ff="monospace" size="md">
            const designSystem = "Piggy Pulse";
          </Text>
        </section>
      </Stack>
    </Container>
  );
};

export const BrandElements = () => {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">
        Design System - Brand Elements
      </Title>

      <Stack gap="xl">
        <section>
          <Title order={2} mb="md">
            Gradients
          </Title>
          <Group>
            <Stack align="center">
              <div
                className="brand-gradient"
                style={{ width: 200, height: 100, borderRadius: 12 }}
              />
              <Text size="sm">Brand Gradient</Text>
            </Stack>
          </Group>
        </section>

        <section>
          <Title order={2} mb="md">
            Typography FX
          </Title>
          <Title order={1} className="brand-text">
            Piggy Pulse Brand Text
          </Title>
        </section>

        <section>
          <Title order={2} mb="md">
            Glow Effects
          </Title>
          <div
            className="brand-gradient brand-glow"
            style={{ width: 100, height: 100, borderRadius: '50%' }}
          />
        </section>
      </Stack>
    </Container>
  );
};
