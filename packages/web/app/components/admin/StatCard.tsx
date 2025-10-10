import { Link } from '@remix-run/react';
import { Card, CardHeader, CardTitle, CardContent } from '@talentbase/design-system';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: LucideIcon;
  href?: string;
  breakdown?: Array<{ label: string; value: number }>;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  breakdown,
}: StatCardProps) {
  const content = (
    <Card className={href ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-gray-600">
            {title}
          </CardTitle>
          {Icon && <Icon className="text-gray-400" size={24} />}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        {breakdown && breakdown.length > 0 && (
          <div className="mt-4 space-y-1">
            {breakdown.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}
