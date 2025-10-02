import type { Config } from 'tailwindcss';
import designSystemConfig from '@talentbase/design-system/tailwind.config';

export default {
  presets: [designSystemConfig],
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    '../design-system/src/**/*.{js,jsx,ts,tsx}',
  ],
} satisfies Config;
