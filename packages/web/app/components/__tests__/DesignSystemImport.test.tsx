import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button, Input, FormField, VideoPlayer } from '@talentbase/design-system';

describe('Design System Components', () => {
  it('renders Button component', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders Input component with FormField label', () => {
    render(
      <FormField label="Email">
        <Input type="email" />
      </FormField>
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders VideoPlayer with valid YouTube URL', () => {
    const { container } = render(
      <VideoPlayer url="https://youtube.com/watch?v=abc12345678" />
    );
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe?.src).toContain('youtube.com/embed/abc12345678');
  });

  it('shows error for invalid video URL', () => {
    render(<VideoPlayer url="https://invalid.com/video" />);
    expect(screen.getByText('URL de vídeo inválida')).toBeInTheDocument();
  });
});
