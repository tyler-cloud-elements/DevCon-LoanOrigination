import type { ReactNode } from 'react';
import type { CasePill } from '../../types/loan';

const PILL_STYLES: Record<CasePill, { bg: string; fg: string }> = {
  blue: { bg: 'var(--blue-bg)', fg: 'var(--blue)' },
  green: { bg: 'var(--green-bg)', fg: 'var(--green)' },
  amber: { bg: 'var(--amber-bg)', fg: 'var(--amber)' },
  purple: { bg: 'var(--purple-bg)', fg: 'var(--purple)' },
  red: { bg: 'var(--red-bg)', fg: 'var(--red)' },
};

interface PillProps {
  tone: CasePill;
  children: ReactNode;
  className?: string;
}

export function Pill({ tone, children, className = '' }: PillProps) {
  const style = PILL_STYLES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${className}`}
      style={{ background: style.bg, color: style.fg }}
    >
      {children}
    </span>
  );
}
