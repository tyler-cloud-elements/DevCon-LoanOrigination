interface ActionCardProps {
  label: string;
  text: string;
  approveLabel?: string;
  secondaryLabel?: string;
  onApprove?: () => void;
  onSecondary?: () => void;
  approving?: boolean;
}

export function ActionCard({
  label,
  text,
  approveLabel = 'Approve',
  secondaryLabel,
  onApprove,
  onSecondary,
  approving,
}: ActionCardProps) {
  return (
    <div
      className="mt-2.5 px-3.5 py-3 rounded-[10px]"
      style={{
        background: 'var(--purple-bg)',
        border: '1px solid var(--purple-bd)',
      }}
    >
      <div className="text-[11px] font-semibold mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--purple)' }}>
        ★ {label}
      </div>
      <div className="text-[13px] leading-relaxed mb-2.5" style={{ color: 'var(--fg2)' }}>
        {text}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onApprove}
          disabled={approving}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-60"
          style={{ background: 'var(--green)' }}
          onMouseOver={(e) => {
            if (!approving) (e.currentTarget as HTMLButtonElement).style.background = '#047857';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--green)';
          }}
        >
          {approving ? 'Approving…' : approveLabel}
        </button>
        {secondaryLabel && (
          <button
            onClick={onSecondary}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              background: 'var(--surface)',
              color: 'var(--fg2)',
              border: '1px solid var(--border)',
            }}
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
