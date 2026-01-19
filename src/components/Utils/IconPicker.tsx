import React, { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { ActionIcon, Box, Popover, SimpleGrid, Stack, Text, TextInput } from '@mantine/core';
import { getIcon, iconMap } from '@/utils/IconMap';

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [opened, setOpened] = useState(false);

  const filteredIcons = Object.keys(iconMap).filter((key) =>
    key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Stack gap={4}>
      {label && (
        <Text size="sm" fw={500} style={{ visibility: 'hidden' }}>
          {label}
        </Text>
      )}
      <Popover
        opened={opened}
        onChange={setOpened}
        position="bottom-start"
        withArrow
        shadow="md"
        width={250}
      >
        <Popover.Target>
          <ActionIcon
            variant="outline"
            size={36} // Matches standard Mantine input height
            radius="md"
            onClick={() => setOpened((o) => !o)}
            styles={{
              root: {
                borderColor: 'var(--mantine-color-default-border)',
                color: 'var(--mantine-color-dimmed)',
              },
            }}
          >
            {getIcon(value, 22)}
          </ActionIcon>
        </Popover.Target>

        <Popover.Dropdown p="xs">
          <Stack gap="xs">
            <TextInput
              placeholder="Search icons..."
              size="xs"
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              autoFocus
            />
            <Box style={{ maxHeight: 200, overflowY: 'auto' }}>
              <SimpleGrid cols={5} spacing={4}>
                {filteredIcons.map((key) => (
                  <ActionIcon
                    key={key}
                    variant={value === key ? 'filled' : 'subtle'}
                    color={value === key ? 'blue' : 'gray'}
                    onClick={() => {
                      onChange(key);
                      setOpened(false);
                    }}
                    title={key}
                    size="lg"
                  >
                    {getIcon(key, 20)}
                  </ActionIcon>
                ))}
              </SimpleGrid>
            </Box>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </Stack>
  );
}
