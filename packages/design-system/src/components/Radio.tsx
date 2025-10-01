import React from 'react';
import { cn } from '../lib/utils';

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, id, ...props }, ref) => {
    const radioId = id || 'radio-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    return (
      <div className="flex items-center">
        <input
          type="radio"
          id={radioId}
          ref={ref}
          className={cn(
            'h-4 w-4 border-gray-300 text-primary-500 transition-colors',
            'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={radioId}
            className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

export { Radio };
