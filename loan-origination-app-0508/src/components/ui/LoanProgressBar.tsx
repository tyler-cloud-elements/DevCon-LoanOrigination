import { LOAN_STAGES, type LoanStage } from '../../types/loan';

interface LoanProgressBarProps {
  stage: LoanStage;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
}

export function LoanProgressBar({ stage, onRefresh, refreshing, loading }: LoanProgressBarProps) {
  const currentIdx = loading ? -1 : LOAN_STAGES.indexOf(stage);

  return (
    <div
      className="flex-shrink-0 px-7 pt-4 pb-3.5 relative"
      style={{
        background: 'linear-gradient(180deg, var(--surface) 0%, var(--elevated) 100%)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh stage"
          title="Refresh stage"
          className="absolute top-2 right-3 w-6 h-6 rounded-md flex items-center justify-center text-[12px] disabled:opacity-60"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--fg3)',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              animation: refreshing ? 'lp-spin 0.8s linear infinite' : undefined,
            }}
          >
            ↻
          </span>
        </button>
      )}
      <div className="flex items-start relative">
        {LOAN_STAGES.map((s, i) => {
          const isLast = i === LOAN_STAGES.length - 1;

          if (loading) {
            return (
              <div key={s} className="flex-1 flex flex-col items-center min-w-0 relative">
                {!isLast && (
                  <span
                    className="absolute h-0.5 z-0"
                    style={{
                      top: 13,
                      left: 'calc(50% + 16px)',
                      right: 'calc(-50% + 16px)',
                      background: 'var(--border)',
                    }}
                  />
                )}
                <div
                  className="lp-shimmer-wrap w-[26px] h-[26px] rounded-full relative z-10"
                  style={{ background: 'var(--elevated)', border: '2px solid var(--border)' }}
                />
                <div
                  className="lp-shimmer-wrap rounded mt-2"
                  style={{ width: 64, height: 11, background: 'var(--elevated)' }}
                />
                <div
                  className="lp-shimmer-wrap rounded"
                  style={{ width: 28, height: 8, marginTop: 4, background: 'var(--elevated)' }}
                />
              </div>
            );
          }

          const done = i < currentIdx;
          const current = i === currentIdx;

          const labelColor = done ? 'var(--green)' : current ? 'var(--blue)' : 'var(--fg3)';
          const labelWeight = current ? 700 : done ? 600 : 500;
          const subColor = done ? 'var(--green)' : current ? 'var(--blue)' : 'var(--fg4)';
          const subText = done ? 'Done' : current ? 'Active' : i === currentIdx + 1 ? 'Next' : '·';

          let nodeBg = 'var(--surface)';
          let nodeBorder = 'var(--border)';
          let nodeColor = 'var(--fg4)';
          let nodeShadow: string | undefined;
          let nodeAnim = '';
          if (done) {
            nodeBg = 'var(--green)';
            nodeBorder = 'var(--green)';
            nodeColor = '#fff';
          } else if (current) {
            nodeBg = 'var(--blue)';
            nodeBorder = 'var(--blue)';
            nodeColor = '#fff';
            nodeShadow = '0 0 0 4px rgba(37,99,235,0.18)';
            nodeAnim = 'lp-stage-pulse';
          }

          let connectorBg = 'var(--border)';
          if (done) connectorBg = 'var(--green)';
          else if (current)
            connectorBg =
              'linear-gradient(90deg,var(--blue) 0%,var(--blue) 40%,var(--border) 40%,var(--border) 100%)';

          return (
            <div key={s} className="flex-1 flex flex-col items-center min-w-0 relative">
              {!isLast && (
                <span
                  className="absolute h-0.5 z-0"
                  style={{
                    top: 13,
                    left: 'calc(50% + 16px)',
                    right: 'calc(-50% + 16px)',
                    background: connectorBg,
                  }}
                />
              )}
              <div
                className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-bold relative z-10 transition-all ${nodeAnim}`}
                style={{
                  background: nodeBg,
                  border: `2px solid ${nodeBorder}`,
                  color: nodeColor,
                  boxShadow: nodeShadow,
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <div
                className="text-[11px] mt-2 whitespace-nowrap"
                style={{ color: labelColor, fontWeight: labelWeight }}
              >
                {s}
              </div>
              <div
                className="text-[9px] uppercase tracking-[0.4px] font-semibold"
                style={{ color: subColor, marginTop: 1 }}
              >
                {subText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
