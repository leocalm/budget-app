import { Center } from '@mantine/core';
import { PulseLoader } from '../PulseLoader';

export const PageLoader = () => (
  <Center h="50vh">
    <PulseLoader state="loading" size={176} color="var(--accent-primary)" />
  </Center>
);
