import type { ToolCall } from '../../types/loan';

interface ToolCallBlockProps {
  call: ToolCall;
}

const STATE_ICON: Record<ToolCall['state'], { icon: string; bg: string; fg: string; spin: boolean }> = {
  done: { icon: '✓', bg: 'rgba(5,150,105,0.15)', fg: 'var(--green)', spin: false },
  run: { icon: '⚡', bg: 'rgba(37,99,235,0.15)', fg: 'var(--blue)', spin: true },
  wait: { icon: '⏳', bg: 'rgba(217,119,6,0.15)', fg: 'var(--amber)', spin: false },
};

export function ToolCallBlock({ call }: ToolCallBlockProps) {
  const meta = STATE_ICON[call.state];
  const resultColor =
    call.resultTone === 'success'
      ? 'var(--green)'
      : call.resultTone === 'amber'
        ? 'var(--amber)'
        : 'var(--fg3)';

  return (
    <div
      className="my-2 px-3 py-2.5 rounded-lg text-xs"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div
        className="flex items-center gap-1.5 mb-1.5 font-medium"
        style={{ color: 'var(--fg3)' }}
      >
        <span
          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${meta.spin ? 'lp-sp' : ''}`}
          style={{ background: meta.bg, color: meta.fg }}
        >
          {meta.icon}
        </span>
        {call.label}
      </div>
      <div className="mono text-[11px] pl-[22px]" style={{ color: resultColor }}>
        {call.result}
      </div>
    </div>
  );
}
