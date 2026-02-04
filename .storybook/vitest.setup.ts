import { setProjectAnnotations } from '@storybook/react-vite';
import { defaultResponsiveContainerProps } from 'recharts/es6/component/responsiveContainerUtils';
import * as projectAnnotations from './preview';

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([projectAnnotations]);

// Avoid initial -1 sizing warnings from recharts ResponsiveContainer in storybook tests.
defaultResponsiveContainerProps.initialDimension = { width: 1, height: 1 };
