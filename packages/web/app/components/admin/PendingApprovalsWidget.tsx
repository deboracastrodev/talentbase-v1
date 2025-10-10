/**
 * Pending Approvals Widget
 *
 * Displays count of pending company approvals with click navigation.
 * Story 2.5 - AC1, AC2: Widget "Pending Approvals" no dashboard
 */

import { Link } from '@remix-run/react';
import { Card } from '@talentbase/design-system';
import { AlertCircle } from 'lucide-react';

interface PendingApprovalsWidgetProps {
  count: number;
}

export function PendingApprovalsWidget({ count }: PendingApprovalsWidgetProps) {
  const hasPending = count > 0;

  return (
    <Link
      to="/admin/users?status=pending&role=company"
      className="block hover:shadow-lg transition-shadow"
    >
      <Card className={`p-6 ${hasPending ? 'border-l-4 border-yellow-500' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className={`w-5 h-5 ${hasPending ? 'text-yellow-600' : 'text-gray-400'}`} />
              <h3 className="text-sm font-medium text-gray-700">
                Pending Approvals
              </h3>
            </div>
            <p className={`text-3xl font-bold ${hasPending ? 'text-yellow-600' : 'text-gray-400'}`}>
              {count}
            </p>
            <p className="mt-2 text-xs text-gray-600">
              {hasPending
                ? `${count} ${count === 1 ? 'empresa aguardando' : 'empresas aguardando'} aprovação`
                : 'Nenhuma empresa pendente'}
            </p>
          </div>

          {hasPending && (
            <div className="ml-4">
              <div className="bg-yellow-100 rounded-full p-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          )}
        </div>

        {hasPending && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
              Revisar empresas
              <span className="text-lg">→</span>
            </p>
          </div>
        )}
      </Card>
    </Link>
  );
}
