import { useState } from 'react';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { createCategory } from '@/api/category';
import type { CategoryType } from '@/types/category';

interface Props {
  onComplete: () => void;
  onBack: () => void;
}

interface CategoryEntry {
  name: string;
  type: CategoryType;
}

const ESSENTIAL_5: CategoryEntry[] = [
  { name: 'Income', type: 'Incoming' },
  { name: 'Housing', type: 'Outgoing' },
  { name: 'Food', type: 'Outgoing' },
  { name: 'Transport', type: 'Outgoing' },
  { name: 'Other', type: 'Outgoing' },
];

const DETAILED_12: CategoryEntry[] = [
  { name: 'Salary', type: 'Incoming' },
  { name: 'Freelance', type: 'Incoming' },
  { name: 'Investment Income', type: 'Incoming' },
  { name: 'Rent / Mortgage', type: 'Outgoing' },
  { name: 'Utilities', type: 'Outgoing' },
  { name: 'Groceries', type: 'Outgoing' },
  { name: 'Dining', type: 'Outgoing' },
  { name: 'Transport', type: 'Outgoing' },
  { name: 'Health', type: 'Outgoing' },
  { name: 'Entertainment', type: 'Outgoing' },
  { name: 'Clothing', type: 'Outgoing' },
  { name: 'Other', type: 'Outgoing' },
];

type Template = 'essential5' | 'detailed12' | 'custom' | null;

export function CategoriesStep({ onComplete, onBack }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(null);
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<CategoryType>('Outgoing');
  const [loading, setLoading] = useState(false);

  function selectTemplate(template: Template) {
    setSelectedTemplate(template);
    if (template === 'essential5') {
      setCategories(ESSENTIAL_5);
    } else if (template === 'detailed12') {
      setCategories(DETAILED_12);
    } else {
      setCategories([]);
    }
  }

  function addCategory() {
    if (!newName.trim()) {
      return;
    }
    setCategories((prev) => [...prev, { name: newName.trim(), type: newType }]);
    setNewName('');
  }

  function removeCategory(index: number) {
    setCategories((prev) => prev.filter((_, i) => i !== index));
  }

  const hasIncoming = categories.some((c) => c.type === 'Incoming');
  const hasOutgoing = categories.some((c) => c.type === 'Outgoing');
  const canContinue = hasIncoming && hasOutgoing;

  async function handleContinue() {
    setLoading(true);
    for (const cat of categories) {
      await createCategory({
        name: cat.name,
        color: '#228be6',
        icon: 'tag',
        parentId: null,
        categoryType: cat.type,
      });
    }
    setLoading(false);
    onComplete();
  }

  const templateCards: { key: Template; label: string; description: string }[] = [
    { key: 'essential5', label: 'Essential 5', description: '5 basic categories to get started' },
    { key: 'detailed12', label: 'Detailed 12', description: '12 categories for detailed tracking' },
    { key: 'custom', label: 'Custom', description: 'Start with an empty list' },
  ];

  return (
    <Stack gap="lg">
      <Title order={3}>Set up your categories</Title>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        {templateCards.map(({ key, label, description }) => (
          <Card
            key={key}
            withBorder
            style={{
              cursor: 'pointer',
              borderColor: selectedTemplate === key ? 'var(--mantine-color-cyan-5)' : undefined,
            }}
            onClick={() => selectTemplate(key)}
          >
            <Text fw={600}>{label}</Text>
            <Text size="sm" c="dimmed">
              {description}
            </Text>
          </Card>
        ))}
      </SimpleGrid>

      {categories.length > 0 && (
        <Stack gap="xs">
          {categories.map((cat, i) => (
            <Group key={i} justify="space-between">
              <Group gap="xs">
                <Text>{cat.name}</Text>
                <Badge color={cat.type === 'Incoming' ? 'green' : 'red'} size="sm">
                  {cat.type}
                </Badge>
              </Group>
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={() => removeCategory(i)}
                aria-label={`Remove ${cat.name}`}
              >
                ×
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      )}

      <Group align="flex-end">
        <TextInput
          label="Category name"
          placeholder="e.g. Rent"
          value={newName}
          onChange={(e) => setNewName(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          style={{ flex: 1 }}
        />
        <Select
          label="Type"
          value={newType}
          onChange={(v) => v && setNewType(v as CategoryType)}
          data={[
            { value: 'Incoming', label: 'Incoming' },
            { value: 'Outgoing', label: 'Outgoing' },
          ]}
          w={140}
        />
        <Button variant="default" onClick={addCategory} disabled={!newName.trim()}>
          + Add category
        </Button>
      </Group>

      <Group justify="space-between" mt="md">
        <Button variant="default" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!canContinue} loading={loading}>
          Continue
        </Button>
      </Group>
    </Stack>
  );
}
