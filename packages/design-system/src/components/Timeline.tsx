/**
 * Timeline Component - Design System
 *
 * Vertical timeline component with dots and optional company logos.
 * Used for displaying work experience history.
 *
 * @example
 * ```tsx
 * <Timeline
 *   items={[
 *     {
 *       id: '1',
 *       title: 'Account Executive',
 *       subtitle: 'Company Name',
 *       period: 'mai/25 - o momento',
 *       duration: '7 meses',
 *       logoUrl: 'https://...'
 *     }
 *   ]}
 * />
 * ```
 */

import { cn } from '../lib/utils';

export interface TimelineItem {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  duration?: string;
  logoUrl?: string;
  description?: string;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">Nenhuma experiência cadastrada</p>
      </div>
    );
  }

  return (
    <div className={cn('relative pl-4 md:pl-8 space-y-6', className)}>
      {/* Linha vertical */}
      <div className="absolute left-1 md:left-2 top-0 bottom-0 w-0.5 bg-gray-300" />

      {items.map((item, index) => (
        <div key={item.id} className="relative">
          {/* Dot */}
          <div
            className={cn(
              'absolute -left-3 md:-left-6 top-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 md:border-4 border-white',
              index === 0 ? 'bg-primary-500' : 'bg-gray-400'
            )}
          />

          {/* Company Logo (opcional) */}
          {item.logoUrl && (
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <img
                src={item.logoUrl}
                alt={item.subtitle}
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-contain bg-white p-1 border border-gray-200"
              />
              <div>
                <p className="font-semibold text-gray-900">{item.subtitle}</p>
              </div>
            </div>
          )}

          {/* Content Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2 gap-4">
              <div className="flex-1">
                {!item.logoUrl && (
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {item.subtitle}
                  </p>
                )}
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
              </div>
              {item.duration && (
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {item.duration}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{item.period}</p>
            {item.description && (
              <p className="text-sm text-gray-700 mt-2">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
