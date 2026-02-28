import mantine from 'eslint-config-mantine';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

// @ts-check
export default defineConfig(
  tseslint.configs.recommended,
  ...mantine,

  {
    ignores: ['**/*.{mjs,cjs,js,d.ts,d.mts}', 'vitest.storybook.config.ts', '.storybook/**'],
  },

  {
    files: ['**/*.story.tsx'],
    rules: { 'no-console': 'off' },
  },

  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: process.cwd(),
        project: ['./tsconfig.eslint.json'],
      },
    },
  },

  // eslint-plugin-react v7 uses the legacy rule context API (context.getFilename)
  // which was removed in ESLint v10. Disable all react/* rules until the plugin
  // ships ESLint v10 support. The rules below are the full set loaded by
  // eslint-config-mantine; TypeScript and jsx-a11y rules are unaffected.
  {
    rules: {
      'react/button-has-type': 'off',
      'react/jsx-boolean-value': 'off',
      'react/jsx-curly-brace-presence': 'off',
      'react/jsx-fragments': 'off',
      'react/jsx-no-comment-textnodes': 'off',
      'react/jsx-no-duplicate-props': 'off',
      'react/jsx-no-target-blank': 'off',
      'react/no-children-prop': 'off',
      'react/no-deprecated': 'off',
      'react/no-find-dom-node': 'off',
      'react/no-string-refs': 'off',
      'react/self-closing-comp': 'off',
      'react/void-dom-elements-no-children': 'off',
    },
  }
);
