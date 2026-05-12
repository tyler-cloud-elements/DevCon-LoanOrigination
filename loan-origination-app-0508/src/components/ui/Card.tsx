import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', style }: CardProps) {
  return (
    <div
      className={`rounded-[10px] overflow-hidden ${className}`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CardHeader({ children, className = '', style }: CardHeaderProps) {
  return (
    <div
      className={`px-4 py-3 text-xs font-semibold flex items-center justify-between ${className}`}
      style={{
        borderBottom: '1px solid var(--border)',
        color: 'var(--fg3)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`px-4 py-3.5 ${className}`} style={style}>
      {children}
    </div>
  );
}
