interface ReasoningBlockProps {
  children: string;
}

export function ReasoningBlock({ children }: ReasoningBlockProps) {
  return (
    <div
      className="relative my-2 p-3 rounded-lg mono text-xs leading-relaxed"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderLeft: '3px solid var(--purple)',
        color: 'var(--fg3)',
      }}
    >
      <span
        className="absolute -top-2 left-3 text-[8px] font-bold tracking-[1px] px-2 py-[1px] rounded-[3px]"
        style={{
          background: 'var(--purple)',
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        REASONING
      </span>
      {children}
    </div>
  );
}
