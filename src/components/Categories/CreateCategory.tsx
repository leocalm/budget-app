import { Button, Group, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CreateCategoryForm } from './CreateCategoryForm';

export function CreateCategory() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Create Category">
        <CreateCategoryForm />
      </Modal>

      <Group justify="flex-end">
        <Button onClick={open}>+</Button>
      </Group>
    </>
  );
}
