import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'default' | 'primary' | 'agent' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = 'default', children, className = '', style, ...rest }: ButtonProps) {
  const base =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50';

  let customStyle: React.CSSProperties = {};
  if (variant === 'default') {
    customStyle = {
      background: 'var(--surface)',
      color: 'var(--fg2)',
      border: '1px solid var(--border)',
    };
  } else if (variant === 'primary') {
    customStyle = {
      background: 'var(--blue)',
      color: '#fff',
      border: '1px solid var(--blue)',
    };
  } else if (variant === 'agent') {
    customStyle = {
      background: 'linear-gradient(135deg,#0E2A47,#0F9D8F)',
      color: '#fff',
      border: '1px solid transparent',
    };
  } else if (variant === 'ghost') {
    customStyle = {
      background: 'transparent',
      color: 'var(--fg2)',
      border: '1px solid transparent',
    };
  }

  return (
    <button className={`${base} ${className}`} style={{ ...customStyle, ...style }} {...rest}>
      {children}
    </button>
  );
}
