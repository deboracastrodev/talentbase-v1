import React from 'react';
import { cn } from '../lib/utils';

export interface CandidateSkill {
  name: string;
  verified?: boolean;
}

export interface CandidateCardProps {
  name: string;
  initials?: string;
  avatar?: string;
  role: string;
  experience: string;
  location: string;
  country?: string;
  salary: string;
  hourlyRate?: string;
  description: string;
  skills: CandidateSkill[];
  verified?: boolean;
  badges?: React.ReactNode[];
  onMenuClick?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  className?: string;
}

export const CandidateCard = React.forwardRef<HTMLDivElement, CandidateCardProps>(
  (
    {
      name,
      initials,
      avatar,
      role,
      experience,
      location,
      country,
      salary,
      hourlyRate,
      description,
      skills,
      verified,
      badges,
      onMenuClick,
      onFavorite,
      isFavorite,
      className,
    },
    ref
  ) => {
    const displaySkills = skills.slice(0, 3);
    const remainingSkills = skills.length - 3;

    // Gera iniciais do nome
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div
        ref={ref}
        className={cn(
          'group relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200',
          className
        )}
      >
        {/* Header with Avatar and Actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Avatar - Fixed size */}
            <div className="flex-shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white shadow-sm">
                  {initials || getInitials(name)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-gray-900 truncate">{name}</h3>
                {verified && (
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {badges && <div className="flex gap-1 flex-shrink-0">{badges}</div>}
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{role}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>Exp: {experience}</span>
                <span className="text-gray-300">|</span>
                <span className="flex items-center gap-1">
                  {location}
                  {country && <span className="text-base leading-none">{country}</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <button
            onClick={onMenuClick}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Principais habilidades:</p>
          <div className="flex flex-wrap gap-2">
            {displaySkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-normal bg-gray-100 text-gray-700 border border-gray-200"
              >
                {skill.verified && <span className="mr-1 text-green-500 text-base leading-none">•</span>}
                {skill.name}
              </span>
            ))}
            {remainingSkills > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-normal bg-gray-100 text-gray-700 border border-gray-200">
                +{remainingSkills}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 line-clamp-2 mb-4">{description}</p>

        {/* Footer with Salary */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-2xl font-bold text-gray-900">{salary}</p>
            {hourlyRate && <p className="text-xs text-gray-500 mt-0.5">({hourlyRate})</p>}
          </div>

          <button
            onClick={onFavorite}
            className={cn(
              'flex-shrink-0 p-2 rounded-lg transition-colors',
              isFavorite
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
            )}
          >
            <svg
              className="w-5 h-5"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }
);

CandidateCard.displayName = 'CandidateCard';
