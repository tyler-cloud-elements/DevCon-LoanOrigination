import type { LoanDetailData, LoanStage, TimelineEvent } from '../../types/loan';
import { buildTimelineForStage } from '../../data/stageContent';

interface HistoryTabProps {
  data: LoanDetailData;
  stage: LoanStage;
}

const DOT_COLORS: Record<TimelineEvent['dot'], { bg: string; ring: string }> = {
  purple: { bg: 'var(--purple)', ring: 'var(--purple-bd)' },
  green: { bg: 'var(--green)', ring: 'var(--green-bd)' },
  blue: { bg: 'var(--blue)', ring: 'var(--blue-bd)' },
  amber: { bg: 'var(--amber)', ring: 'var(--amber-bd)' },
};

export function HistoryTab({ stage }: HistoryTabProps) {
  const timeline = buildTimelineForStage(stage);
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      <div className="relative pl-7">
        {timeline.map((item, idx) => {
          const dot = DOT_COLORS[item.dot];
          const isLast = idx === timeline.length - 1;
          return (
            <div key={item.id} className="relative mb-5 last:mb-0">
              {!isLast && (
                <span
                  className="absolute left-[-22px] top-[18px] bottom-[-20px] w-0.5"
                  style={{ background: 'var(--border)' }}
                />
              )}
              <span
                className="absolute left-[-28px] top-[3px] w-3 h-3 rounded-full"
                style={{
                  background: dot.bg,
                  boxShadow: `0 0 0 2px ${dot.ring}`,
                  border: '2px solid var(--surface)',
                }}
              />
              <div
                className="rounded-lg px-3.5 py-2.5"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--fg)' }}>
                    {item.title}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--fg4)' }}>
                    {item.time}
                  </span>
                </div>
                <div className="text-xs leading-relaxed mt-1" style={{ color: 'var(--fg3)' }}>
                  {item.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
