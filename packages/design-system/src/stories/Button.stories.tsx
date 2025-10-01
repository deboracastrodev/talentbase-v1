import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Quero meu headhunter pessoal',
    variant: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Button Secondary',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Button Outline',
    variant: 'outline',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Button Destructive',
    variant: 'destructive',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Button Ghost',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Button Link',
    variant: 'link',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
};
