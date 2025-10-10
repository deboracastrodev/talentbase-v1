/**
 * PublicProfileHero Component - Design System
 *
 * Hero section for public candidate profiles with gradient background,
 * avatar, and info badges.
 *
 * @example
 * ```tsx
 * <PublicProfileHero
 *   name="Juliana Fernandes"
 *   avatarUrl="https://..."
 *   badges={[
 *     { label: '📍 Osasco - SP', variant: 'outline' },
 *     { label: '💼 Híbrido', variant: 'outline' },
 *     { label: '🎯 Account Manager/CSM', variant: 'outline' }
 *   ]}
 * />
 * ```
 */

import * as React from 'react';
import { cn } from '../lib/utils';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

export interface HeroBadge {
  label: string;
  variant?: 'default' | 'secondary' | 'success' | 'outline' | 'ghost';
  icon?: React.ReactNode;
}

export interface PublicProfileHeroProps {
  name: string;
  avatarUrl?: string;
  badges?: HeroBadge[];
  className?: string;
}

export function PublicProfileHero({
  name,
  avatarUrl,
  badges = [],
  className,
}: PublicProfileHeroProps) {
  return (
    <section
      className={cn(
        'bg-gradient-to-r from-primary-500 to-secondary-600 text-white',
        className
      )}
    >
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar - responsivo: 4xl mobile, 5xl desktop */}
          <Avatar
            src={avatarUrl}
            alt={name}
            size="4xl"
            className="md:h-40 md:w-40 border-4 border-white shadow-xl"
          />

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{name}</h1>

            {/* Quick Info Badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                  >
                    {badge.icon && <span className="mr-1">{badge.icon}</span>}
                    {badge.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
