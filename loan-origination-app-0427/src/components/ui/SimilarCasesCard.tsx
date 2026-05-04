import { Card } from './Card';

interface SimilarCase {
  matchPct: number;
  name: string;
  caseId: string;
  reason: string;
  outcome: 'Approved' | 'Declined';
}

const DEFAULT_CASES: SimilarCase[] = [
  {
    matchPct: 94,
    name: 'Ethan Miller',
    caseId: 'LA-2026-00612',
    reason: 'W-2, employment change mid-process, DTI 30-32%',
    outcome: 'Approved',
  },
  {
    matchPct: 87,
    name: 'Aisha Khan',
    caseId: 'LA-2026-00489',
    reason: 'First-time buyer, Austin TX, conv. 30yr, 740s credit',
    outcome: 'Approved',
  },
  {
    matchPct: 81,
    name: 'Marcus Lee',
    caseId: 'LA-2025-09821',
    reason: 'Employment gap + new offer, declined on reserves',
    outcome: 'Declined',
  },
];

export function SimilarCasesCard({ cases = DEFAULT_CASES }: { cases?: SimilarCase[] }) {
  return (
    <Card style={{ borderColor: 'var(--purple-bd)' }}>
      <div
        className="px-4 py-3 text-xs font-semibold flex justify-between items-center"
        style={{ background: 'var(--purple-bg)', color: 'var(--purple)' }}
      >
        <span>★ Similar Cases</span>
        <span className="text-[9px]" style={{ color: 'var(--fg4)', fontWeight: 400 }}>
          by Case Manager
        </span>
      </div>
      <div className="px-3 py-2.5">
        {cases.map((c, idx) => (
          <div
            key={c.caseId}
            className="flex items-center gap-2.5 py-2.5"
            style={{
              borderBottom: idx < cases.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <div className="w-10 text-center flex-shrink-0">
              <div className="text-[13px] font-bold" style={{ color: 'var(--purple)' }}>
                {c.matchPct}%
              </div>
              <div
                className="text-[9px] font-medium uppercase"
                style={{ color: 'var(--fg4)', marginTop: -2 }}
              >
                match
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-semibold flex items-center gap-1.5" style={{ color: 'var(--fg)' }}>
                {c.name}
                <span className="text-[10px] font-medium" style={{ color: 'var(--fg4)' }}>
                  {c.caseId}
                </span>
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: 'var(--fg3)' }}>
                {c.reason}
              </div>
            </div>
            <span
              className="flex-shrink-0 px-2 py-0.5 rounded-[10px] text-[10px] font-semibold"
              style={{
                background: c.outcome === 'Approved' ? 'var(--green-bg)' : 'var(--red-bg)',
                color: c.outcome === 'Approved' ? 'var(--green)' : 'var(--red)',
              }}
            >
              {c.outcome}
            </span>
          </div>
        ))}
        <div
          className="mt-2 pt-2 text-[11px] leading-relaxed"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--fg3)' }}
        >
          <b style={{ color: 'var(--fg)' }}>Precedent:</b> 2 of 3 similar mid-process employment-change cases approved after re-verification.
        </div>
      </div>
    </Card>
  );
}
