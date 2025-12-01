import { Button, Group, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { CreateAccountForm } from './CreateAccountForm';

interface CreateAccountProps {
  onAccountCreated?: () => void;
}

export function CreateAccount({ onAccountCreated }: CreateAccountProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Create Account">
        <CreateAccountForm onAccountCreated={onAccountCreated} />
      </Modal>

      <Group justify="flex-end">
        <Button onClick={open}>+</Button>
      </Group>
    </>
  );
}
