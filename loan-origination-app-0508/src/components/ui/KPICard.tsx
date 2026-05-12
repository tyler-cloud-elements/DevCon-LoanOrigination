import type { ReactNode } from 'react';
import { Card } from './Card';

interface KPICardProps {
  label: string;
  value: string | number;
  accent?: 'blue' | 'purple' | 'amber' | 'green' | 'red';
  subLabel?: string;
  badge?: ReactNode;
}

const ACCENT: Record<NonNullable<KPICardProps['accent']>, string> = {
  blue: 'var(--blue)',
  purple: 'var(--purple)',
  amber: 'var(--amber)',
  green: 'var(--green)',
  red: 'var(--red)',
};

export function KPICard({ label, value, accent, subLabel, badge }: KPICardProps) {
  return (
    <Card>
      <div className="px-4 py-3.5">
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <div className="text-[11px]" style={{ color: 'var(--fg3)' }}>
            {label}
          </div>
          {badge}
        </div>
        <div
          className="text-2xl font-extrabold leading-tight"
          style={accent ? { color: ACCENT[accent] } : undefined}
        >
          {value}
        </div>
        {subLabel && (
          <div className="text-[10px] mt-1" style={{ color: 'var(--fg4)' }}>
            {subLabel}
          </div>
        )}
      </div>
    </Card>
  );
}
