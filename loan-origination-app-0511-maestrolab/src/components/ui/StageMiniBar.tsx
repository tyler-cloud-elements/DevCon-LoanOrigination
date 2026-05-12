import { LOAN_STAGES, type LoanStage } from '../../types/loan';

interface StageMiniBarProps {
  stage: LoanStage;
}

export function StageMiniBar({ stage }: StageMiniBarProps) {
  const currentIdx = LOAN_STAGES.indexOf(stage);
  return (
    <div className="flex gap-[2px] w-[72px]">
      {LOAN_STAGES.map((s, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;
        const bg = done ? 'var(--green)' : current ? 'var(--blue)' : 'var(--border)';
        return (
          <div
            key={s}
            className={`flex-1 h-[3px] rounded-[2px] ${current ? 'lp-sp' : ''}`}
            style={{ background: bg }}
            aria-label={s}
          />
        );
      })}
    </div>
  );
}
