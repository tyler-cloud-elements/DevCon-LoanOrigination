import { useTheme } from '../../hooks/useTheme';
import { useAssistant } from '../../hooks/useAssistant';
import { Button } from '../ui/Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  rightSlot?: React.ReactNode;
}

export function Header({ title, subtitle, onRefresh, rightSlot }: HeaderProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const { open: openAssistant } = useAssistant();

  return (
    <div
      className="flex items-center gap-3 px-6 py-2.5 flex-shrink-0"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
    >
      <div>
        <div className="text-[15px] font-bold" style={{ color: 'var(--fg)' }}>
          {title}
        </div>
        {subtitle && (
          <div className="text-[11px]" style={{ color: 'var(--fg3)' }}>
            {subtitle}
          </div>
        )}
      </div>

      <div className="flex-1" />

      <div
        className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg"
        style={{ background: 'var(--elevated)', border: '1px solid var(--border)', width: 200 }}
      >
        <span style={{ color: 'var(--fg4)' }}>🔍</span>
        <input
          placeholder="Search cases..."
          className="flex-1 bg-transparent border-none outline-none text-[13px]"
          style={{ color: 'var(--fg)' }}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[11px]" style={{ color: 'var(--fg4)' }}>
          ☀
        </span>
        <button
          onClick={toggle}
          className="relative w-9 h-5 rounded-[10px] transition-colors"
          style={{ background: isDark ? 'var(--purple)' : 'var(--border2)' }}
          aria-label="Toggle theme"
        >
          <span
            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
            style={{
              transform: isDark ? 'translateX(16px)' : 'translateX(0)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
            }}
          />
        </button>
        <span className="text-[11px]" style={{ color: 'var(--fg4)' }}>
          ☾
        </span>
      </div>

      {onRefresh && (
        <Button variant="default" onClick={onRefresh} aria-label="Refresh">
          ↻ Refresh
        </Button>
      )}

      {rightSlot}

      <Button variant="agent" onClick={() => openAssistant()}>
        ★ Ask Agent
      </Button>
    </div>
  );
}
