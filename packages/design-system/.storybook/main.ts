import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
  async viteFinal(config, { configType }) {
    if (configType === 'PRODUCTION') {
      return mergeConfig(config, {
        base: '/talentbase-v1/',
        build: {
          assetsInlineLimit: 0,
          rollupOptions: {
            output: {
              manualChunks: undefined,
            },
          },
        },
      });
    }
    return config;
  },
};

export default config;
